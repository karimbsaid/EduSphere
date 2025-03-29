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

function CourseDetail() {
  const { courseId } = useParams();
  const [courseDetail, setCourseDetail] = useState({});
  const [reviews, setReviews] = useState([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [progress, setProgress] = useState(null);
  const [openSection, setOpenSection] = useState("section-1");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const { user } = useAuth();
  const token = user?.token;

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const data = await getCourseReviews(courseId);

        if (data.status === "success") {
          console.log("ok");
          setReviews(data.reviews); // Assurez-vous que le backend retourne `reviews` dans `data`
          setError(null);
        } else if (data.status === "fail") {
          setReviews([]);
          setError(data.message); // "Aucun avis trouvé pour ce cours"
        } else {
          setError("Réponse inattendue du serveur");
          setReviews([]);
        }
      } catch (err) {
        setError(err.message || "Une erreur s'est produite");
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    const loadCourse = async () => {
      try {
        const { course } = await getCourseDetail(courseId);
        if (token) {
          const progressResponse = await getProgress(courseId, token);

          if (progressResponse.status === "success") {
            setIsEnrolled(true);
            course.progress = progressResponse.progress;
          }
        }
        setCourseDetail(course);
      } catch (error) {
        console.error("Erreur lors du chargement du cours:", error);
      }
    };

    loadCourse();
    fetchReviews();
  }, [courseId, token]);

  const handleEnrollCourse = async () => {
    console.log("here");
    const response = await enroll(courseDetail._id, token);
    if (response.status === "success") {
      const enrollment = response.enrollment;
      const progress = enrollment.progress;
      const currentSection = progress.currentSection;
      const currentLecture = progress.currentLecture;
      navigate(
        `/course/${courseId}/chapter/${currentSection}/lecture/${currentLecture}`
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
  const { quizCount, videoCount } = courseDetail.sections?.reduce(
    (counts, section) => {
      section.lectures?.forEach((lecture) => {
        if (lecture.type === "quiz") {
          counts.quizCount += 1;
        } else if (lecture.type === "video") {
          counts.videoCount += 1;
        }
      });
      return counts;
    },
    { quizCount: 0, videoCount: 0 }
  ) || { quizCount: 0, videoCount: 0 };
  const totalResource = courseDetail.resources?.length;

  const handleWatchCourse = () => {
    if (token) {
      if (isEnrolled) {
        handleContinueWatching();
      } else {
        handleEnrollCourse();
      }
    } else {
      navigate("/login");
    }
  };

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
            isEnrolled={isEnrolled}
            myProgress={courseDetail?.progress?.progressPercentage}
            totalVideo={videoCount}
            totalResource={totalResource}
            totalQuiz={quizCount}
            handleWatchCourse={handleWatchCourse}
          />
        </div>
      </div>
      <h1 className="font-bold my-2 ml-2">les reviews des nos etudiants</h1>
      <div className="mx-2">
        {reviews.map((rev, index) => (
          <ReviewCard key={index} review={rev} />
        ))}
      </div>
    </>
  );
}

export default CourseDetail;
