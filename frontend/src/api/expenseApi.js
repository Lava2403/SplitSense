import api from "./axios";

// ==========================
// GET ALL EXPENSES
// ==========================

export const getExpenses = async () => {
  const response = await api.get(
    "/expenses"
  );

  return response.data;
};

// ==========================
// ADD EXPENSE
// ==========================

export const addExpense = async (
  expense
) => {
  const response = await api.post(
    "/expenses",
    expense
  );

  return response.data;
};

// ==========================
// UPDATE EXPENSE
// ==========================

export const updateExpense = async (
  id,
  expense
) => {
  const response = await api.put(
    `/expenses/${id}`,
    expense
  );

  return response.data;
};

// ==========================
// DELETE EXPENSE
// ==========================

export const deleteExpense = async (
  id
) => {
  const response = await api.delete(
    `/expenses/${id}`
  );

  return response.data;
};