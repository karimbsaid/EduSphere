import { apiClient } from "./apiClient";

const API_URL = "http://localhost:8080/api/v1/";

export const getMyprofile = async (token) => {
  return apiClient(`/users/me`, { token });
};

export const getAllUsers = async (token, query = {}) => {
  const queryString = new URLSearchParams(query).toString();
  return apiClient(`/users?${queryString}`, { token });
};

export const editUser = async (token, userData) => {
  const { _id, ...other } = userData;
  return apiClient(`/users/${_id}`, { body: userData, method: "PATCH", token });
};

export const addUser = async (token, userData) => {
  return apiClient(`/users`, { method: "POST", body: userData, token });
};

export const blockUser = async (token, userId) => {};

export const deleteUser = async (token, userId) => {
  return apiClient(`/users/${userId}`, { method: "DELETE", token });
};

export const updateProfile = async (profileData, token) => {
  const formData = new FormData();
  formData.append("contactNumber", profileData.phone);
  formData.append("email", profileData.email);
  formData.append("name", profileData.name);
  formData.append("bio", profileData.bio);
  if (profileData.avatar) formData.append("avatar", profileData.avatar);
  return apiClient(`/users/update-me`, {
    method: "PATCH",
    body: formData,
    isForm: true,
    token,
  });
};

export const getMyCourses = async (query, token) => {
  const queryString = new URLSearchParams(query).toString();
  return apiClient(`/users/me/my-courses?${queryString}`, { token });
};
