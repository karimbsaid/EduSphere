/* eslint-disable react/prop-types */
import { HiOutlineTrash } from "react-icons/hi2";
import ContentItem from "./ContentItem";

export default function Section({ section, sectionIndex, setCourseData }) {
  const handleSectionChange = (field, value) => {
    setCourseData((prev) => ({
      ...prev,
      sections: prev.sections.map((section, i) =>
        i === sectionIndex
          ? {
              ...section,
              [field]: value,
              ...(prev.isEdit && !section.isNew && { updated: true }),
            }
          : section
      ),
    }));
  };

  const handleAddContent = (type) => {
    setCourseData((prev) => ({
      ...prev,
      sections: prev.sections.map((section, i) =>
        i === sectionIndex
          ? {
              ...section,
              lectures: [
                ...section.lectures,
                {
                  type,
                  title: "",
                  ...(type === "video" && { file: null, duration: "" }),
                  ...(type === "quiz" && { questions: [] }),
                  ...(type === "text" && { content: "" }),
                  ...(prev.isEdit && { isNew: true }), // Ajout de isNew uniquement si prev.isEdit est true
                },
              ],
            }
          : section
      ),
    }));
  };
  const handleDeleteSection = () => {
    setCourseData((prev) => ({
      ...prev,
      sections: prev.sections
        .map((section, i) =>
          i === sectionIndex
            ? prev.isEdit && !section.isNew
              ? { ...section, deleted: true } // Marquer la section comme supprimée si en mode édition et qu'elle n'est pas nouvelle
              : null // Supprimer la section immédiatement si elle est nouvelle et en mode édition
            : section
        )
        .filter(Boolean), // Filtrer les sections nulles (supprimées)
    }));
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
            setCourseData={setCourseData}
          />
        </div>
      ))}
      <div className="mt-4 flex space-x-2">
        <button
          className="p-2 border rounded hover:bg-gray-50"
          onClick={() => handleAddContent("video")}
        >
          📹 Ajouter une vidéo
        </button>
        <button
          className="p-2 border rounded hover:bg-gray-50"
          onClick={() => handleAddContent("quiz")}
        >
          ❓ Ajouter un quiz
        </button>
        <button
          className="p-2 border rounded hover:bg-gray-50"
          onClick={() => handleAddContent("text")}
        >
          📝 Ajouter du texte
        </button>
      </div>
    </div>
  );
}
