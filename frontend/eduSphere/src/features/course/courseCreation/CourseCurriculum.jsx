/* eslint-disable react/prop-types */
import { useContext } from "react";
import Section from "./Section";
import { CourseContext } from "../../../context/courseContext";

export default function CourseCurriculum() {
  const { state, dispatch } = useContext(CourseContext);
  console.log(state);

  const handleAddSection = () => {
    dispatch({ type: "ADD_SECTION" });
  };
  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold">Programme du cours</h2>
      <div className="space-y-6">
        {state.sections.map((section, sectionIndex) => (
          <div
            key={sectionIndex}
            className={`${section.deleted ? "hidden" : ""}`}
          >
            <Section section={section} sectionIndex={sectionIndex} />
          </div>
        ))}
        <button
          onClick={handleAddSection}
          className="p-2 bg-blue-500 text-white rounded"
        >
          ➕ Ajouter une section
        </button>
      </div>
    </div>
  );
}
