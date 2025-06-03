/* eslint-disable react/prop-types */
import { useAuth } from "../context/authContext";
import { Navigate, Outlet } from "react-router-dom";
import Loading from "../components/Loading";
const ProtectedRoute = ({ group }) => {
  const { user, isLoading, userBelongsToGroup } = useAuth();

  if (isLoading) {
    return <Loading />;
  }
  console.log("user", user);
  console.log(userBelongsToGroup(group));
  if (!user || !userBelongsToGroup(group)) {
    return <Navigate to="/login" />;
  }

  return <Outlet />;
};
export default ProtectedRoute;
