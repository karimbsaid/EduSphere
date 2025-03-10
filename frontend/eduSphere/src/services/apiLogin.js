const API_URL = "http://127.0.0.1:8080/api/v1/";

export const loginUser = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    return response.json();
  } catch (error) {
    throw new Error("something went wrong");
  }
};

export const signupUser = async (name, email, password, role) => {
  try {
    const response = await fetch(`${API_URL}auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    });

    return response.json();
  } catch (error) {
    throw new Error("Something went wrong");
  }
};
