/* eslint-disable react/prop-types */
import React, { useState } from "react";
import {
  HiBookOpen,
  HiCheckCircle,
  HiChevronDown,
  HiChevronRight,
  HiClock,
  HiPlay,
} from "react-icons/hi2";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { FaPlayCircle, FaCheckCircle, FaClock } from "react-icons/fa";

export default function CourseProgramme({ course, progress }) {
  const { sectionId, lectureId } = useParams();
  const [openSections, setOpenSections] = useState({});
  const navigate = useNavigate();

  const toggleSection = (sectionId) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const isSectionCompleted = (sectionId) =>
    progress?.completedSections.includes(sectionId);

  const isLectureCompleted = (lectureId) =>
    progress?.completedLectures.includes(lectureId);

  const handleNavigate = (sectionId, lectureId) => {
    navigate(`/course/${course._id}/chapter/${sectionId}/lecture/${lectureId}`);
  };

  return (
    <div>
      {course && (
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-center shadow-lg">
          <h1 className="font-bold text-xl mb-2 text-white">{course.title}</h1>
          <div className="text-blue-100 text-sm">
            {course.sections?.length || 0} Sections • learning path
          </div>
        </div>
      )}

      {course?.sections?.map((section, sectionIndex) => {
        const sectionCompleted = isSectionCompleted(section._id);
        const isCurrentSection = sectionId === section._id;

        return (
          <div key={section._id} className="group">
            <button
              className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 m-1 ${
                sectionCompleted
                  ? "bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30"
                  : isCurrentSection
                  ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30"
                  : "hover:bg-slate-700/50 border border-transparent"
              }`}
              onClick={() => toggleSection(section._id)}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`transition-transform duration-200 ${
                    openSections[section._id] ? "rotate-90" : ""
                  }`}
                >
                  <HiChevronRight className="w-4 h-4 text-slate-400" />
                </div>
                <div className="flex items-center gap-2">
                  {sectionCompleted ? (
                    <HiCheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <HiBookOpen className="w-5 h-5 text-slate-400" />
                  )}
                  <span className="font-medium text-sm text-white text-left">
                    {section.title}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 bg-slate-800/50 px-2 py-1 rounded-full">
                  {section.lectures?.length || 0}
                </span>
              </div>
            </button>

            {openSections[section._id] && (
              <div className="pl-6 space-y-1">
                {section.lectures.map((lecture) => {
                  const lectureCompleted = isLectureCompleted(lecture._id);
                  const isCurrentLecture = lectureId === lecture._id;

                  return (
                    <button
                      key={lecture._id}
                      onClick={() => handleNavigate(section._id, lecture._id)}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-sm transition-all duration-200 m-1 ${
                        isCurrentLecture
                          ? "bg-gradient-to-r from-blue-500/30 to-purple-500/30 border-l-2 border-blue-400"
                          : lectureCompleted || sectionCompleted
                          ? "bg-green-500/10 hover:bg-green-500/20"
                          : "hover:bg-slate-700/50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {lectureCompleted || sectionCompleted ? (
                          <HiCheckCircle className="w-4 h-4 text-green-400" />
                        ) : isCurrentLecture ? (
                          <HiPlay className="w-4 h-4 text-blue-400" />
                        ) : (
                          <HiClock className="w-4 h-4 text-slate-400" />
                        )}
                        <span
                          className={`text-left ${
                            isCurrentLecture
                              ? "text-white font-medium"
                              : "text-slate-300"
                          }`}
                        >
                          {lecture.title}
                        </span>
                      </div>
                    </button>
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
