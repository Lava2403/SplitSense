const pool = require("../../db");

const VALID_CATEGORIES = [
  "Food",
  "Groceries",
  "Travel",
  "Shopping",
  "Entertainment",
  "Rent & Bills",
  "Education",
  "Health",
  "Other",
];

const resolveUserId = async (client, value) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const raw = String(value).trim();

  if (/^\d+$/.test(raw)) {
    return Number(raw);
  }

  const result = await client.query(
    `SELECT id
     FROM users
     WHERE LOWER(name) = LOWER($1)
        OR LOWER(email) = LOWER($1)
     LIMIT 1`,
    [raw]
  );

  return result.rows[0]?.id || null;
};

const resolveParticipantIds = async (client, participants = []) => {
  const ids = [];

  for (const participant of participants) {
    const userId = await resolveUserId(client, participant);

    if (!userId) {
      const error = new Error(
        `No SplitSense account found for "${participant}".`
      );
      error.statusCode = 400;
      throw error;
    }

    ids.push(Number(userId));
  }

  return [...new Set(ids)];
};

const validateCategory = (category) => {
  if (!category) {
    return "Other";
  }

  if (!VALID_CATEGORIES.includes(category)) {
    const error = new Error(
      `Invalid category. Allowed categories are: ${VALID_CATEGORIES.join(", ")}.`
    );

    error.statusCode = 400;
    throw error;
  }

  return category;
};

// ==========================
// GET ALL EXPENSES
// ==========================

const getAllExpenses = async (userId) => {
  const result = await pool.query(
    `
    SELECT
      e.id,
      e.group_id,
      e.title,
      e.amount,
      e.category,
      e.expense_date AS date,
      g.name AS "groupName",
      payer.name AS "paidBy",

      COALESCE(
        ARRAY_AGG(participant.name)
        FILTER (WHERE participant.name IS NOT NULL),
        '{}'
      ) AS participants

    FROM expenses e

    JOIN groups g
      ON e.group_id = g.id

    JOIN group_members gm_access
      ON gm_access.group_id = g.id
      AND gm_access.user_id = $1

    JOIN users payer
      ON e.paid_by = payer.id

    LEFT JOIN expense_splits es
      ON e.id = es.expense_id

    LEFT JOIN users participant
      ON es.user_id = participant.id

    GROUP BY
      e.id,
      g.name,
      payer.name

    ORDER BY e.expense_date DESC, e.id DESC;
    `,
    [userId]
  );

  return result.rows;
};

// ==========================
// GET ONE EXPENSE
// ==========================

