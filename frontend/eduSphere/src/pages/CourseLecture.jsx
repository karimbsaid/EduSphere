import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getLecture } from "../services/apiCourse";
import Button from "../ui/Button";
import { updateProgress } from "../services/apiEnrollment";
import { useAuth } from "../context/authContext";
import VideoPlayer from "../features/course/courseLecture/VideoPlayer";
import QuizLecture from "../features/course/courseLecture/QuizLecture";

export default function CourseLecture() {
  const { courseId, sectionId, lectureId } = useParams();
  const [lecture, setLecture] = useState({});
  const [isCompleted, setCompleted] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const token = user.token;
  useEffect(() => {
    const fetchLecture = async () => {
      const data = await getLecture(courseId, sectionId, lectureId);

      setLecture(data);
    };
    fetchLecture();
  }, [lectureId, sectionId, courseId]);
  const handleLectureCompleted = async () => {
    setCompleted(true);
    const { progress } = await updateProgress(
      courseId,
      sectionId,
      lectureId,
      token
    );
    const currentSection = progress.currentSection;
    const currentLecture = progress.currentLecture;
    if (currentLecture != null && currentSection != null) {
      navigate(
        `/course/${courseId}/chapter/${currentSection}/lecture/${currentLecture}`
      );
    }
  };

  return (
    <div>
      {lecture.type === "video" && (
        <VideoPlayer url={lecture.url} onEnded={handleLectureCompleted} />
      )}
      {lecture.type === "quiz" && (
        <QuizLecture
          questions={lecture.questions}
          onComplete={handleLectureCompleted}
          duration={lecture.duration}
        />
      )}
      <div className="flex flex-col items-center">
        <Button
          label="marquer completé"
          className="bg-green-500 text-white"
          onClick={handleLectureCompleted}
        />
      </div>
    </div>
  );
}
