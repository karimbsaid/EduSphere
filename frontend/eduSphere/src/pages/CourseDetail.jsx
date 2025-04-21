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

function CourseDetail() {
  const { courseId } = useParams();
  const [courseDetail, setCourseDetail] = useState({});
  const [reviews, setReviews] = useState([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [openSection, setOpenSection] = useState("section-1");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();
  const { user } = useAuth();
  const token = user?.token;

  useEffect(() => {
    const fetchData = async () => {
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

        if (token) {
          const progressResponse = await getProgress(courseId, token);
          if (progressResponse.status === "success") {
            setIsEnrolled(true);
            course.progress = progressResponse.progress;
          }
        }

        setCourseDetail(course);

        if (reviewData.status === "success") {
          setReviews(reviewData.reviews);
          setError(null);
        } else {
          setReviews([]);
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

    fetchData();
  }, [courseId, token, navigate]);

  const handleEnrollCourse = async () => {
    if (courseDetail.price > 0) {
      const response = await pay(courseDetail._id, token);
      window.open(response.paymentUrl);
    }
    const response = await enroll(courseDetail._id, token);
    if (response.status === "success") {
      const { progress } = response.enrollment;
      navigate(
        `/course/${courseId}/chapter/${progress.currentSection}/lecture/${progress.currentLecture}`
      );
    }
  };

  const handleContinueWatching = () => {
    const currentSection = courseDetail.progress?.currentSection;
    const currentLecture = courseDetail.progress?.currentLecture;
    navigate(
      `/course/${courseId}/chapter/${currentSection}/lecture/${currentLecture}`
    );
  };

  const handleSectionToggle = (sectionId) => {
    setOpenSection(openSection === sectionId ? null : sectionId);
  };

  const handleWatchCourse = () => {
    if (token) {
      isEnrolled ? handleContinueWatching() : handleEnrollCourse();
    } else {
      navigate("/login");
    }
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
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 px-4 container mx-auto">
        <div className="md:col-span-3 space-y-6 w-full">
          <CourseCard course={courseDetail} />
          {courseDetail.sections?.map((section) => (
            <CourseSection
              key={section._id}
              section={section}
              isOpen={openSection === section._id}
              onToggle={() => handleSectionToggle(section._id)}
              onLectureClick={() => console.log("ok")}
            />
          ))}
        </div>
        <div className="md:col-span-2">
          <CourseIncludes
            courseDetail={courseDetail}
            handleWatchCourse={handleWatchCourse}
          />
        </div>
      </div>
      <h1 className="font-bold my-2 ml-2">Les reviews de nos étudiants</h1>
      <div className="mx-2">
        {reviews.map((rev, index) => (
          <ReviewCard key={index} review={rev} />
        ))}
      </div>
    </>
  );
}

export default CourseDetail;
