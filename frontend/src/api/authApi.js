import api from "./axios";

export const signup = async (payload) => {
  const response = await api.post("/signup", payload);
  return response.data;
};

export const login = async (payload) => {
  const response = await api.post("/login", payload);
  return response.data;
};

export const getProfile = async () => {
  const response = await api.get("/profile");
  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await api.post("/forgot-password", { email });
  return response.data;
};

export const resetPassword = async (token, password) => {
  const response = await api.post(`/reset-password/${token}`, { password });
  return response.data;
};
