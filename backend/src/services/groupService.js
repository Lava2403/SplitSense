const pool = require("../../db");

const resolveUserId = async (client, value) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const raw = String(value).trim();

  if (/^\d+$/.test(raw)) {
    return Number(raw);
  }

  const result = await client.query(
    `SELECT id FROM users
     WHERE LOWER(name) = LOWER($1) OR LOWER(email) = LOWER($1)
     LIMIT 1`,
    [raw]
  );

  return result.rows[0]?.id || null;
};

const resolveMemberIds = async (client, members = [], createdBy) => {
  const ids = new Set();

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
          FILTER (WHERE participant.name IS NOT NULL),
          '{}'
      ) AS participants,
      COALESCE(
          ARRAY_AGG(participant.id)
          FILTER (WHERE participant.id IS NOT NULL),
          ARRAY[]::int[]
      ) AS "participantIds"
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
    SELECT u.id, u.name, u.email
    FROM group_members gm
    JOIN users u ON u.id = gm.user_id
    WHERE gm.group_id = $1
    ORDER BY u.name
    `,
    [group.id]
  );

  group.memberDetails = membersResult.rows;
  return group;
};

// ==========================
// GET ALL GROUPS
// ==========================
const getAllGroups = async () => {

  const result = await pool.query(`
    SELECT
      g.id,
      g.name,
      g.description,
      g.created_at,

      COALESCE(
        ARRAY_AGG(u.name)
        FILTER (WHERE u.name IS NOT NULL),
        '{}'
      ) AS members

    FROM groups g

    LEFT JOIN group_members gm
      ON g.id = gm.group_id

    LEFT JOIN users u
      ON gm.user_id = u.id

    GROUP BY
      g.id

    ORDER BY
      g.id;
  `);

  const groups = result.rows;
  const groupIds = groups.map((group) => group.id);

  let expenses = [];

  if (groupIds.length > 0) {
    const expenseResult = await pool.query(
      `
      ${expenseSelect}
      WHERE e.group_id = ANY($1::int[])
      GROUP BY e.id, payer.name
      ORDER BY e.expense_date DESC;
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
    group.expenses = expensesByGroup[group.id] || [];
    await attachGroupMembers(group);
  }

  return groups;

};

// ==========================
// GET GROUP BY ID
// ==========================
const getGroupById = async (id) => {

  // -------------------------
  // Get group details
  // -------------------------

  const groupResult = await pool.query(
    `
    SELECT
        g.id,
        g.name,
        g.description,

        COALESCE(
            ARRAY_AGG(DISTINCT u.name)
            FILTER (WHERE u.name IS NOT NULL),
            '{}'
        ) AS members

    FROM groups g

    LEFT JOIN group_members gm
        ON g.id = gm.group_id

    LEFT JOIN users u
        ON gm.user_id = u.id

    WHERE g.id = $1

    GROUP BY g.id;
    `,
    [id]
  );

  if (groupResult.rows.length === 0)
      return null;

  // -------------------------
  // Get expenses of this group
  // -------------------------

  const expenseResult = await pool.query(
    `
    ${expenseSelect}
    WHERE e.group_id = $1
    GROUP BY
        e.id,
        payer.name
    ORDER BY e.expense_date DESC;
    `,
    [id]
  );

  const group = groupResult.rows[0];

  group.expenses = expenseResult.rows;
  await attachGroupMembers(group);

  return group;
};
// ==========================
// CREATE GROUP
// ==========================
const createGroup = async (groupData) => {

  const client = await pool.connect();

  try {

    await client.query("BEGIN");

    const {
      name,
      description,
      created_by,
      members
    } = groupData;

    if (!name || !created_by) {
      const error = new Error("Group name and creator are required.");
      error.statusCode = 400;
      throw error;
    }

    const memberIds = await resolveMemberIds(client, members, created_by);

    // Create group
    const groupResult = await client.query(
      `
      INSERT INTO groups
      (name, description, created_by)

      VALUES
      ($1,$2,$3)

      RETURNING *;
      `,
      [
        name,
        description,
        created_by
      ]
    );

    const group = groupResult.rows[0];

    // Insert members
    if (memberIds.length > 0) {

      for (const userId of memberIds) {

        await client.query(
          `
          INSERT INTO group_members
          (group_id,user_id)

          VALUES
          ($1,$2)
          `,
          [
            group.id,
            userId
          ]
        );

      }

    }

    await client.query("COMMIT");

    return group;

  }

  catch (err) {

    await client.query("ROLLBACK");

    throw err;

  }

  finally {

    client.release();

  }

};

// ==========================
// UPDATE GROUP
// ==========================
const updateGroup = async (id, updatedData) => {

  const { name, description } = updatedData;

  const result = await pool.query(
    `
    UPDATE groups
    SET
      name=$1,
      description=$2
    WHERE id=$3
    RETURNING *;
    `,
    [name, description, id]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
};

// ==========================
// DELETE GROUP
// ==========================
const deleteGroup = async (id) => {

  const result = await pool.query(
    `
    DELETE FROM groups
    WHERE id=$1
    RETURNING *;
    `,
    [id]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
};

module.exports = {
  getAllGroups,
  getGroupById,
  createGroup,
  updateGroup,
  deleteGroup,
};