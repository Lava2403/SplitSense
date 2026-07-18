const groups = require("../data/groups");

// Flatten all expenses from every group
const getAllExpenses = async () => {
  const expenses = [];

  groups.forEach((group) => {
    group.expenses.forEach((expense) => {
      expenses.push({
        ...expense,
        groupId: group.id,
        groupName: group.name,
      });
    });
  });

  return expenses;
};

// Get one expense
const getExpenseById = async (id) => {
  const expenses = await getAllExpenses();

  return expenses.find(
    (expense) => expense.id === Number(id)
  );
};

// Add expense
const addExpense = async (expenseData) => {
  const group = groups.find(
    (g) => g.id === String(expenseData.groupId)
  );

  if (!group) return null;

  const newExpense = {
    id: group.expenses.length + 1,
    title: expenseData.title,
    amount: expenseData.amount,
    paidBy: expenseData.paidBy,
    participants: expenseData.participants,
    date: expenseData.date,
  };

  group.expenses.push(newExpense);

  return newExpense;
};

// Update expense
const updateExpense = async (id, updatedData) => {
  for (const group of groups) {
    const expense = group.expenses.find(
      (e) => e.id === Number(id)
    );

    if (expense) {
      Object.assign(expense, updatedData);
      return expense;
    }
  }

  return null;
};

// Delete expense
const deleteExpense = async (id) => {
  for (const group of groups) {
    const index = group.expenses.findIndex(
      (e) => e.id === Number(id)
    );

    if (index !== -1) {
      return group.expenses.splice(index, 1)[0];
    }
  }

  return null;
};

module.exports = {
  getAllExpenses,
  getExpenseById,
  addExpense,
  updateExpense,
  deleteExpense,
};