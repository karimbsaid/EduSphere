/* eslint-disable react/prop-types */
import { FaStar, FaUserGraduate } from "react-icons/fa";
import { MdAccessTime } from "react-icons/md";
import { IoBarChartSharp } from "react-icons/io5";
import Card from "../../../ui/Card";
import { convertSecondToTime } from "../../../utils/convertSecondToTime";

export default function CourseCard({ course }) {
  console.log(course);

  const { hours, minutes, seconds } = convertSecondToTime(course.totalDuration);
  const formattedDuration = hours
    ? `${hours} hours`
    : minutes
    ? `${minutes} minutes`
    : `${seconds} seconds`;

  return (
    <Card className="w-full bg-white dark:bg-gray-900 shadow-lg rounded-lg overflow-hidden">
      <div className="h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
        <img
          src={course.imageUrl}
          className="w-full h-full object-fill" // Ajouter ces classes
          alt={course.title}
        />
      </div>

      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
        {course.title}
      </h2>

      <p className="text-gray-600 dark:text-gray-300 text-sm mt-2">
        {course.description}
      </p>

      <div className="flex items-center space-x-4 mt-4 text-gray-700 dark:text-gray-300 text-sm">
        <div className="flex items-center">
          <FaStar className="text-yellow-500" />
          <span className="ml-1">
            {" "}
            {course.averageRating} ({course.ratingsQuantity} ratings)
          </span>
        </div>
        <div className="flex items-center">
          <MdAccessTime className="text-gray-500" />
          <span className="ml-1">{formattedDuration}</span>
        </div>
      </div>

      <div className="flex items-center space-x-4 mt-2 text-gray-700 dark:text-gray-300 text-sm">
        <div className="flex items-center">
          <IoBarChartSharp className="text-blue-500" />
          <span className="ml-1">{course.level}</span>
        </div>
        <div className="flex items-center">
          <FaUserGraduate className="text-green-500" />
          <span className="ml-1">{course.totalStudent} students</span>
        </div>
      </div>
    </Card>
  );
}
