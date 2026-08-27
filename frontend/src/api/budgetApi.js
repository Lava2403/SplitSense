import api from "./axios";

export const getBudgetSummary = async (monthlyBudget) => {
  const response = await api.get("/budget/summary", {
    params: {
      monthlyBudget,
    },
  });

  return response.data;
};