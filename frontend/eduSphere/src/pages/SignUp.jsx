import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { ACCOUNT_TYPE } from "../utils/constant";
import Button from "../ui/ButtonVF";

const Signup = () => {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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
    setIsLoading(true);

    // Client-side validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Veuillez entrer un email valide");
      setIsLoading(false);
      return;
    }
    if (formData.password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères");
      setIsLoading(false);
      return;
    }
    if (formData.name.length < 2) {
      setError("Le nom doit contenir au moins 2 caractères");
      setIsLoading(false);
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      setIsLoading(false);
      return;
    }

    try {
      const response = await signup({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });
      if (response.status === "success") {
        navigate("/");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Une erreur s'est produite");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-gray-100 to-gray-200 p-6">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-md">
        <h2 className="text-3xl font-bold text-center text-gray-800">
          Créer un compte
        </h2>
        {error && (
          <div
            role="alert"
            className="p-3 text-red-800 bg-red-50 rounded-md animate-pulse"
          >
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-800">
              Type de compte
            </label>
            <div className="flex space-x-4 mt-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="role"
                  value={ACCOUNT_TYPE.STUDENT}
                  checked={formData.role === ACCOUNT_TYPE.STUDENT}
                  onChange={handleInputChange}
                  className="mr-2 text-teal-600 focus:ring-teal-500"
                  aria-label="Étudiant"
                />
                <span className="text-gray-800">Étudiant</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="role"
                  value={ACCOUNT_TYPE.INSTRUCTOR}
                  checked={formData.role === ACCOUNT_TYPE.INSTRUCTOR}
                  onChange={handleInputChange}
                  className="mr-2 text-teal-600 focus:ring-teal-500"
                  aria-label="Instructeur"
                />
                <span className="text-gray-800">Instructeur</span>
              </label>
            </div>
          </div>
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-800"
            >
              Nom
            </label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-4 py-2 mt-1 text-black bg-gray-50 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500"
              required
              aria-required="true"
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-800"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-2 mt-1 text-black bg-gray-50 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500"
              required
              aria-required="true"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-800"
            >
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-4 py-2 mt-1 text-black bg-gray-50 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500"
              required
              aria-required="true"
            />
          </div>
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-800"
            >
              Confirmer le mot de passe
            </label>
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="w-full px-4 py-2 mt-1 text-black bg-gray-50 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500"
              required
              aria-required="true"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full px-4 py-2 text-white transition bg-teal-600 rounded-lg hover:bg-teal-700 focus:ring-4 focus:ring-teal-500 ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? "Inscription..." : "S'inscrire"}
          </button>
        </form>
        <p className="text-center text-sm text-gray-800">
          Vous avez déjà un compte ?{" "}
          <a
            href="/login"
            className="text-teal-500 hover:text-teal-600 hover:underline"
          >
            Se connecter
          </a>
        </p>
      </div>
    </div>
  );
};

export default Signup;
