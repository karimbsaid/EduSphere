/* eslint-disable react/prop-types */
import {
  HiOutlineTrash,
  HiQuestionMarkCircle,
  HiVideoCamera,
} from "react-icons/hi2";
import ContentItem from "./ContentItem";
import { CourseContext } from "../../../context/courseContext";
import { useContext } from "react";
import Button from "../../../ui/Button";

export default function Section({ section, sectionIndex }) {
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

  return (
    <div className="rounded-lg border p-4">
      <div className="mb-2 flex items-center justify-between">
        <input
          type="text"
          value={section.title}
          onChange={(e) => handleSectionChange("title", e.target.value)}
          placeholder={`Section ${sectionIndex + 1} Titre`}
          className="mb-2 w-2/3  p-2 border rounded"
        />
        <HiOutlineTrash size={20} onClick={handleDeleteSection} />
      </div>

      {section.lectures.map((content, contentIndex) => (
        <div
          key={contentIndex}
          className={`${content.deleted ? "hidden" : ""}`}
        >
          <ContentItem
            content={content}
            sectionIndex={sectionIndex}
            contentIndex={contentIndex}
          />
        </div>
      ))}
      <div className="mt-4 flex space-x-2">
        <Button
          variant="simple"
          outline
          onClick={() => handleAddContent("video")}
        >
          <HiVideoCamera />
          <span> Ajouter une vidéo</span>
        </Button>
        <Button
          variant="simple"
          outline
          onClick={() => handleAddContent("quiz")}
        >
          <HiQuestionMarkCircle />
          <span>Ajouter un quiz</span>
        </Button>
      </div>
    </div>
  );
}
