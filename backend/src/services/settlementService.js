const pool = require("../../db");

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


const getUserGroups = async (userId) => {
  const result = await pool.query(
    `
      SELECT
        g.id,
        g.name
      FROM groups g

      JOIN group_members gm
        ON gm.group_id = g.id

      WHERE gm.user_id = $1

      ORDER BY g.name
    `,
    [userId]
  );

  return result.rows;
};


const calculateGroupBalances = async (groupId) => {
  const membersResult = await pool.query(
    `
      SELECT
        u.id,
        u.name
      FROM group_members gm

      JOIN users u
        ON u.id = gm.user_id

      WHERE gm.group_id = $1
    `,
    [groupId]
  );

  const balances = new Map();

  membersResult.rows.forEach((member) => {
    balances.set(member.id, {
      userId: member.id,
      name: member.name,
      balance: 0,
    });
  });


  const expensesResult = await pool.query(
    `
      SELECT
        e.id,
        e.amount,
        e.paid_by,

        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'userId', es.user_id,
              'amount', es.amount
            )
            ORDER BY es.user_id
          )
          FILTER (
            WHERE es.user_id IS NOT NULL
          ),
          '[]'
        ) AS splits

      FROM expenses e

      LEFT JOIN expense_splits es
        ON es.expense_id = e.id

      WHERE e.group_id = $1

      GROUP BY
        e.id,
        e.amount,
        e.paid_by

      ORDER BY e.id
    `,
    [groupId]
  );


  for (const expense of expensesResult.rows) {
    const amount = Number(expense.amount);

    const splits = Array.isArray(expense.splits)
      ? expense.splits
      : [];

    if (splits.length === 0) {
      continue;
    }


    if (balances.has(expense.paid_by)) {
      balances.get(expense.paid_by).balance += amount;
    }

    

    for (const split of splits) {
      const participantId = Number(
        split.userId ?? split.user_id
      );

      const share = Number(split.amount || 0);

      if (balances.has(participantId)) {
        balances.get(participantId).balance -= share;
      }
    }
  }


  const settlementsResult = await pool.query(
    `
      SELECT
        payer_id,
        receiver_id,
        amount
      FROM settlements
      WHERE group_id = $1
        AND status = 'completed'
    `,
    [groupId]
  );

  for (const settlement of settlementsResult.rows) {
    const amount = Number(settlement.amount);

    if (balances.has(settlement.payer_id)) {
      balances.get(settlement.payer_id).balance += amount;
    }

    if (balances.has(settlement.receiver_id)) {
      balances.get(settlement.receiver_id).balance -= amount;
    }
  }

  
  return [...balances.values()].map((person) => ({
    ...person,
    balance: Number(person.balance.toFixed(2)),
  }));
};


const simplifyBalances = (balances) => {
  const creditors = balances
    .filter((person) => person.balance > 0.01)
    .map((person) => ({
      ...person,
      amount: person.balance,
    }));

  const debtors = balances
    .filter((person) => person.balance < -0.01)
    .map((person) => ({
      ...person,
      amount: Math.abs(person.balance),
    }));

  const settlements = [];

  let debtorIndex = 0;
  let creditorIndex = 0;

  while (
    debtorIndex < debtors.length &&
    creditorIndex < creditors.length
  ) {
    const debtor = debtors[debtorIndex];
    const creditor = creditors[creditorIndex];

    const amount = Math.min(
      debtor.amount,
      creditor.amount
    );

    settlements.push({
      payerId: debtor.userId,
      payer: debtor.name,

      receiverId: creditor.userId,
      receiver: creditor.name,

      amount: Number(amount.toFixed(2)),
    });

    debtor.amount -= amount;
    creditor.amount -= amount;

    if (debtor.amount < 0.01) {
      debtorIndex++;
    }

    if (creditor.amount < 0.01) {
      creditorIndex++;
    }
  }

  return settlements;
};

const getPendingSettlements = async (userId) => {
  const groups = await getUserGroups(userId);

  const allSettlements = [];

  for (const group of groups) {
    const balances = await calculateGroupBalances(
      group.id
    );

    const settlements = simplifyBalances(balances);

    for (const settlement of settlements) {
      
      if (
        settlement.payerId === userId ||
        settlement.receiverId === userId
      ) {
        allSettlements.push({
          groupId: group.id,
          group: group.name,

          payerId: settlement.payerId,
          payer: settlement.payer,

          receiverId: settlement.receiverId,
          receiver: settlement.receiver,

          amount: settlement.amount,

          type:
            settlement.payerId === userId
              ? "pay"
              : "receive",
        });
      }
    }
  }

  return allSettlements;
};



