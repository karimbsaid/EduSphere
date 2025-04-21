const API_URL = "http://localhost:8080/api/v1/";
export const pay = async (courseId, token) => {
  const response = await fetch(`${API_URL}payments/${courseId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.json();
};

export const getAllPayments = async (query = {}, token) => {
  const queryString = new URLSearchParams(query).toString();
  console.log(queryString);
  const response = await fetch(`${API_URL}payments?${queryString}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.json();
};
