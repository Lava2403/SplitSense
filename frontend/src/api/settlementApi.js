import api from "./axios";

// Get pending settlements
export const getPendingSettlements = async () => {
  const response = await api.get("/settlements/pending");
  return response.data;
};

// Get settlement summary
export const getSettlementSummary = async () => {
  const response = await api.get("/settlements/summary");
  return response.data;
};

// Get settlement history
export const getSettlementHistory = async () => {
  const response = await api.get("/settlements/history");
  return response.data;
};

// Record a settlement
export const createSettlement = async (settlement) => {
  const response = await api.post(
    "/settlements",
    settlement
  );

  return response.data;
};