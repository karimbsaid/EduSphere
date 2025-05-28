import { apiClient } from "./apiClient";

const API_URL = "http://127.0.0.1:8080/api/v1/";

export const loginUser = async (email, password) => {
  return apiClient(`/auth/login`, {
    method: "POST",
    body: { email, password },
  });
};

export const signupUser = async (name, email, password, role) => {
  return apiClient(`/auth/register`, {
    method: "POST",
    body: { name, email, password, role },
  });
};
