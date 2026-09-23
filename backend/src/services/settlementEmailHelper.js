const pool = require("../../db");


// ======================================================
// CALCULATE USER OUTSTANDING PAYMENTS
// ======================================================
//
// Returns who the current user owes and how much.
//
// Example:
//
// [
//   {
//     recipientId: 12,
//     recipientName: "Nishant",
//     recipientEmail: "...",
//     groupName: "Goa Trip",
//     amount: 850
//   }
// ]
//
// This uses the actual expense_splits amounts.
// ======================================================

const calculateUserOutstandingPayments = async (
  userId
) => {

  // ----------------------------------------------------
  // Get all expenses and their actual split amounts.
  // ----------------------------------------------------

  const expenseResult =
    await pool.query(
      `
        SELECT
          e.id,
          e.group_id,
          e.paid_by,

          COALESCE(
            SUM(
              CASE
                WHEN es.user_id = $1
                THEN es.amount
                ELSE 0
              END
            ),
            0
          ) AS user_share,

          COALESCE(
            SUM(es.amount),
            0
          ) AS total_amount

        FROM expenses e

        JOIN expense_splits es
          ON es.expense_id = e.id

        GROUP BY
          e.id,
          e.group_id,
          e.paid_by
      `,
      [userId]
    );


  // ----------------------------------------------------
  // Build net balances.
  //
  // Positive value for another user means:
  // current user owes that person.
  //
  // Negative value means:
  // that person owes current user.
  // ----------------------------------------------------

  const balances = new Map();


  for (
    const expense
    of expenseResult.rows
  ) {

    const paidBy =
      Number(expense.paid_by);

    const userShare =
      Number(expense.user_share || 0);

    const totalAmount =
      Number(expense.total_amount || 0);


    // User paid the expense.
    //
    // Everyone else's shares are owed to user.
    if (paidBy === Number(userId)) {

      const othersOwe =
        totalAmount - userShare;

      // We'll handle the exact person-to-person
      // relationship below.
      continue;
    }
  }


  // ----------------------------------------------------
  // Calculate person-to-person balances directly.
  //
  // For every expense:
  //
  // if Nishant paid ₹1000 and Lavanya's split is ₹300,
  // Lavanya owes Nishant ₹300.
  //
  // If Lavanya paid ₹1000 and Nishant's split is ₹300,
  // Nishant owes Lavanya ₹300.
  // ----------------------------------------------------

  const detailedResult =
    await pool.query(
      `
        SELECT
          e.id AS expense_id,
          e.group_id,
          e.paid_by,

          payer.name AS payer_name,
          payer.email AS payer_email,

          g.name AS group_name,

          es.user_id AS participant_id,
          participant.name AS participant_name,
          participant.email AS participant_email,

          es.amount AS participant_share

        FROM expenses e

        JOIN users payer
          ON payer.id = e.paid_by

        JOIN groups g
          ON g.id = e.group_id

        JOIN expense_splits es
          ON es.expense_id = e.id

        JOIN users participant
          ON participant.id = es.user_id

        WHERE
          e.paid_by <> es.user_id

        ORDER BY
          e.group_id,
          e.id
      `
    );


  // ----------------------------------------------------
  // Person-pair balances
  // ----------------------------------------------------

  const pairBalances =
    new Map();


  for (
    const row
    of detailedResult.rows
  ) {

    const payerId =
      Number(row.paid_by);

    const participantId =
      Number(row.participant_id);

    const share =
      Number(row.participant_share || 0);


    // We only care about transactions involving
    // the current user.

    if (
      payerId !== Number(userId) &&
      participantId !== Number(userId)
    ) {
      continue;
    }


    // --------------------------------------------------
    // User owes payer
    // --------------------------------------------------

    if (
      participantId === Number(userId)
    ) {

      const key =
        `${userId}-${payerId}`;

      if (!pairBalances.has(key)) {
        pairBalances.set(key, {
          otherUserId: payerId,
          otherUserName:
            row.payer_name,
          otherUserEmail:
            row.payer_email,
          groupId:
            Number(row.group_id),
          groupName:
            row.group_name,
          balance: 0,
        });
      }

      pairBalances.get(key).balance +=
        share;

      continue;
    }


    // --------------------------------------------------
    // User paid, another participant owes user
    //
    // This does NOT belong in "you owe" email.
    // --------------------------------------------------

  }


  // ----------------------------------------------------
  // Apply completed settlements.
  //
  // A settlement from the current user to someone
  // reduces the amount still owed.
  // ----------------------------------------------------

  const settlementResult =
    await pool.query(
      `
        SELECT
          payer_id,
          receiver_id,
          amount

        FROM settlements

        WHERE
          status = 'completed'
          AND (
            payer_id = $1
            OR receiver_id = $1
          )
      `,
      [userId]
    );


  for (
    const settlement
    of settlementResult.rows
  ) {

    const payerId =
      Number(settlement.payer_id);

    const receiverId =
      Number(settlement.receiver_id);

    const amount =
      Number(settlement.amount || 0);


    // User paid someone.
    // Reduce what user owes them.
    if (
      payerId === Number(userId)
    ) {

      const key =
        `${userId}-${receiverId}`;

      const existing =
        pairBalances.get(key);

      if (existing) {
        existing.balance -= amount;
      }

      continue;
    }


    // Someone paid the user.
    // This doesn't reduce what user owes them.
    // It is relevant only if there was a reverse
    // balance, which isn't included in this email.
  }


  // ----------------------------------------------------
  // Return only positive outstanding amounts.
  // ----------------------------------------------------

  return Array.from(
    pairBalances.values()
  )
    .filter(
      (item) =>
        item.balance > 0.01
    )
    .map(
      (item) => ({
        recipientId:
          item.otherUserId,

        recipientName:
          item.otherUserName,

        recipientEmail:
          item.otherUserEmail,

        groupId:
          item.groupId,

        groupName:
          item.groupName,

        amount:
          Number(
            item.balance.toFixed(2)
          ),
      })
    )
    .sort(
      (a, b) =>
        b.amount - a.amount
    );
};


module.exports = {
  calculateUserOutstandingPayments,
};