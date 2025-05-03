/* eslint-disable react/prop-types */
import { useContext, useEffect, useState } from "react";
import { useAuth } from "../context/authContext";
import { Navigate, Outlet, useParams } from "react-router-dom";
import Spinner from "../ui/Spinner";
import { getMyEnrolledCourse } from "../services/apiEnrollment";

const EnrolledStudentRoute = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { courseId } = useParams(); // Get courseId from the route
  const [isEnrolled, setIsEnrolled] = useState(null); // null = loading, true = enrolled, false = not enrolled
  const [enrollmentLoading, setEnrollmentLoading] = useState(true);

  useEffect(() => {
    const checkEnrollment = async () => {
      if (!user || !courseId) {
        setIsEnrolled(false);
        setEnrollmentLoading(false);
        return;
      }

      try {
        setEnrollmentLoading(true);
        const response = await getMyEnrolledCourse(user.token);
        if (response.status === "success") {
          const enrolledCourses = response.enrolledCourses || [];
          const isUserEnrolled = enrolledCourses.some(
            (course) => course.courseId?._id === courseId
          );
          setIsEnrolled(isUserEnrolled);
        } else {
          setIsEnrolled(false);
        }
      } catch (error) {
        console.error("Failed to check enrollment:", error);
        setIsEnrolled(false);
      } finally {
        setEnrollmentLoading(false);
      }
    };

    checkEnrollment();
  }, [user, courseId]);

  if (authLoading || enrollmentLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <Spinner size="lg" />
        <div className="ml-4 text-lg">Chargement...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!isEnrolled) {
    return <Navigate to="/courses" />; // Redirect to courses page or a custom "Not Enrolled" page
  }

  return <Outlet />;
};

export default EnrolledStudentRoute;
