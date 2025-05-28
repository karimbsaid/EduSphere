import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../ui/Button";

export default function QuickActions({ isAdmin }) {
  const navigate = useNavigate();

  const handleCreateCourseNaviagtion = () => {
    navigate("/my-courses/add");
  };
  const handleModerationCoursNavigation = () => {
    navigate("/dashboard/courses");
  };
  const handlePaimentNavigation = () => {
    navigate("/dashboard/payments");
  };
  const handleUsersNavigation = () => {
    navigate("/dashboard/users");
  };

  const handleStudentsNavigation = () => {
    navigate("/my-courses/my-students");
  };
  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-700">Actions rapides</h3>
      <div className="mt-2 space-x-2">
        {isAdmin ? (
          <>
            <Button
              onClick={handleModerationCoursNavigation}
              variant="simple"
              label="Approuver des cours"
            />
            <Button
              variant="simple"
              onClick={handlePaimentNavigation}
              label="Voir les paiements"
            />
            <Button
              label="Gérer les utilisateurs"
              onClick={handleUsersNavigation}
            />
            {/* <button
              onClick={handleModerationCoursNavigation}
              className="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600"
            >
              Approuver des cours
            </button>
            <button
              onClick={handlePaimentNavigation}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Voir les paiements
            </button>
            <button
              onClick={handleUsersNavigation}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Gérer les utilisateurs
            </button> */}
          </>
        ) : (
          <>
            <Button
              variant="simple"
              label="Créer un nouveau cours"
              onClick={handleCreateCourseNaviagtion}
            />
            <Button
              variant="simple"
              label="Voir mes étudiants"
              onClick={handleStudentsNavigation}
            />
            {/* <button
              onClick={handleCreateCourseNaviagtion}
              className="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600"
            >
              Créer un nouveau cours
            </button>
            <button
              onClick={handleStudentsNavigation}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Voir mes étudiants
            </button> */}
          </>
        )}
      </div>
    </div>
  );
}
