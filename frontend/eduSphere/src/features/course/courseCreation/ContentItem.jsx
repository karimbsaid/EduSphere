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
        <input
          type="text"
          value={content.title}
          onChange={(e) => handleContentChange("title", e.target.value)}
          placeholder={`${
            content.type === "video"
              ? "Vidéo"
              : content.type === "quiz"
              ? "Quiz"
              : "Texte"
          } Titre`}
          className="w-2/3 p-2 border rounded"
        />

        <HiOutlineTrash
          onClick={handleDeleteContent}
          className=" hover:bg-gray-100 rounded"
          size={20}
        />
      </div>
      {content.type === "quiz" && (
        <QuizEditor
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
