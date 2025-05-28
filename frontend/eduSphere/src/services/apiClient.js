// utils/apiClient.js
const API_URL = "http://localhost:8080/api/v1";

export const apiClient = async (
  endpoint,
  { method = "GET", token, body, isForm = false } = {}
) => {
  const headers = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (!isForm && body) headers["Content-Type"] = "application/json";

  const config = {
    method,
    headers,
    body: isForm ? body : body ? JSON.stringify(body) : undefined,
  };

  const res = await fetch(`${API_URL}${endpoint}`, config);
  const contentType = res.headers.get("content-type");

  let data;
  if (contentType && contentType.includes("application/json")) {
    data = await res.json();
  } else {
    data = await res.text();
  }

  if (!res.ok) {
    const errorMessage = data?.message || data || "Erreur API";
    throw new Error(errorMessage);
  }

  return data;
};
