import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { ACCOUNT_TYPE } from "../utils/constant";
import Tab from "../ui/Tab";

const Signup = () => {
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: ACCOUNT_TYPE.STUDENT,
  });

  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const response = await signup(formData);
      if (response.status === "success") {
        navigate("/");
      }
    } catch (err) {
      setError(err.message || "Something went wrong");
    }
  };

  const handleInputChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const tabData = [
    { id: 1, tabName: "Student", type: ACCOUNT_TYPE.STUDENT },
    { id: 2, tabName: "Instructor", type: ACCOUNT_TYPE.INSTRUCTOR },
  ];

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-indigo-500 to-purple-600 p-6">
      <div className="w-full max-w-md p-8 space-y-6 bg-white/10 backdrop-blur-lg rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold text-center text-white">
          Create Account
        </h2>
        {error && (
          <div className="p-3 text-red-700 bg-red-100 rounded-md animate-pulse">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white">
              Account Type
            </label>
            <Tab
              tabData={tabData}
              field={formData.role}
              setField={(role) => setFormData((prev) => ({ ...prev, role }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-4 py-2 mt-1 text-gray-900 bg-white rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-2 mt-1 text-gray-900 bg-white rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-4 py-2 mt-1 text-gray-900 bg-white rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="w-full px-4 py-2 mt-1 text-gray-900 bg-white rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 text-white transition bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300"
          >
            Sign Up
          </button>
        </form>
        <p className="text-center text-sm text-white">
          Already have an account?{" "}
          <a href="/login" className="text-indigo-300 hover:underline">
            Login
          </a>
        </p>
      </div>
    </div>
  );
};

export default Signup;
