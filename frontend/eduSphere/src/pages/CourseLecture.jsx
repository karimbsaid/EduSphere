import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getLecture } from "../services/apiCourse";
import Button from "../ui/Button";
import { updateProgress } from "../services/apiEnrollment";
import { useAuth } from "../context/authContext";
import VideoPlayer from "../features/course/courseLecture/VideoPlayer";
import QuizLecture from "../features/course/courseLecture/QuizLecture";
import toast from "react-hot-toast";
import Loading from "../components/Loading";

export default function CourseLecture() {
  const { courseId, sectionId, lectureId } = useParams();
  const [lecture, setLecture] = useState({});
  const [isCompleted, setCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  const token = user?.token;

  useEffect(() => {
    const fetchLecture = async () => {
      try {
        setIsLoading(true);
        const data = await getLecture(courseId, sectionId, lectureId, token);
        setLecture(data);
      } catch (err) {
        toast.error("Erreur lors du chargement du contenu.");
      } finally {
        setIsLoading(false);
      }
    };

    if (courseId && sectionId && lectureId) {
      fetchLecture();
    }
  }, [lectureId, sectionId, courseId]);

  const handleLectureCompleted = async () => {
    setCompleted(true);
    try {
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
    } catch (error) {
      toast.error(error.message);
      setCompleted(false);
    }
  };

  if (isLoading) return <Loading />;

  return (
    <div>
      {lecture.type === "video" && lecture.url && (
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
          label="marquer complété"
          className="bg-green-500 text-white"
          onClick={handleLectureCompleted}
          disabled={isCompleted}
        />
      </div>
    </div>
  );
}
