// components/Navbar.jsx
import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-gray-800 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        {/* Nom de la plateforme */}
        <Link to="/" className="text-2xl font-bold tracking-tight">
          EduSphere
        </Link>

        {/* Boutons de navigation */}
        <div className="flex space-x-4">
          {/* Bouton "Les Cours" */}
          <Link
            to="/courses"
            className="px-4 py-2 text-sm font-medium hover:bg-gray-700 rounded-md transition-colors"
          >
            Les Cours
          </Link>

          {/* Boutons conditionnels selon l'authentification */}

          <Link
            to="/login"
            className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
          >
            S&apos;inscrire
          </Link>

          {/* Bouton Créer un compte */}
          <Link
            to="/register"
            className="px-4 py-2 text-sm font-medium bg-green-600 hover:bg-green-700 rounded-md transition-colors"
          >
            Créer un compte
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
