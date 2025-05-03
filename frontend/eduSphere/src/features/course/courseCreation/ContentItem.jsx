/* eslint-disable react/prop-types */
import { HiOutlineTrash } from "react-icons/hi2";
import QuizEditor from "./QuizEditor";
import VideoUpload from "./VideoUpload";

export default function ContentItem({
  content,
  sectionIndex,
  contentIndex,
  setCourseData,
}) {
  const handleContentChange = (field, value) => {
    setCourseData((prev) => ({
      ...prev,
      sections: prev.sections.map((section, i) =>
        i === sectionIndex
          ? {
              ...section,
              lectures: section.lectures.map((content, j) =>
                j === contentIndex
                  ? {
                      ...content,
                      [field]: value,
                      ...(prev.isEdit && !content.isNew && { updated: true }), // Ajout de updated: true si prev.isEdit est true
                    }
                  : content
              ),
            }
          : section
      ),
    }));
  };

  const handleDeleteContent = () => {
    setCourseData((prev) => ({
      ...prev,
      sections: prev.sections.map((section, i) =>
        i === sectionIndex
          ? {
              ...section,
              lectures: section.lectures
                .map((content, j) =>
                  j === contentIndex
                    ? prev.isEdit && !content.isNew
                      ? { ...content, deleted: true } // Marquer comme supprimé si en mode édition et pas nouveau
                      : null // Supprimer immédiatement sinon
                    : content
                )
                .filter(Boolean), // Supprime les null (contenus réellement supprimés)
            }
          : section
      ),
    }));
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
          setCourseData={setCourseData}
        />
      )}
      {content.type === "video" && (
        <VideoUpload
          content={content}
          sectionIndex={sectionIndex}
          contentIndex={contentIndex}
          setCourseData={setCourseData}
        />
      )}
    </div>
  );
}
