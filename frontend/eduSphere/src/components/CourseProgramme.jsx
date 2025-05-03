/* eslint-disable react/prop-types */
import React, { useState } from "react";
import { HiChevronDown, HiChevronRight } from "react-icons/hi2";
import { NavLink, useParams } from "react-router-dom";

export default function CourseProgramme({ course }) {
  console.log(course);
  const { sectionId, lectureId } = useParams();
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
        const isCurrentSection = sectionId === section._id;

        return (
          <div key={section._id}>
            <button
              className={`flex items-center w-full px-4 py-3 rounded-md transition-colors
          ${isCurrentSection ? "bg-blue-600" : "hover:bg-gray-700"}
        `}
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
                  const isCurrentLecture = lectureId === lecture._id;

                  return (
                    <NavLink
                      key={lecture._id}
                      to={`/course/${course._id}/chapter/${section._id}/lecture/${lecture._id}`}
                      className={`block mt-2 px-4 py-2 text-sm rounded-md transition-colors
                  ${isCurrentLecture ? "bg-blue-500 text-white" : ""}
                  ${lectureCompleted || sectionCompleted ? "bg-green-500" : ""}
                  ${
                    !isCurrentLecture && !(lectureCompleted || sectionCompleted)
                      ? "hover:bg-gray-700"
                      : ""
                  }
                `}
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
