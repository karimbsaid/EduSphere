import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { ACCOUNT_TYPE } from "../utils/constant";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Client-side validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Veuillez entrer un email valide");
      setIsLoading(false);
      return;
    }
    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères");
      setIsLoading(false);
      return;
    }

    try {
      const response = await login(email, password);
      // Assume response includes user role (e.g., response.data.user.role)
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message || "Email ou mot de passe incorrect"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-gray-100 to-gray-200 p-6">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-md">
        <h2 className="text-3xl font-bold text-center text-gray-800">
          Se connecter
        </h2>
        <p className="text-center text-gray-600">
          Connectez-vous à votre compte
        </p>

        {error && (
          <div
            role="alert"
            className="p-3 text-red-800 bg-red-50 rounded-md animate-pulse"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-800"
            >
              Adresse email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 mt-1 text-black bg-gray-50 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500"
              placeholder="Entrez votre email"
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
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 mt-1 text-black bg-gray-50 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500"
              placeholder="Entrez votre mot de passe"
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
            aria-label={isLoading ? "Connexion en cours" : "Se connecter"}
          >
            {isLoading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-800">
          Vous n’avez pas de compte ?{" "}
          <a
            href="/register"
            className="font-medium text-teal-500 hover:text-teal-600 hover:underline"
          >
            S’inscrire
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
