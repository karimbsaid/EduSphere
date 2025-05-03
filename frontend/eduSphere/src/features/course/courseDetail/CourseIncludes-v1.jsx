/* eslint-disable react/prop-types */
import React from "react";
import Card from "../../../ui/Card";
import Button from "../../../ui/Button";
import ProgressBar from "../../../components/ProgressBar";
import { FaFile } from "react-icons/fa";
import { MdFileDownload, MdQuiz, MdVideocam } from "react-icons/md";

export default function CourseIncludes({ handleWatchCourse, courseDetail }) {
  const { quizCount, videoCount } = courseDetail.sections?.reduce(
    (counts, section) => {
      section.lectures?.forEach((lecture) => {
        if (lecture.type === "quiz") counts.quizCount += 1;
        else if (lecture.type === "video") counts.videoCount += 1;
      });
      return counts;
    },
    { quizCount: 0, videoCount: 0 }
  ) || { quizCount: 0, videoCount: 0 };

  const totalResource = courseDetail.resources?.length;
  const { progress } = courseDetail;
  const isEnrolled = progress ? true : false;

  return (
    <Card className="p-6 space-y-4 text-center">
      <h2 className="text-2xl font-bold">
        {courseDetail.price > 0 ? `${courseDetail.price} TND` : "gratuit"}{" "}
      </h2>
      <div className="flex justify-center">
        <Button
          label={isEnrolled ? "continue" : "Enroll Now"}
          className="w-full bg-black text-white"
          onClick={handleWatchCourse}
        />
      </div>
      <p className="text-gray-500 text-base">lifetime free access</p>
      <div className="text-left space-y-2">
        <h3 className="font-semibold">This course includes:</h3>

        <p className="flex items-center gap-2">
          <MdQuiz /> {quizCount} Quiz
        </p>
        <p className="flex items-center gap-2">
          <MdVideocam /> {videoCount} video
        </p>
        <p className="flex items-center gap-2">
          <MdFileDownload /> {totalResource} resources
        </p>
      </div>
      {isEnrolled && (
        <div className="text-left">
          <h3 className="font-semibold">Course progress:</h3>
          <ProgressBar
            myAvance={progress.progressPercentage}
            total={100}
            className="h-2"
          />
          <p className="text-gray-500 text-sm">
            {progress.progressPercentage}% complete
          </p>
        </div>
      )}
    </Card>
  );
}