const getSettlementSummary = async (userId) => {
  const settlements =
    await getPendingSettlements(userId);

  let youOwe = 0;
  let youAreOwed = 0;

  settlements.forEach((settlement) => {
    if (settlement.type === "pay") {
      youOwe += Number(settlement.amount);
    }

    if (settlement.type === "receive") {
      youAreOwed += Number(settlement.amount);
    }
  });

  return {
    youOwe: Number(youOwe.toFixed(2)),

    youAreOwed: Number(
      youAreOwed.toFixed(2)
    ),

    netBalance: Number(
      (youAreOwed - youOwe).toFixed(2)
    ),
  };
};


const createSettlement = async (
  settlementData,
  userId
) => {
  const {
    groupId,
    receiverId,
    amount,
    paymentMethod,
    transactionReference,
  } = settlementData;

  if (
    !groupId ||
    !receiverId ||
    !amount ||
    !paymentMethod
  ) {
    const error = new Error(
      "Group, receiver, amount and payment method are required."
    );

    error.statusCode = 400;

    throw error;
  }

  const numericGroupId = Number(groupId);

  const numericReceiverId =
    Number(receiverId);

  const numericAmount = Number(amount);

  if (
    !Number.isFinite(numericAmount) ||
    numericAmount <= 0
  ) {
    const error = new Error(
      "Settlement amount must be greater than zero."
    );

    error.statusCode = 400;

    throw error;
  }

  if (numericReceiverId === userId) {
    const error = new Error(
      "You cannot settle with yourself."
    );

    error.statusCode = 400;

    throw error;
  }

  const hasAccess =
    await userHasGroupAccess(
      numericGroupId,
      userId
    );

  if (!hasAccess) {
    const error = new Error(
      "You do not have access to this group."
    );

    error.statusCode = 403;

    throw error;
  }

  const receiverResult = await pool.query(
    `
      SELECT 1
      FROM group_members
      WHERE group_id = $1
        AND user_id = $2
      LIMIT 1
    `,
    [
      numericGroupId,
      numericReceiverId,
    ]
  );

  if (receiverResult.rows.length === 0) {
    const error = new Error(
      "The selected user is not a member of this group."
    );

    error.statusCode = 400;

    throw error;
  }

  const balances =
    await calculateGroupBalances(
      numericGroupId
    );

  const pendingSettlements =
    simplifyBalances(balances);

  const matchingSettlement =
    pendingSettlements.find(
      (settlement) =>
        settlement.payerId === userId &&
        settlement.receiverId ===
          numericReceiverId
    );

  if (!matchingSettlement) {
    const error = new Error(
      "No pending settlement was found for this user."
    );

    error.statusCode = 400;

    throw error;
  }

  if (
    numericAmount >
    Number(matchingSettlement.amount) + 0.01
  ) {
    const error = new Error(
      `You can only settle up to ₹${matchingSettlement.amount}.`
    );

    error.statusCode = 400;

    throw error;
  }

  const result = await pool.query(
    `
      INSERT INTO settlements
      (
        group_id,
        payer_id,
        receiver_id,
        amount,
        payment_method,
        transaction_reference,
        status
      )
      VALUES
      (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        'completed'
      )
      RETURNING *
    `,
    [
      numericGroupId,
      userId,
      numericReceiverId,
      numericAmount,
      paymentMethod,
      transactionReference?.trim() || null,
    ]
  );

  return result.rows[0];
};


const getSettlementHistory = async (
  userId
) => {
  const result = await pool.query(
    `
      SELECT
        s.id,
        s.amount,
        s.payment_method,
        s.transaction_reference,
        s.status,
        s.settled_at,

        g.id AS group_id,
        g.name AS group_name,

        payer.id AS payer_id,
        payer.name AS payer_name,

        receiver.id AS receiver_id,
        receiver.name AS receiver_name

      FROM settlements s

      JOIN groups g
        ON g.id = s.group_id

      JOIN users payer
        ON payer.id = s.payer_id

      JOIN users receiver
        ON receiver.id = s.receiver_id

      WHERE
        s.payer_id = $1
        OR s.receiver_id = $1

      ORDER BY
        s.settled_at DESC,
        s.id DESC
    `,
    [userId]
  );

  return result.rows.map((item) => ({
    id: item.id,

    amount: Number(item.amount),

    paymentMethod:
      item.payment_method,

    transactionReference:
      item.transaction_reference,

    status: item.status,

    settledAt: item.settled_at,

    groupId: item.group_id,
    group: item.group_name,

    payerId: item.payer_id,
    payer: item.payer_name,

    receiverId: item.receiver_id,
    receiver: item.receiver_name,

    type:
      item.payer_id === userId
        ? "paid"
        : "received",
  }));
};

module.exports = {
  getPendingSettlements,
  getSettlementSummary,
  createSettlement,
  getSettlementHistory,
};