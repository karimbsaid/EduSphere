/* eslint-disable react/prop-types */
import { useContext, useEffect, useState } from "react";
import { useAuth } from "../context/authContext";
import { Navigate, Outlet, useParams, useNavigate } from "react-router-dom";
import Spinner from "../ui/Spinner";
import { getMyEnrolledCourse } from "../services/apiEnrollment";

const NotEnrolledMessage = ({ courseId }) => {
  const navigate = useNavigate();

  const handleGoToCourseDetail = () => {
    navigate(`/course/${courseId}`);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          {/* Icon */}
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
          </div>

          {/* Message */}
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Accès Restreint
          </h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Vous n'êtes pas inscrit à ce cours. Pour accéder au contenu du
            cours, vous devez d'abord vous inscrire.
          </p>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleGoToCourseDetail}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Voir les Détails du Cours
            </button>
            <button
              onClick={() => navigate("/courses")}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Retour aux Cours
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const EnrolledStudentRoute = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { courseId } = useParams();
  const [isEnrolled, setIsEnrolled] = useState(null);
  const [enrollmentLoading, setEnrollmentLoading] = useState(true);
  console.log("user", user);

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

  // Show not enrolled message instead of redirecting
  if (!isEnrolled) {
    return <NotEnrolledMessage courseId={courseId} />;
  }

  return <Outlet />;
};

export default EnrolledStudentRoute;
