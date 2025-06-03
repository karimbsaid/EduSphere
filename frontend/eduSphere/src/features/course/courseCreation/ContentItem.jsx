/* eslint-disable react/prop-types */
import { HiOutlineTrash } from "react-icons/hi2";
import QuizEditor from "./QuizEditor";
import VideoUpload from "./VideoUpload";
import { useContext } from "react";
import { CourseContext } from "../../../context/courseContext";

export default function ContentItem({ content, sectionIndex, contentIndex }) {
  const { dispatch } = useContext(CourseContext);

  const handleContentChange = (field, value) => {
    dispatch({
      type: "UPDATE_LECTURE_FIELD",
      sectionIndex,
      lectureIndex: contentIndex,
      field,
      value,
    });
  };

  const handleDeleteContent = () => {
    dispatch({
      type: "DELETE_LECTURE",
      sectionIndex,
      lectureIndex: contentIndex,
    });
  };

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-3">
            <input
              type="text"
              value={content.title}
              onChange={(e) => handleContentChange("title", e.target.value)}
              placeholder={`${
                content.type === "video" ? "Vidéo" : "Quiz"
              } Titre`}
              className="w-full px-3 py-2 text-sm font-medium bg-white border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            {content.type === "quiz" && (
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-600 min-w-fit">
                  Durée:
                </label>
                <input
                  type="text"
                  placeholder="300 secondes"
                  value={content.duration || ""}
                  onChange={(e) =>
                    handleContentChange("duration", e.target.value)
                  }
                  className="w-32 px-3 py-1 text-sm bg-white border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            )}
          </div>
          <button
            onClick={handleDeleteContent}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
          >
            <HiOutlineTrash size={16} />
          </button>
        </div>
      </div>

      <div className="p-4">
        {content.type === "quiz" && (
          <QuizEditor
            content={content}
            questions={content.questions}
            sectionIndex={sectionIndex}
            contentIndex={contentIndex}
          />
        )}
        {content.type === "video" && (
          <VideoUpload
            content={content}
            sectionIndex={sectionIndex}
            contentIndex={contentIndex}
          />
        )}
      </div>
    </div>
  );
}
