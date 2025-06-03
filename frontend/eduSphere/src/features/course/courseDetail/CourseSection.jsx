/* eslint-disable react/prop-types */
import React from "react";
import Card from "../../../ui/Card";
import Button from "../../../ui/Button";
import {
  HiChevronDown,
  HiChevronUp,
  HiExclamationCircle,
} from "react-icons/hi2";
import { FaPlayCircle } from "react-icons/fa";
import { MdAccessTime } from "react-icons/md";

const CourseSection = ({ section, isOpen, onToggle, onLectureClick }) => {
  // Calculate total lectures count
  const lectureCount = section.lectures.length;

  return (
    <Card className="mb-4 overflow-hidden bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-700">
      {/* Section Header */}
      <div className="relative">
        <Button
          variant="simple"
          outline
          label={
            <div className="flex items-center justify-between w-full">
              <div className="flex flex-col items-start">
                <span className="font-semibold text-gray-900 dark:text-white text-left">
                  {section.title}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {lectureCount} {lectureCount === 1 ? "lecture" : "lectures"}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {isOpen ? (
                  <HiChevronUp className="h-5 w-5 text-gray-600 dark:text-gray-300 transition-transform duration-200" />
                ) : (
                  <HiChevronDown className="h-5 w-5 text-gray-600 dark:text-gray-300 transition-transform duration-200" />
                )}
              </div>
            </div>
          }
          className="w-full py-5 px-6 text-left hover:bg-gray-50 dark:hover:bg-gray-800 border-0 rounded-lg transition-colors duration-200"
          onClick={onToggle}
        />
      </div>

      {/* Lectures List with Smooth Animation */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        {isOpen && (
          <div className="border-t border-gray-100 dark:border-gray-800">
            <div className="bg-gray-50 dark:bg-gray-800/50">
              {section.lectures.map((lecture, index) => {
                const Icon =
                  lecture.type === "video" ? FaPlayCircle : HiExclamationCircle;
                const iconColor =
                  lecture.type === "video" ? "text-blue-500" : "text-amber-500";

                return (
                  <div
                    key={lecture._id}
                    onClick={() => onLectureClick(lecture._id)}
                    className={`
                      group flex items-center justify-between py-4 px-8 
                      text-gray-700 dark:text-gray-300 
                      hover:bg-white dark:hover:bg-gray-700 
                      hover:text-blue-600 dark:hover:text-blue-400
                      transition-all duration-200 cursor-pointer
                      ${
                        index !== section.lectures.length - 1
                          ? "border-b border-gray-200 dark:border-gray-700"
                          : ""
                      }
                    `}
                  >
                    {/* Left side - Icon and Title */}
                    <div className="flex items-center space-x-3 flex-1">
                      <div
                        className={`
                        flex items-center justify-center w-8 h-8 rounded-full 
                        bg-gray-100 dark:bg-gray-700 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30
                        transition-colors duration-200
                      `}
                      >
                        <Icon
                          className={`h-4 w-4 ${iconColor} group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200`}
                        />
                      </div>

                      <div className="flex flex-col">
                        <span className="font-medium text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                          {lecture.title}
                        </span>
                        <div className="flex items-center space-x-2 mt-1">
                          <span
                            className={`
                            text-xs px-2 py-1 rounded-full font-medium
                            ${
                              lecture.type === "video"
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                            }
                          `}
                          >
                            {lecture.type === "video" ? "Video" : "Quiz"}
                          </span>
                          {lecture.duration && (
                            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                              <MdAccessTime className="h-3 w-3 mr-1" />
                              <span>
                                {Math.floor(lecture.duration / 60)}:
                                {(lecture.duration % 60)
                                  .toString()
                                  .padStart(2, "0")}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right side - Hover indicator */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="w-2 h-6 bg-blue-500 rounded-full"></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default CourseSection;