const getExpenseById = async (id, userId) => {
  const result = await pool.query(
    `
    SELECT
      e.id,
      e.group_id,
      e.title,
      e.amount,
      e.category,
      e.expense_date AS date,
      g.name AS "groupName",
      payer.name AS "paidBy",

      COALESCE(
        ARRAY_AGG(participant.name)
        FILTER (WHERE participant.name IS NOT NULL),
        '{}'
      ) AS participants

    FROM expenses e

    JOIN groups g
      ON e.group_id = g.id

    JOIN group_members gm_access
      ON gm_access.group_id = g.id
      AND gm_access.user_id = $2

    JOIN users payer
      ON e.paid_by = payer.id

    LEFT JOIN expense_splits es
      ON e.id = es.expense_id

    LEFT JOIN users participant
      ON es.user_id = participant.id

    WHERE e.id = $1

    GROUP BY
      e.id,
      g.name,
      payer.name;
    `,
    [id, userId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
};

// ==========================
// CREATE EXPENSE
// ==========================

const addExpense = async (expenseData, userId) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const {
      group_id,
      paid_by,
      paidBy,
      title,
      amount,
      category,
      expense_date,
      date,
      participants,
    } = expenseData;

    if (
      !group_id ||
      !title?.trim() ||
      amount === undefined ||
      !participants?.length
    ) {
      const error = new Error(
        "Group, title, amount, and participants are required."
      );
      error.statusCode = 400;
      throw error;
    }

    const groupAccess = await client.query(
      `
      SELECT id
      FROM group_members
      WHERE group_id = $1
        AND user_id = $2
      `,
      [group_id, userId]
    );

    if (groupAccess.rows.length === 0) {
      const error = new Error(
        "You do not have permission to add expenses to this group."
      );
      error.statusCode = 403;
      throw error;
    }

    const validCategory = validateCategory(category);

    const payerId = await resolveUserId(
      client,
      paid_by || paidBy
    );

    const participantIds = await resolveParticipantIds(
      client,
      participants
    );

    const expenseDate =
      expense_date || date || new Date();

    if (!payerId) {
      const error = new Error(
        "Paid by must be a valid SplitSense user."
      );
      error.statusCode = 400;
      throw error;
    }

    const groupMembersResult = await client.query(
      `
      SELECT user_id
      FROM group_members
      WHERE group_id = $1
      `,
      [group_id]
    );

    const groupMemberIds = new Set(
      groupMembersResult.rows.map((row) =>
        Number(row.user_id)
      )
    );

    if (!groupMemberIds.has(Number(payerId))) {
      const error = new Error(
        "The person who paid must be a member of this group."
      );
      error.statusCode = 400;
      throw error;
    }

    for (const participantId of participantIds) {
      if (!groupMemberIds.has(Number(participantId))) {
        const error = new Error(
          "All participants must be members of this group."
        );
        error.statusCode = 400;
        throw error;
      }
    }

    if (!participantIds.includes(Number(payerId))) {
      participantIds.push(Number(payerId));
    }

    const expenseResult = await client.query(
      `
      INSERT INTO expenses
      (
        group_id,
        paid_by,
        title,
        amount,
        category,
        expense_date
      )
      VALUES
      ($1, $2, $3, $4, $5, $6)
      RETURNING *;
      `,
      [
        group_id,
        payerId,
        title.trim(),
        amount,
        validCategory,
        expenseDate,
      ]
    );

    const expense = expenseResult.rows[0];

    const splitAmount =
      Number(amount) / participantIds.length;

    for (const participantId of participantIds) {
      await client.query(
        `
        INSERT INTO expense_splits
        (
          expense_id,
          user_id,
          amount
        )
        VALUES
        ($1, $2, $3)
        `,
        [
          expense.id,
          participantId,
          splitAmount,
        ]
      );
    }

    await client.query("COMMIT");

    return expense;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

// ==========================
// UPDATE EXPENSE
// ==========================

const updateExpense = async (
  id,
  updatedData,
  userId
) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const existingResult = await client.query(
      `
      SELECT e.*
      FROM expenses e
      JOIN group_members gm
        ON gm.group_id = e.group_id
      WHERE e.id = $1
        AND gm.user_id = $2
      `,
      [id, userId]
    );

    if (existingResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return null;
    }

    const existing = existingResult.rows[0];

    const title =
      updatedData.title ?? existing.title;

    const amount =
      updatedData.amount ?? existing.amount;

    const category =
      updatedData.category !== undefined
        ? validateCategory(updatedData.category)
        : existing.category;

    const expenseDate =
      updatedData.expense_date ||
      updatedData.date ||
      existing.expense_date;

    let payerId = existing.paid_by;

    if (
      updatedData.paid_by !== undefined ||
      updatedData.paidBy !== undefined
    ) {
      const resolvedPayer =
        await resolveUserId(
          client,
          updatedData.paid_by ??
            updatedData.paidBy
        );

      if (!resolvedPayer) {
        const error = new Error(
          "Paid by must be a valid SplitSense user."
        );
        error.statusCode = 400;
        throw error;
      }

      payerId = resolvedPayer;
    }

    const groupMembersResult = await client.query(
      `
      SELECT user_id
      FROM group_members
      WHERE group_id = $1
      `,
      [existing.group_id]
    );

    const groupMemberIds = new Set(
      groupMembersResult.rows.map((row) =>
        Number(row.user_id)
      )
    );

    if (!groupMemberIds.has(Number(payerId))) {
      const error = new Error(
        "The person who paid must be a member of this group."
      );
      error.statusCode = 400;
      throw error;
    }

    const result = await client.query(
      `
      UPDATE expenses
      SET
        title = $1,
        amount = $2,
        category = $3,
        expense_date = $4,
        paid_by = $5
      WHERE id = $6
      RETURNING *;
      `,
      [
        title.trim(),
        amount,
        category,
        expenseDate,
        payerId,
        id,
      ]
    );

    let participantIds;

    if (updatedData.participants !== undefined) {
      participantIds =
        await resolveParticipantIds(
          client,
          updatedData.participants
        );
    } else {
      const currentSplits =
        await client.query(
          `
          SELECT user_id
          FROM expense_splits
          WHERE expense_id = $1
          `,
          [id]
        );

      participantIds =
        currentSplits.rows.map((row) =>
          Number(row.user_id)
        );
    }

    if (!participantIds.length) {
      const error = new Error(
        "At least one participant is required."
      );
      error.statusCode = 400;
      throw error;
    }

    for (const participantId of participantIds) {
      if (
        !groupMemberIds.has(
          Number(participantId)
        )
      ) {
        const error = new Error(
          "All participants must be members of this group."
        );
        error.statusCode = 400;
        throw error;
      }
    }

    await client.query(
      `
      DELETE FROM expense_splits
      WHERE expense_id = $1
      `,
      [id]
    );

    const splitAmount =
      Number(amount) / participantIds.length;

    for (const participantId of participantIds) {
      await client.query(
        `
        INSERT INTO expense_splits
        (expense_id, user_id, amount)
        VALUES ($1, $2, $3)
        `,
        [
          id,
          participantId,
          splitAmount,
        ]
      );
    }

    await client.query("COMMIT");

    return result.rows[0];
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

// ==========================
// DELETE EXPENSE
// ==========================

const deleteExpense = async (
  id,
  userId
) => {
  const result = await pool.query(
    `
    DELETE FROM expenses e
    USING group_members gm
    WHERE e.id = $1
      AND gm.group_id = e.group_id
      AND gm.user_id = $2
    RETURNING e.*;
    `,
    [id, userId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
};

module.exports = {
  getAllExpenses,
  getExpenseById,
  addExpense,
  updateExpense,
  deleteExpense,
  VALID_CATEGORIES,
};