/* eslint-disable react/prop-types */
import { useContext } from "react";
import Section from "./Section";
import { CourseContext } from "../../../context/courseContext";
import Button from "../../../ui/Button";
import { HiPlus } from "react-icons/hi2";

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
        <Button onClick={handleAddSection} variant="simple">
          <HiPlus />
          <span>Ajouter un chapitre</span>
        </Button>
      </div>
    </div>
  );
}
