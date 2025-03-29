/* eslint-disable react/prop-types */
import React from "react";
import Card from "../../../ui/Card";
import Button from "../../../ui/Button";
import ProgressBar from "../../../components/ProgressBar";
import { FaFile } from "react-icons/fa";
import { MdFileDownload, MdQuiz, MdVideocam } from "react-icons/md";

export default function CourseIncludes({
  isEnrolled = false,
  myProgress = 0,
  totalVideo,
  totalResource,
  totalQuiz,
  handleWatchCourse,
}) {
  return (
    <Card className="p-6 space-y-4 text-center">
      <h2 className="text-2xl font-bold">$149.99</h2>
      <Button
        label={isEnrolled ? "continue" : "Enroll Now"}
        className="w-full bg-black text-white"
        onClick={handleWatchCourse}
      />
      <p className="text-gray-500 text-sm">30-Day Money-Back Guarantee</p>
      <div className="text-left space-y-2">
        <h3 className="font-semibold">This course includes:</h3>

        <p className="flex items-center gap-2">
          <MdQuiz /> {totalQuiz} Quiz
        </p>
        <p className="flex items-center gap-2">
          <MdVideocam /> {totalVideo} video
        </p>
        <p className="flex items-center gap-2">
          <MdFileDownload /> {totalResource} resources
        </p>
      </div>
      {isEnrolled && (
        <div className="text-left">
          <h3 className="font-semibold">Course progress:</h3>
          <ProgressBar myAvance={myProgress} total={100} className="h-2" />
          <p className="text-gray-500 text-sm">{myProgress}% complete</p>
        </div>
      )}
    </Card>
  );
}
