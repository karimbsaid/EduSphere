/* eslint-disable react/prop-types */
import { useContext } from "react";
import { useAuth } from "../context/authContext";
import { Navigate, Outlet } from "react-router-dom";
import Spinner from "../ui/Spinner";

const ProtectedRoute = ({ group }) => {
  const { user, isLoading, userBelongsToGroup } = useAuth();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <Spinner size="lg" />
        <div className="ml-4 text-lg">Chargement...</div>
      </div>
    );
  }
  if (!user || !userBelongsToGroup(group)) {
    return <Navigate to="/login" />;
  }

  return <Outlet />;
};
export default ProtectedRoute;
