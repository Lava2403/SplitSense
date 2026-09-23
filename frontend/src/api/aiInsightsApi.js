import api from "./axios";

export const getMonthlyInsights = async (month) => {
  try {
    const response = await api.get("/ai-insights/monthly", {
      params: month ? { month } : undefined,
    });

    return response.data;
  } catch (error) {
    console.error(
      "AI Insights API error:",
      error.response?.data || error
    );

    throw error;
  }
};