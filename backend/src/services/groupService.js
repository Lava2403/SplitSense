const pool = require("../../db");

// ==========================
// RESOLVE USER ID
// ==========================
const resolveUserId = async (client, value) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const raw = String(value).trim();

  if (/^\d+$/.test(raw)) {
    return Number(raw);
  }

  const result = await client.query(
    `
    SELECT id
    FROM users
    WHERE LOWER(name) = LOWER($1)
       OR LOWER(email) = LOWER($1)
    LIMIT 1
    `,
    [raw]
  );

  return result.rows[0]?.id || null;
};

// ==========================
// RESOLVE MEMBERS
// ==========================
const resolveMemberIds = async (
  client,
  members = [],
  createdBy
) => {
  const ids = new Set();

  // Creator must always be a member
  if (createdBy) {
    ids.add(Number(createdBy));
  }

  for (const member of members) {
    const userId = await resolveUserId(client, member);

    if (!userId) {
      const error = new Error(
        `No SplitSense account found for "${member}". Ask them to sign up first.`
      );

      error.statusCode = 400;

      throw error;
    }

    ids.add(Number(userId));
  }

  return [...ids];
};

// ==========================
// EXPENSE QUERY
// ==========================
// ==========================
// EXPENSE QUERY
// ==========================
const expenseSelect = `
  SELECT
    e.id,
    e.group_id,
    e.title,
    e.amount,
    e.expense_date AS date,
    e.paid_by AS "paidById",
    payer.name AS "paidBy",

    COALESCE(
      ARRAY_AGG(participant.name)
      FILTER (
        WHERE participant.name IS NOT NULL
      ),
      '{}'
    ) AS participants,

    COALESCE(
      ARRAY_AGG(participant.id)
      FILTER (
        WHERE participant.id IS NOT NULL
      ),
      ARRAY[]::int[]
    ) AS "participantIds",

    COALESCE(
      JSON_AGG(
        JSON_BUILD_OBJECT(
          'userId',
          es.user_id,
          'amount',
          es.amount
        )
        ORDER BY es.user_id
      )
      FILTER (
        WHERE es.user_id IS NOT NULL
      ),
      '[]'
    ) AS splits

  FROM expenses e

  JOIN users payer
    ON payer.id = e.paid_by

  LEFT JOIN expense_splits es
    ON es.expense_id = e.id

  LEFT JOIN users participant
    ON participant.id = es.user_id
`;


const attachGroupMembers = async (group) => {
  const membersResult = await pool.query(
    `
    SELECT
      u.id,
      u.name,
      u.email

    FROM group_members gm

    JOIN users u
      ON u.id = gm.user_id

    WHERE gm.group_id = $1

    ORDER BY u.name
    `,
    [group.id]
  );

  group.memberDetails = membersResult.rows;

  return group;
};

const userHasGroupAccess = async (groupId, userId) => {
  const result = await pool.query(
    `
    SELECT 1

    FROM group_members

    WHERE group_id = $1
      AND user_id = $2

    LIMIT 1
    `,
    [groupId, userId]
  );

  return result.rows.length > 0;
};


const isGroupOwner = async (groupId, userId) => {
  const result = await pool.query(
    `
    SELECT 1

    FROM groups

    WHERE id = $1
      AND created_by = $2

    LIMIT 1
    `,
    [groupId, userId]
  );

  return result.rows.length > 0;
};


const getAllGroups = async (userId) => {
  const result = await pool.query(
    `
    SELECT
      g.id,
      g.name,
      g.description,
      g.created_at,

      COALESCE(
        ARRAY_AGG(DISTINCT u.name)
        FILTER (
          WHERE u.name IS NOT NULL
        ),
        '{}'
      ) AS members

    FROM groups g

    JOIN group_members current_member
      ON current_member.group_id = g.id
      AND current_member.user_id = $1

    LEFT JOIN group_members gm
      ON g.id = gm.group_id

    LEFT JOIN users u
      ON gm.user_id = u.id

    GROUP BY
      g.id

    ORDER BY
      g.created_at DESC
    `,
    [userId]
  );

  const groups = result.rows;

  const groupIds = groups.map((group) => group.id);

  let expenses = [];

  if (groupIds.length > 0) {
    const expenseResult = await pool.query(
      `
      ${expenseSelect}

      WHERE e.group_id = ANY($1::int[])

      GROUP BY
        e.id,
        payer.name

      ORDER BY
        e.expense_date DESC
      `,
      [groupIds]
    );

    expenses = expenseResult.rows;
  }

  const expensesByGroup = {};

  for (const expense of expenses) {
    if (!expensesByGroup[expense.group_id]) {
      expensesByGroup[expense.group_id] = [];
    }

    expensesByGroup[expense.group_id].push(expense);
  }

  for (const group of groups) {
    group.expenses =
      expensesByGroup[group.id] || [];

    await attachGroupMembers(group);
  }

  return groups;
};

