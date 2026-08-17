export const formatAmount = (value) => {
  const amount = Number(value) || 0;
  return `₹${amount.toFixed(0)}`;
};

export const formatExpenseDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export const getUserBalances = (expenses = [], currentUserName) => {
  let youOwe = 0;
  let youAreOwed = 0;
  const balances = {};

  if (!currentUserName) {
    return { youOwe, youAreOwed, balances, netBalance: 0 };
  }

  expenses.forEach((expense) => {
    const participants = expense.participants || [];
    if (!participants.length) return;

    const share = Number(expense.amount) / participants.length;

    if (expense.paidBy === currentUserName) {
      participants.forEach((person) => {
        if (person !== currentUserName) {
          balances[person] = (balances[person] || 0) + share;
          youAreOwed += share;
        }
      });
    } else if (participants.includes(currentUserName)) {
      balances[expense.paidBy] = (balances[expense.paidBy] || 0) - share;
      youOwe += share;
    }
  });

  return {
    youOwe,
    youAreOwed,
    balances,
    netBalance: youAreOwed - youOwe,
  };
};

export const getGroupTotals = (group, currentUserName) => {
  const expenses = group?.expenses || [];
  const totalExpense = expenses.reduce(
    (sum, expense) => sum + Number(expense.amount || 0),
    0
  );
  const { youOwe, youAreOwed } = getUserBalances(expenses, currentUserName);

  return {
    totalExpense,
    expenseCount: expenses.length,
    memberCount: group?.members?.length || group?.memberDetails?.length || 0,
    youOwe,
    youAreOwed,
  };
};

export const buildInsights = ({ expenses = [], youOwe, youAreOwed, userName }) => {
  if (!expenses.length) {
    return [
      "Add a group and log an expense to unlock spending insights.",
    ];
  }

  const insights = [];
  const latest = expenses[0];
  const paidByUser = expenses.filter((expense) => expense.paidBy === userName).length;
  const largest = expenses.reduce(
    (max, expense) =>
      Number(expense.amount) > Number(max.amount) ? expense : max,
    expenses[0]
  );

  insights.push(
    `Latest expense is ${latest.title} for ${formatAmount(latest.amount)}.`
  );
  insights.push(
    `Largest expense so far is ${largest.title} (${formatAmount(largest.amount)}).`
  );
  insights.push(
    `You paid for ${paidByUser} of ${expenses.length} recorded expenses.`
  );

  if (youOwe > 0) {
    insights.push(`You currently owe ${formatAmount(youOwe)} across your groups.`);
  }
  if (youAreOwed > 0) {
    insights.push(`Others owe you ${formatAmount(youAreOwed)}.`);
  }
  if (youOwe === 0 && youAreOwed === 0) {
    insights.push("You are settled up right now.");
  }

  return insights.slice(0, 4);
};
