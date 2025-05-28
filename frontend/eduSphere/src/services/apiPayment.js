import { apiClient } from "./apiClient";

export const pay = async (courseId, token) => {
  return apiClient(`/payments/${courseId}`, { method: "POST", token });
};

export const getAllPayments = async (query = {}, token) => {
  const queryString = new URLSearchParams(query).toString();

  return apiClient(`/payments?${queryString}`, { token });
};