const getGroupById = async (
  id,
  userId
) => {
  const hasAccess =
    await userHasGroupAccess(id, userId);

  if (!hasAccess) {
    return null;
  }

  const groupResult = await pool.query(
    `
    SELECT
      g.id,
      g.name,
      g.description,
      g.created_at,
      g.created_by,

      COALESCE(
        ARRAY_AGG(DISTINCT u.name)
        FILTER (
          WHERE u.name IS NOT NULL
        ),
        '{}'
      ) AS members

    FROM groups g

    LEFT JOIN group_members gm
      ON g.id = gm.group_id

    LEFT JOIN users u
      ON gm.user_id = u.id

    WHERE g.id = $1

    GROUP BY
      g.id
    `,
    [id]
  );

  if (groupResult.rows.length === 0) {
    return null;
  }

  const expenseResult = await pool.query(
    `
    ${expenseSelect}

    WHERE e.group_id = $1

    GROUP BY
      e.id,
      payer.name

    ORDER BY
      e.expense_date DESC
    `,
    [id]
  );

  const group = groupResult.rows[0];

  group.expenses = expenseResult.rows;

  await attachGroupMembers(group);

  return group;
};

const createGroup = async (groupData) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const {
      name,
      description,
      created_by,
      members = [],
    } = groupData;

    if (!name?.trim()) {
      const error = new Error(
        "Group name is required."
      );

      error.statusCode = 400;

      throw error;
    }

    if (!created_by) {
      const error = new Error(
        "You must be logged in to create a group."
      );

      error.statusCode = 401;

      throw error;
    }

    const memberIds =
      await resolveMemberIds(
        client,
        members,
        created_by
      );

    const groupResult =
      await client.query(
        `
        INSERT INTO groups
        (
          name,
          description,
          created_by
        )

        VALUES
        (
          $1,
          $2,
          $3
        )

        RETURNING *
        `,
        [
          name.trim(),
          description?.trim() || null,
          created_by,
        ]
      );

    const group = groupResult.rows[0];

    for (const userId of memberIds) {
      await client.query(
        `
        INSERT INTO group_members
        (
          group_id,
          user_id
        )

        VALUES
        (
          $1,
          $2
        )

        ON CONFLICT
        (
          group_id,
          user_id
        )
        DO NOTHING
        `,
        [
          group.id,
          userId,
        ]
      );
    }

    await client.query("COMMIT");

    await attachGroupMembers(group);

    group.expenses = [];

    return group;

  } catch (err) {
    await client.query("ROLLBACK");

    throw err;

  } finally {
    client.release();
  }
};


const addMemberToGroup = async (
  groupId,
  email,
  requestingUserId
) => {
  const hasAccess =
    await userHasGroupAccess(
      groupId,
      requestingUserId
    );

  if (!hasAccess) {
    const error = new Error(
      "You do not have access to this group."
    );

    error.statusCode = 403;

    throw error;
  }

  const normalizedEmail =
    email.trim().toLowerCase();

  const userResult =
    await pool.query(
      `
      SELECT
        id,
        name,
        email

      FROM users

      WHERE LOWER(email) = $1
      `,
      [normalizedEmail]
    );

  const user = userResult.rows[0];

  if (!user) {
    const error = new Error(
      "No SplitSense account found with this email. Ask them to sign up first."
    );

    error.statusCode = 404;

    throw error;
  }

  const existingMember =
    await pool.query(
      `
      SELECT 1

      FROM group_members

      WHERE group_id = $1
        AND user_id = $2
      `,
      [
        groupId,
        user.id,
      ]
    );

  if (existingMember.rows.length > 0) {
    const error = new Error(
      "This user is already a member of the group."
    );

    error.statusCode = 409;

    throw error;
  }

  await pool.query(
    `
    INSERT INTO group_members
    (
      group_id,
      user_id
    )

    VALUES
    (
      $1,
      $2
    )
    `,
    [
      groupId,
      user.id,
    ]
  );

  return user;
};


const updateGroup = async (
  id,
  updatedData,
  userId
) => {
  const isOwner =
    await isGroupOwner(id, userId);

  if (!isOwner) {
    return null;
  }

  const {
    name,
    description,
  } = updatedData;

  const result =
    await pool.query(
      `
      UPDATE groups

      SET
        name = $1,
        description = $2

      WHERE id = $3

      RETURNING *
      `,
      [
        name?.trim(),
        description?.trim() || null,
        id,
      ]
    );

  return result.rows[0] || null;
};

const deleteGroup = async (
  id,
  userId
) => {
  const isOwner =
    await isGroupOwner(id, userId);

  if (!isOwner) {
    return null;
  }

  const result =
    await pool.query(
      `
      DELETE FROM groups

      WHERE id = $1

      RETURNING *
      `,
      [id]
    );

  return result.rows[0] || null;
};

module.exports = {
  getAllGroups,
  getGroupById,
  createGroup,
  addMemberToGroup,
  updateGroup,
  deleteGroup,
};