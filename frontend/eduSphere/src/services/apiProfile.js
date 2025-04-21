const API_URL = "http://localhost:8080/api/v1/";

export const getMyprofile = async (token) => {
  const response = await fetch(`${API_URL}users/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await response.json();
  if (data.status === 404) {
    return data;
  }
  if (!response.ok)
    throw new Error(data.message || "Erreur lors de la fetch du profile");
  return data;
};

export const getAllUsers = async (token, query = {}) => {
  const queryString = new URLSearchParams(query).toString();

  const response = await fetch(`${API_URL}users?${queryString}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.json();
};

export const editUser = async (token, userData) => {
  console.log(userData);
  const { _id, ...other } = userData;
  const response = await fetch(`${API_URL}users/${_id}`, {
    method: "PATCH",
    body: JSON.stringify(userData),

    headers: {
      "Content-Type": "application/json",

      Authorization: `Bearer ${token}`,
    },
  });

  return response.json();
};

export const addUser = async (token, userData) => {
  console.log(userData);
  const response = await fetch(`${API_URL}users`, {
    method: "POST",
    body: JSON.stringify(userData),

    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  return response.json();
};

export const deleteUser = async (token, userId) => {
  const response = await fetch(`${API_URL}users/${userId}`, {
    method: "DELETE",

    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.json();
};

export const updateProfile = async (profileData, token) => {
  console.log(token);
  const formData = new FormData();
  formData.append("contactNumber", profileData.phone);
  formData.append("email", profileData.email);
  formData.append("name", profileData.name);
  formData.append("bio", profileData.bio);
  if (profileData.avatar) formData.append("avatar", profileData.avatar);

  const response = await fetch(`${API_URL}users/update-me`, {
    method: "PATCH",
    body: formData,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok)
    throw new Error("Erreur lors de la modification du profile");
  return response.json();
};

export const getMyCourses = async (token) => {
  const response = await fetch(`${API_URL}users/me/my-courses`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) throw new Error("Erreur lors de la fetch du profile");
  return response.json();
};
