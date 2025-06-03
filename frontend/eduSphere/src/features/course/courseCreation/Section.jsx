/* eslint-disable react/prop-types */
import {
  HiOutlineTrash,
  HiQuestionMarkCircle,
  HiVideoCamera,
  HiChevronDown,
  HiChevronRight,
} from "react-icons/hi2";
import { useState } from "react";
import ContentItem from "./ContentItem";
import { CourseContext } from "../../../context/courseContext";
import { useContext } from "react";
import Button from "../../../ui/Button";

export default function Section({ section, sectionIndex }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const { dispatch } = useContext(CourseContext);

  const handleSectionChange = (field, value) => {
    dispatch({
      type: "UPDATE_SECTION_FIELD",
      sectionIndex,
      field,
      value,
    });
  };

  const handleAddContent = (type) => {
    dispatch({ type: "ADD_LECTURE", sectionIndex, contentType: type });
  };

  const handleDeleteSection = () => {
    dispatch({ type: "DELETE_SECTION", sectionIndex });
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const lectureCount = section.lectures.filter(
    (lecture) => !lecture.deleted
  ).length;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md">
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center flex-1 gap-3">
            <button
              onClick={toggleExpanded}
              className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-md transition-colors"
              aria-label={
                isExpanded ? "Réduire la section" : "Développer la section"
              }
            >
              {isExpanded ? (
                <HiChevronDown size={20} />
              ) : (
                <HiChevronRight size={20} />
              )}
            </button>

            <div className="flex-1">
              <input
                type="text"
                value={section.title}
                onChange={(e) => handleSectionChange("title", e.target.value)}
                placeholder={`Section ${sectionIndex + 1} Titre`}
                className="text-lg font-medium bg-transparent border-none outline-none w-full text-gray-800 placeholder-gray-400"
              />
              <div className="text-sm text-gray-500 mt-1">
                {lectureCount} {lectureCount === 1 ? "élément" : "éléments"}
              </div>
            </div>
          </div>

          <button
            onClick={handleDeleteSection}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            aria-label="Supprimer la section"
          >
            <HiOutlineTrash size={18} />
          </button>
        </div>
      </div>

      <div
        className={`transition-all duration-300 ease-in-out ${
          isExpanded
            ? "max-h-none opacity-100"
            : "max-h-0 opacity-0 overflow-hidden"
        }`}
      >
        <div className="p-6">
          <div className="space-y-3">
            {section.lectures.map((content, contentIndex) => (
              <div
                key={contentIndex}
                className={`${
                  content.deleted ? "hidden" : ""
                } transition-all duration-200`}
              >
                <ContentItem
                  content={content}
                  sectionIndex={sectionIndex}
                  contentIndex={contentIndex}
                />
              </div>
            ))}

            {lectureCount === 0 && (
              <div className="text-center py-8 text-gray-400">
                <div className="text-lg mb-2">📚</div>
                <p>Aucun contenu pour le moment</p>
                <p className="text-sm">
                  Ajoutez une vidéo ou un quiz pour commencer
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
            <Button
              variant="simple"
              outline
              size="sm"
              onClick={() => handleAddContent("video")}
              className="transition-all duration-200 hover:scale-105"
            >
              <HiVideoCamera className="w-4 h-4" />
              <span>Vidéo</span>
            </Button>
            <Button
              variant="simple"
              outline
              size="sm"
              onClick={() => handleAddContent("quiz")}
              className="transition-all duration-200 hover:scale-105"
            >
              <HiQuestionMarkCircle className="w-4 h-4" />
              <span>Quiz</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
