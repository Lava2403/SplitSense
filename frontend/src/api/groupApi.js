import api from "./axios";

// ===========================
// GET ALL GROUPS
// ===========================
export const getGroups = async () => {
  const response = await api.get("/groups");
  return response.data;
};

// ===========================
// GET ONE GROUP
// ===========================
export const getGroup = async (id) => {
  const response = await api.get(`/groups/${id}`);
  return response.data;
};

// ===========================
// CREATE GROUP
// ===========================
export const createGroup = async (group) => {
  const response = await api.post("/groups", group);
  return response.data;
};

// ===========================
// UPDATE GROUP
// ===========================
export const updateGroup = async (id, group) => {
  const response = await api.put(`/groups/${id}`, group);
  return response.data;
};

// ===========================
// DELETE GROUP
// ===========================
export const deleteGroup = async (id) => {
  const response = await api.delete(`/groups/${id}`);
  return response.data;
};