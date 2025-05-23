/* eslint-disable react/prop-types */
import React, { createContext, useState, useContext, useEffect } from "react";
import { loginUser, signupUser } from "../services/apiLogin";
import { getMyprofile } from "../services/apiProfile";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("token");

      if (token) {
        if (isTokenExpired(token)) {
          console.warn("Token expired — clearing it.");
          localStorage.removeItem("token");
          setIsLoading(false);
          return;
        }

        try {
          const { user } = await getMyprofile(token);
          setUser({ ...user, token });
        } catch (error) {
          console.error("Failed to load user profile:", error);
          localStorage.removeItem("token");
        }
      }

      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const isTokenExpired = (token) => {
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp < currentTime;
    } catch (err) {
      return true;
    }
  };
  const login = async (email, password) => {
    const response = await loginUser(email, password);

    if (response.status === "success") {
      const { token } = response;
      localStorage.setItem("token", token);

      try {
        const { user: profile } = await getMyprofile(token);
        setUser({ ...profile, token });
      } catch (error) {
        console.error("Failed to fetch profile after login:", error);
        localStorage.removeItem("token");
        throw new Error("Failed to fetch profile after login.");
      }
    } else {
      throw new Error(response.message);
    }
  };

  const signup = async (formData) => {
    const { name, email, password, role } = formData;
    const response = await signupUser(name, email, password, role);

    if (response.status === "success") {
      const { token } = response;
      localStorage.setItem("token", token);

      try {
        const { user: profile } = await getMyprofile(token);
        setUser({ ...profile, token });
        return response;
      } catch (error) {
        console.error("Failed to fetch profile after signup:", error);
        localStorage.removeItem("token");
        throw new Error("Failed to fetch profile after signup.");
      }
    } else {
      throw new Error(response.message);
    }
  };

  const userBelongsToGroup = (groupName) => {
    return user?.role && groupName.includes(user?.role?.name);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
  };

  // useEffect(() => {
  //   if (!user) {
  //     localStorage.removeItem("token");
  //   }
  // }, [user]);

  return (
    <AuthContext.Provider
      value={{
        login,
        signup,
        logout,
        user,
        setUser,
        isLoading,
        userBelongsToGroup,
      }}
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
