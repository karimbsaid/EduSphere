"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FaSearch,
  FaHome,
  FaBook,
  FaArrowLeft,
  FaCompass,
  FaBookOpen,
  FaQuestionCircle,
  FaFrown,
} from "react-icons/fa";

const NotFound = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const popularCourses = [
    {
      id: "web-dev",
      title: "Développement Web Moderne",
      category: "Programmation",
    },
    { id: "ux-design", title: "Design UX/UI Avancé", category: "Design" },
    { id: "marketing", title: "Marketing Digital", category: "Marketing" },
    {
      id: "data-science",
      title: "Introduction à la Data Science",
      category: "Data",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 flex flex-col items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <div className="text-6xl font-bold text-gray-400 relative ">
          404
          <FaFrown className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-gray-500 text-7xl" />
        </div>
        <h1 className="text-4xl font-bold mt-4">Page introuvable</h1>
        <p className="text-lg text-gray-600 mt-2">
          Oups ! Il semble que vous vous soyez aventuré dans une zone
          inexplorée.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
          <Link
            to="/"
            className="bg-blue-500 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-blue-600"
          >
            <FaHome /> Retour à l&apos;accueil
          </Link>
          <Link
            to="/courses"
            className="border border-gray-400 px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-gray-100"
          >
            <FaBookOpen /> Explorer les cours
          </Link>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="w-full max-w-xl mx-auto"
      >
        <div className="relative mb-8">
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Rechercher un cours..."
            className="w-full pl-12 pr-4 py-3 rounded-full shadow-md border border-gray-300"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && searchQuery.trim()) {
                window.location.href = `/search?q=${encodeURIComponent(
                  searchQuery
                )}`;
              }
            }}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
