import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CourseInformation from "../features/course/CourseInformation";
import CourseContent from "../features/course/CourseContent";
import CourseIncludes from "../features/course/CourseIncludes";
import { getCourseDetail } from "../services/apiCourse";
import { enroll, getProgress } from "../services/apiEnrollment";

import { useAuth } from "../context/authContext";

function CourseDetail() {
  const { courseId } = useParams();
  const [courseDetail, setCourseDetail] = useState({});
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [progress, setProgress] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const token = user.token;

  useEffect(() => {
    const loadCourse = async () => {
      try {
        const { data } = await getCourseDetail(courseId);
        console.log(data);

        if (token) {
          const progressResponse = await getProgress(courseId, token);

          if (progressResponse.status === "success") {
            setIsEnrolled(true);
            data.progress = progressResponse.progress;
          }
        }
        setCourseDetail(data);
      } catch (error) {
        console.error("Erreur lors du chargement du cours:", error);
      }
    };

    loadCourse();
  }, [courseId, token]);

  const handleEnrollCourse = async () => {
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

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-6 bg-gray-50 min-h-screen">
      <div className="w-full lg:w-3/5">
        <CourseInformation course={courseDetail} />
        {courseDetail.sections && <CourseContent course={courseDetail} />}
      </div>

      <div className="w-full lg:w-2/5">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <img
            src={courseDetail.imageUrl}
            className="w-full rounded-xl w-md h-md object-cover"
            alt="teacher"
          />

          <p className="text-3xl text-purple-600 font-semibold">
            ${courseDetail.price}
          </p>

          {isEnrolled ? (
            <button
              onClick={handleContinueWatching}
              className="w-full mt-4 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
            >
              Continue Watching
            </button>
          ) : (
            <button
              onClick={handleEnrollCourse}
              className="w-full mt-4 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700"
            >
              Book trial lesson
            </button>
          )}
        </div>
        <CourseIncludes />
      </div>
    </div>
  );
}

export default CourseDetail;
