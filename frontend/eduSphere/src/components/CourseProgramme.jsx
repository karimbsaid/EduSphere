/* eslint-disable react/prop-types */
import React, { useState } from "react";
import { HiChevronDown, HiChevronRight } from "react-icons/hi2";
import { NavLink } from "react-router-dom";

export default function CourseProgramme({ course }) {
  const [openSections, setOpenSections] = useState({});

  const toggleSection = (sectionId) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const isSectionCompleted = (sectionId) => {
    return course.progress?.completedSections.includes(sectionId);
  };
  const isLectureCompleted = (lectureId) => {
    return course.progress?.completedLectures.includes(lectureId);
  };
  return (
    <div>
      {course && (
        <div className="p-4 text-white text-center font-bold text-lg uppercase">
          {course.title}
        </div>
      )}

      {course?.sections?.map((section) => {
        const sectionCompleted = isSectionCompleted(section._id);

        return (
          <div key={section._id}>
            <button
              className="flex items-center w-full px-4 py-3 hover:bg-gray-700 rounded-md"
              onClick={() => toggleSection(section._id)}
            >
              {openSections[section._id] ? (
                <HiChevronDown />
              ) : (
                <HiChevronRight />
              )}
              <span className="ml-3">{section.title}</span>
            </button>
            {openSections[section._id] && (
              <div className="pl-6 space-y-1">
                {section.lectures.map((lecture) => {
                  const lectureCompleted = isLectureCompleted(lecture._id);
                  return (
                    <NavLink
                      key={lecture._id}
                      to={`/course/${course._id}/chapter/${section._id}/lecture/${lecture._id}`}
                      className={`block px-4 py-2 text-sm rounded-md hover:bg-gray-700 transition-colors ${
                        lectureCompleted || sectionCompleted
                          ? "bg-green-500"
                          : ""
                      }`}
                    >
                      {lecture.title}
                    </NavLink>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
