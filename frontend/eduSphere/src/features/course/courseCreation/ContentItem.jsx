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
  console.log("content :", content);
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
