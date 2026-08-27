import api from "./axios";

export const getGroups = async () => {
  const response = await api.get("/groups");
  return response.data;
};

export const getGroup = async (id) => {
  const response = await api.get(`/groups/${id}`);
  return response.data;
};

export const createGroup = async (group) => {
  const response = await api.post("/groups", group);
  return response.data;
};

export const updateGroup = async (id, group) => {
  const response = await api.put(`/groups/${id}`, group);
  return response.data;
};

export const deleteGroup = async (id) => {
  const response = await api.delete(`/groups/${id}`);
  return response.data;
};

export const addMemberToGroup = async (groupId, email) => {
  const response = await api.post(`/groups/${groupId}/members`, {
    email,
  });

  return response.data;
};