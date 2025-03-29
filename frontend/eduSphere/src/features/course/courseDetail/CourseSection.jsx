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
    <Card className="border-none">
      <Button
        variant="ghost"
        label={section.title}
        iconEnd={isOpen ? HiChevronUp : HiChevronDown}
        className="w-full justify-between py-4 px-6"
        onClick={onToggle}
      />

      {isOpen && (
        <div className="space-y-1">
          {section.lectures.map((lecture) => (
            <Button
              key={lecture._id}
              variant="ghost"
              label={lecture.title}
              icon={
                lecture.type === "video" ? FaPlayCircle : HiExclamationCircle
              }
              className={`w-full justify-between py-3 px-6 text-sm rounded-none `}
              onClick={() => onLectureClick(lecture._id)}
            />
          ))}
        </div>
      )}
    </Card>
  );
};
export default CourseSection;
