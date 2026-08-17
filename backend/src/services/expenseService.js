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

// ==========================
// GET ALL EXPENSES
// ==========================
const getAllExpenses = async () => {

  const result = await pool.query(`
    SELECT
      e.id,
      e.group_id,
      e.title,
      e.amount,

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

    ORDER BY e.id DESC;
  `);

  return result.rows;

};

// ==========================
// GET ONE EXPENSE
// ==========================
const getExpenseById = async (id) => {

  const result = await pool.query(`
    SELECT
      e.id,
      e.group_id,
      e.title,
      e.amount,

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

    JOIN users payer
      ON e.paid_by = payer.id

    LEFT JOIN expense_splits es
      ON e.id = es.expense_id

    LEFT JOIN users participant
      ON es.user_id = participant.id

    WHERE e.id=$1

    GROUP BY
      e.id,
      g.name,
      payer.name;
  `,
  [id]);

  if(result.rows.length===0)
      return null;

  return result.rows[0];

};

// ==========================
// CREATE EXPENSE
// ==========================
const addExpense = async (expenseData) => {

  const client = await pool.connect();

  try {

    await client.query("BEGIN");

    const {
      group_id,
      paid_by,
      paidBy,
      title,
      amount,
      expense_date,
      date,
      participants
    } = expenseData;

    if (!group_id || !title || amount === undefined || !participants?.length) {
      const error = new Error("Group, title, amount, and participants are required.");
      error.statusCode = 400;
      throw error;
    }

    const payerId = await resolveUserId(client, paid_by || paidBy);
    const participantIds = await resolveParticipantIds(client, participants);
    const expenseDate = expense_date || date || new Date();

    if (!payerId) {
      const error = new Error("Paid by must be a valid SplitSense user.");
      error.statusCode = 400;
      throw error;
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
        expense_date
      )

      VALUES
      ($1,$2,$3,$4,$5)

      RETURNING *;
      `,
      [
        group_id,
        payerId,
        title,
        amount,
        expenseDate
      ]
    );

    const expense = expenseResult.rows[0];

    const splitAmount =
      amount / participantIds.length;

    for (const userId of participantIds) {

      await client.query(
        `
        INSERT INTO expense_splits
        (
          expense_id,
          user_id,
          amount
        )

        VALUES
        ($1,$2,$3)
        `,
        [
          expense.id,
          userId,
          splitAmount
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
const updateExpense = async (id, updatedData) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const existingResult = await client.query(
      "SELECT * FROM expenses WHERE id = $1",
      [id]
    );

    if (existingResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return null;
    }

    const existing = existingResult.rows[0];
    const title = updatedData.title ?? existing.title;
    const amount = updatedData.amount ?? existing.amount;
    const expenseDate =
      updatedData.expense_date || updatedData.date || existing.expense_date;

    let payerId = existing.paid_by;

    if (updatedData.paid_by !== undefined || updatedData.paidBy !== undefined) {
      const resolvedPayer = await resolveUserId(
        client,
        updatedData.paid_by ?? updatedData.paidBy
      );

      if (!resolvedPayer) {
        const error = new Error("Paid by must be a valid SplitSense user.");
        error.statusCode = 400;
        throw error;
      }

      payerId = resolvedPayer;
    }

    const result = await client.query(
      `
      UPDATE expenses
      SET
        title=$1,
        amount=$2,
        expense_date=$3,
        paid_by=$4
      WHERE id=$5
      RETURNING *;
      `,
      [title, amount, expenseDate, payerId, id]
    );

    let participantIds = null;

    if (updatedData.participants) {
      participantIds = await resolveParticipantIds(client, updatedData.participants);
    } else {
      const currentSplits = await client.query(
        "SELECT user_id FROM expense_splits WHERE expense_id = $1",
        [id]
      );
      participantIds = currentSplits.rows.map((row) => Number(row.user_id));
    }

    if (participantIds.length > 0) {
      await client.query("DELETE FROM expense_splits WHERE expense_id = $1", [id]);
      const splitAmount = Number(amount) / participantIds.length;

      for (const userId of participantIds) {
        await client.query(
          `
          INSERT INTO expense_splits (expense_id, user_id, amount)
          VALUES ($1, $2, $3)
          `,
          [id, userId, splitAmount]
        );
      }
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
const deleteExpense = async (id) => {

  const result = await pool.query(
    `
    DELETE FROM expenses
    WHERE id=$1
    RETURNING *;
    `,
    [id]
  );

  if (result.rows.length === 0)
    return null;

  return result.rows[0];
};

module.exports = {
  getAllExpenses,
  getExpenseById,
  addExpense,
  updateExpense,
  deleteExpense,
};