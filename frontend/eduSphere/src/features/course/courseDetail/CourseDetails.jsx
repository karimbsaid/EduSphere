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
      <div className="h-86 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
        <img
          src={course.imageUrl}
          className="w-full h-full object-fill " // Ajouter ces classes
          alt={course.title}
        />
      </div>

      <div className="p-6 space-y-4">
        {/* Title */}
        <h2 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-2 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
          {course.title}
        </h2>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed line-clamp-3">
          {course.description}
        </p>

        {/* Rating and Duration */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center space-x-1">
            <div className="flex items-center bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded-full">
              <FaStar className="text-yellow-500 w-3 h-3" />
              <span className="ml-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                {course.averageRating}
              </span>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              ({course.ratingsQuantity})
            </span>
          </div>

          <div className="flex items-center text-gray-500 dark:text-gray-400">
            <MdAccessTime className="w-4 h-4" />
            <span className="ml-1 text-sm font-medium">
              {formattedDuration}
            </span>
          </div>
        </div>

        {/* Level and Students */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center space-x-1">
            <IoBarChartSharp className="text-blue-500 w-4 h-4" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
              {course.level}
            </span>
          </div>

          <div className="flex items-center space-x-1">
            <FaUserGraduate className="text-green-500 w-4 h-4" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {course.totalStudents} students
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
