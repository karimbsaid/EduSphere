/* eslint-disable react/prop-types */
import Section from "./Section";

export default function CourseCurriculum({ courseData, setCourseData }) {
  const handleAddSection = () => {
    setCourseData((prev) => ({
      ...prev,
      sections: [
        ...prev.sections,
        { title: "", lectures: [], ...(prev.isEdit && { isNew: true }) },
      ],
    }));
  };
  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold">Programme du cours</h2>
      <div className="space-y-6">
        {courseData.sections.map((section, sectionIndex) => (
          <div
            key={sectionIndex}
            className={`${section.deleted ? "hidden" : ""}`}
          >
            <Section
              section={section}
              sectionIndex={sectionIndex}
              setCourseData={setCourseData}
            />
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
