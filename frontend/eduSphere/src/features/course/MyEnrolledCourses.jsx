/* eslint-disable react/prop-types */

import ProgressBar from "../../components/ProgressBar";

export default function EnrolledCourseCard({ enrolledCourse }) {
  const { coverImage, title } = enrolledCourse.course;
  const { progressPercentage } = enrolledCourse.progress;
  return (
    <div className="flex items-center p-4 bg-white rounded-xl shadow-md w-full max-w-md">
      <img
        src={coverImage.url}
        alt="AI & Virtual Reality"
        className="w-12 h-12 rounded-lg object-cover"
      />
      <div className="flex flex-col justify-between ml-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          {title}
        </h3>
        <ProgressBar total={100} myAvance={progressPercentage} />
      </div>
    </div>
  );
}
