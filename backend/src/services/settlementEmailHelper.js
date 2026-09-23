const pool = require("../../db");

const calculateUserOutstandingPayments = async (
  userId
) => {

 

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


    
    if (paidBy === Number(userId)) {

      const othersOwe =
        totalAmount - userShare;

      continue;
    }
  }


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




    if (
      payerId !== Number(userId) &&
      participantId !== Number(userId)
    ) {
      continue;
    }


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
  }


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
  }


  
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