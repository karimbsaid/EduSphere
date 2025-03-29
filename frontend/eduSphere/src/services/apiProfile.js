const API_URL = "http://localhost:8080/api/v1/";

export const getMyprofile = async (token) => {
  const response = await fetch(`${API_URL}users/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) throw new Error("Erreur lors de la fetch du profile");
  return response.json();
};

export const updateProfile = async (profileData, token) => {
  console.log(profileData.email);
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
