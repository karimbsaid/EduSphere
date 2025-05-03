/* eslint-disable react/prop-types */
import React from "react";
import Card from "../../../ui/Card";
import Button from "../../../ui/Button";
import ProgressBar from "../../../components/ProgressBar";
import { MdFileDownload, MdQuiz, MdVideocam } from "react-icons/md";

export default function CourseIncludes({
  onActionClick,
  courseDetail,
  isInstructor,
}) {
  const { quizCount, videoCount } = courseDetail.sections?.reduce(
    (counts, section) => {
      section.lectures?.forEach((lecture) => {
        if (lecture.type === "quiz") counts.quizCount += 1;
        if (lecture.type === "video") counts.videoCount += 1;
      });
      return counts;
    },
    { quizCount: 0, videoCount: 0 }
  ) || { quizCount: 0, videoCount: 0 };

  const totalResource = courseDetail.resources?.length || 0;
  const isEnrolled = !!courseDetail.progress;

  const getActionLabel = () => {
    if (isInstructor) return "Preview";
    return isEnrolled ? "Continue" : "Enroll Now";
  };

  return (
    <Card className="p-6 space-y-4 text-center">
      <h2 className="text-2xl font-bold">
        {courseDetail.price > 0 ? `${courseDetail.price} TND` : "Gratuit"}
      </h2>
      <div className="flex justify-center">
        <Button
          label={getActionLabel()}
          className="w-full bg-black text-white"
          onClick={onActionClick}
        />
      </div>
      <p className="text-gray-500 text-base">Accès illimité à vie</p>

      <div className="text-left space-y-2">
        <h3 className="font-semibold">Ce cours comprend :</h3>
        <p className="flex items-center gap-2">
          <MdQuiz /> {quizCount} Quiz
        </p>
        <p className="flex items-center gap-2">
          <MdVideocam /> {videoCount} Vidéos
        </p>
        <p className="flex items-center gap-2">
          <MdFileDownload /> {totalResource} Ressources
        </p>
      </div>

      {isEnrolled && courseDetail.progress && (
        <div className="text-left">
          <h3 className="font-semibold">Progression du cours :</h3>
          <ProgressBar
            myAvance={courseDetail.progress.progressPercentage}
            total={100}
            className="h-2"
          />
          <p className="text-gray-500 text-sm">
            {courseDetail.progress.progressPercentage}% terminé
          </p>
        </div>
      )}
    </Card>
  );
}
