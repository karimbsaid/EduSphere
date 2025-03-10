/* eslint-disable react/prop-types */
import { useState } from "react";
import {
  HiBookOpen,
  HiVideoCamera,
  HiClock,
  HiChevronUp,
  HiChevronDown,
  HiMiniPlayCircle,
  HiClipboardDocumentCheck,
  HiDocumentText,
} from "react-icons/hi2";
import { convertSecondToTime } from "../../utils/convertSecondToTime";

export default function CourseContent({ course }) {
  const [activeSection, setActiveSection] = useState({});
  const { sections, totalDuration, progress } = course;
  const { completedSections, completedLectures } = progress;
  const isSectionCompleted = (sectionId) => {
    return completedSections.includes(sectionId);
  };
  const isLectureCompleted = (lectureId) => {
    return completedLectures.includes(lectureId);
  };
  const typeToIcon = {
    video: <HiVideoCamera size={20} />,
    quiz: <HiClipboardDocumentCheck size={20} />,
    document: <HiDocumentText size={20} />,
  };

  const toggleSection = (sectionId) => {
    setActiveSection((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };
  const { totalHeures, totalMinutes, totalSecond } =
    convertSecondToTime(totalDuration);
  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-6 mt-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Course content
        </h2>
        <div className="flex gap-4 text-gray-600">
          <div className="flex items-center">
            <HiBookOpen size={20} className="mr-1" />
            <span>{sections.length} sections</span>
          </div>
          <div className="flex items-center">
            <HiVideoCamera size={20} className="mr-1" />
            <span>
              {sections.reduce((acc, sec) => acc + sec.lectures.length, 0)}{" "}
              lectures
            </span>
          </div>
          <div className="flex items-center">
            <HiClock size={20} className="mr-1" />
            <span>{totalHeures || 0} hours total length</span>
          </div>
        </div>
      </div>

      {sections.map((section) => (
        <div key={section._id} className="mb-6 ">
          <div
            className="flex items-center gap-3 mb-4 cursor-pointer"
            onClick={() => toggleSection(section._id)}
          >
            {activeSection[section._id] ? <HiChevronUp /> : <HiChevronDown />}
            <h3 className="text-lg font-semibold text-gray-800">
              <span
                className={`px-2 py-1 ${
                  isSectionCompleted(section._id) ? "bg-green-400" : ""
                }`}
              >
                {section.title}
              </span>
            </h3>
          </div>

          {activeSection[section._id] && (
            <div>
              {section.lectures.map((lecture) => (
                <div key={lecture._id} className="space-y-3">
                  <div
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      isLectureCompleted(lecture._id)
                        ? "bg-green-400"
                        : "bg-gray-50"
                    }`}
                  >
                    {typeToIcon[lecture.type]}
                    <span className="text-gray-600">{lecture.title}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
