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

const CourseSection = ({ section, isOpen, onToggle, onLectureClick }) => {
  return (
    <Card className="border-none w-full">
      <Button
        variant="simple"
        outline
        label={section.title}
        iconEnd={isOpen ? HiChevronUp : HiChevronDown}
        className="w-full justify-between py-4 px-6"
        onClick={onToggle}
      />

      {isOpen && (
        <div className="space-y-1">
          {section.lectures.map((lecture) => {
            const Icon =
              lecture.type === "video" ? FaPlayCircle : HiExclamationCircle;
            return (
              <div
                key={lecture._id}
                onClick={() => onLectureClick(lecture._id)}
                className="w-full flex justify-between items-center py-3 px-8 text-l text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors border-b border-gray-200 last:border-b-0 cursor-pointer"
              >
                {/* Titre de la leçon avec icône */}
                <div className="flex items-center">
                  <Icon className="mr-2 h-5 w-5 text-blue-500" />
                  <span>{lecture.title}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};
export default CourseSection;
