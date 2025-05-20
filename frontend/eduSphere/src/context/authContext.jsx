/* eslint-disable react/prop-types */
import React, { createContext, useState, useContext, useEffect } from "react";
import { loginUser, signupUser } from "../services/apiLogin";
import { getMyprofile } from "../services/apiProfile";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("token");

      if (token) {
        try {
          const { user } = await getMyprofile(token);
          console.log(user);
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

  const login = async (email, password) => {
    const response = await loginUser(email, password);

    if (response.status === "success") {
      const { user: userData, token } = response;
      localStorage.setItem("token", token);
      setUser({ ...userData, token });
    } else {
      throw new Error(response.message);
    }
  };

  const signup = async (formData) => {
    const { name, email, password, role } = formData;
    const response = await signupUser(name, email, password, role);

    if (response.status === "success") {
      const { user: userData, token } = response;
      localStorage.setItem("token", token);
      setUser({ ...userData, token });
      return response;
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
