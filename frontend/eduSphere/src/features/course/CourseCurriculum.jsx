/* eslint-disable react/prop-types */
import Section from "./Section";

export default function CourseCurriculum({ courseData, setCourseData }) {
  const handleAddSection = () => {
    setCourseData((prev) => {
      if (prev.isEdit) {
        return {
          ...prev,
          sections: [
            ...prev.sections,
            { title: "", lectures: [], isNew: true },
          ],
        };
      } else {
        return {
          ...prev,
          sections: [...prev.sections, { title: "", lectures: [] }],
        };
      }
    });
  };
  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold">Programme du cours</h2>
      <div className="space-y-6">
        {courseData.sections.map((section, sectionIndex) => (
          <Section
            key={sectionIndex}
            section={section}
            sectionIndex={sectionIndex}
            setCourseData={setCourseData}
          />
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
