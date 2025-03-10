import React, { useEffect, useState } from "react";
import VideoPlayer from "../features/course/VideoPlayer";
import { useNavigate, useParams } from "react-router-dom";
import { getLecture } from "../services/apiCourse";
import QuizLecture from "./QuizLecture";
import Button from "../ui/Button";
import { updateProgress } from "../services/apiEnrollment";
import { useAuth } from "../context/authContext";

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
      console.log(data);
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
          Questions={lecture.questions}
          onCompleted={handleLectureCompleted}
        />
      )}
      <Button label="marquer as completed" onClick={handleLectureCompleted} />
    </div>
  );
}
