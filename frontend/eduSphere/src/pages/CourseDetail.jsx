import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CourseIncludes from "../features/course/courseDetail/CourseIncludes";
import { getCourseDetail } from "../services/apiCourse";
import { enroll, getProgress } from "../services/apiEnrollment";
import { useAuth } from "../context/authContext";
import CourseCard from "../features/course/courseDetail/CourseDetails";
import CourseSection from "../features/course/courseDetail/CourseSection";
import { getCourseReviews } from "../services/apiReview";
import ReviewCard from "../features/course/courseDetail/ReviewCard";
import { pay } from "../services/apiPayment";
import Spinner from "../ui/Spinner"; // 👉 Assure-toi que ce chemin est correct
import Card from "../ui/Card";

export default function CourseDetailPage() {
  const { courseId } = useParams();
  const [courseDetail, setCourseDetail] = useState({});
  const [reviews, setReviews] = useState([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isInstructor, setIsInstructor] = useState(false);
  const [openSection, setOpenSection] = useState("section-1");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();
  const { user } = useAuth();
  const token = user?.token;

  useEffect(() => {
    const fetchCourseAndReviews = async () => {
      setIsLoading(true);
      try {
        const [courseData, reviewData] = await Promise.all([
          getCourseDetail(courseId),
          getCourseReviews(courseId),
        ]);

        if (courseData.status === "fail") {
          navigate("/notfound");
          return;
        }

        const course = courseData.course;

        // Vérifie si l'utilisateur connecté est l'instructeur
        const isUserInstructor = token && user?._id === course.instructor?._id;
        setIsInstructor(isUserInstructor);

        // Si l'utilisateur est inscrit, récupère sa progression
        if (token && !isUserInstructor) {
          const progressResponse = await getProgress(courseId, token);
          console.log(progressResponse);
          if (progressResponse.status === "success") {
            setIsEnrolled(true);
            course.progress = progressResponse.progress;
          }
        }

        setCourseDetail(course);

        if (reviewData.status === "success") {
          setReviews(reviewData.reviews);
        } else {
          setError(reviewData.message || "Erreur lors du chargement des avis");
        }
      } catch (err) {
        if (err.status === 404) {
          navigate("/notfound");
        } else {
          setError("Une erreur s'est produite, veuillez réessayer.");
        }
        setReviews([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseAndReviews();
  }, [courseId, token, navigate, user]);

  const handleEnrollment = async () => {
    if (courseDetail.price > 0) {
      const paymentResponse = await pay(courseDetail._id, token);
      window.open(paymentResponse.paymentUrl);
    }

    const enrollmentResponse = await enroll(courseDetail._id, token);
    if (enrollmentResponse.status === "success") {
      const { currentSection, currentLecture } =
        enrollmentResponse.enrollment.progress;
      navigate(
        `/course/${courseId}/chapter/${currentSection}/lecture/${currentLecture}`
      );
    }
  };

  const handleContinueCourse = () => {
    const { currentSection, currentLecture } = courseDetail.progress;
    navigate(
      `/course/${courseId}/chapter/${currentSection}/lecture/${currentLecture}`
    );
  };

  const handlePreviewCourse = () => {
    navigate(`/course/${courseId}/preview`);
  };

  const handleCourseAction = () => {
    if (!token) return navigate("/login");

    if (isInstructor) return handlePreviewCourse();
    if (isEnrolled) return handleContinueCourse();

    return handleEnrollment();
  };

  const toggleSection = (sectionId) => {
    setOpenSection((prev) => (prev === sectionId ? null : sectionId));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <Spinner size="lg" />
        <div className="ml-4 text-lg">Chargement...</div>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-4 container mx-auto">
        <div className="md:col-span-2 space-y-6 w-full">
          <CourseCard course={courseDetail} />
          <Card className="border-none w-full">
            {courseDetail.sections?.map((section) => (
              <CourseSection
                key={section._id}
                section={section}
                isOpen={openSection === section._id}
                onToggle={() => toggleSection(section._id)}
                onLectureClick={() => console.log("ok")}
              />
            ))}
          </Card>
        </div>
        <div className="md:col-span-2">
          <CourseIncludes
            courseDetail={courseDetail}
            onActionClick={handleCourseAction}
            isInstructor={isInstructor}
          />
        </div>
      </div>

      {reviews.length > 0 && (
        <h1 className="font-bold my-2 ml-2">Les reviews de nos étudiants</h1>
      )}
      <div className="mx-2">
        {reviews.map((rev, index) => (
          <ReviewCard key={index} review={rev} />
        ))}
      </div>
    </>
  );
}
