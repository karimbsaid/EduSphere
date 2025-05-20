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
    <div className="rounded border p-2">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex flex-col gap-2 w-full">
          <input
            type="text"
            value={content.title}
            onChange={(e) => handleContentChange("title", e.target.value)}
            placeholder={`${content.type === "video" ? "Vidéo" : "Quiz"} Titre`}
            className="w-2/3 p-2 border rounded"
          />
          {content.type === "quiz" && (
            <div className="flex items-center gap-2">
              <label
                htmlFor={`quizDuration`}
                className="text-sm font-medium text-gray-700"
              >
                Duration:
              </label>
              <input
                id={`quizDuration`}
                type="text"
                placeholder="300 secondes"
                value={content.duration || ""}
                onChange={(e) =>
                  handleContentChange("duration", e.target.value)
                }
                className="w-24 px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          )}
        </div>

        <HiOutlineTrash
          onClick={handleDeleteContent}
          className=" hover:bg-gray-100 rounded"
          size={20}
        />
      </div>
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
  );
}
