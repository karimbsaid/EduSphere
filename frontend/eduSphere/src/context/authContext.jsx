/* eslint-disable react/prop-types */
import React, { createContext, useState, useContext } from "react";
import { loginUser, signupUser } from "../services/apiLogin";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("token")
      ? localStorage.getItem("token")
      : null;
    const storedUser = localStorage.getItem("user")
      ? JSON.parse(localStorage.getItem("user"))
      : null;
    return { token, user: storedUser };
  });

  const login = async (email, password) => {
    const response = await loginUser(email, password);
    if (response.status === "success") {
      const { user, token } = response;

      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);

      // Update user state
      setUser({ user, token });
    } else {
      throw new Error(response.message);
    }
  };

  const signup = async (formData) => {
    const { name, email, password, role } = formData;
    const response = await signupUser(name, email, password, role);
    console.log(response);

    if (response.status === "success") {
      const { user, token } = response;

      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);

      setUser({ user, token });
      return response;
    } else {
      throw new Error(response.message);
    }
  };

  const userBelongsToGroup = (groupName) => {
    return user?.user?.role && groupName.includes(user.user.role);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider
      value={{ login, signup, logout, user, userBelongsToGroup }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
