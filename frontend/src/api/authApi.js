import api from "./axios";

export const register = async ({ name, email, password }) => {
  const response = await api.post("/auth/register", {
    name,
    email,
    password,
  });
  return response.data;
};

export const login = async ({ email, password }) => {
  const response = await api.post("/auth/login", { email, password });
  return response.data;
};

export const getProfile = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};

export const forgotPassword = async ({ email }) => {
  const response = await api.post("/auth/forgot-password", { email });
  return response.data;
};

export const resetPassword = async ({ token, password }) => {
  const response = await api.post(`/auth/reset-password/${token}`, {
    password,
  });
  return response.data;
};

export const listUsers = async () => {
  const response = await api.get("/auth/users");
  return response.data;
};

export const getGoogleConfig = async () => {
  const response = await api.get("/auth/google-config");
  return response.data;
};

export const loginWithGoogle = async (payload) => {
  const response = await api.post("/auth/google", payload);
  return response.data;
};
