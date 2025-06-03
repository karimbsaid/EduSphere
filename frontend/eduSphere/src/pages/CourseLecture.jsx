import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getLecture } from "../services/apiCourse";
import Button from "../ui/Button";
import { getProgress, updateProgress } from "../services/apiEnrollment";
import { useAuth } from "../context/authContext";
import VideoPlayer from "../features/course/courseLecture/VideoPlayer";
import QuizLecture from "../features/course/courseLecture/QuizLecture";
import toast from "react-hot-toast";
import Loading from "../components/Loading";

export default function CourseLecture() {
  const { courseId, sectionId, lectureId } = useParams();
  const [lecture, setLecture] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [completedLecture, setCompletedLecture] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  const token = user?.token;
  const fetchProgress = async () => {
    const { progress } = await getProgress(courseId, token);
    setCompletedLecture(progress.completedLectures);
  };

  const isCompleted = (lectureId) => {
    return completedLecture.includes(lectureId);
  };
  useEffect(() => {
    fetchProgress();
  }, []);

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
          duration={lecture.duration}
        />
      )}
      <div className="flex flex-col items-center">
        {!isCompleted && (
          <Button
            label="marquer complété"
            className="bg-green-500 text-white"
            onClick={handleLectureCompleted}
          />
        )}
      </div>
    </div>
  );
}
