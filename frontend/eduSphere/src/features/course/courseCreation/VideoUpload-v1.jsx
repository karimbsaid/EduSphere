/* eslint-disable react/prop-types */
import { FiVideo, FiUploadCloud } from "react-icons/fi";

export default function VideoUpload({
  sectionIndex,
  contentIndex,
  content,
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
                      ...(prev.isEdit && !content.isNew && { updated: true }),
                    }
                  : content
              ),
            }
          : section
      ),
    }));
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
      {/* Section Upload Vidéo */}
      <div className="flex flex-col gap-2">
        <label className="block text-sm font-medium text-gray-700">
          Video Upload
        </label>

        <div className="flex items-center gap-3">
          {/* Bouton personnalisé pour l'upload */}
          <button
            type="button"
            onClick={() =>
              document
                .getElementById(`videoUpload-${sectionIndex}-${contentIndex}`)
                .click()
            }
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <FiUploadCloud className="h-5 w-5 mr-2 text-gray-400" />
            Upload Video
          </button>

          {/* Input fichier caché */}
          <input
            id={`videoUpload-${sectionIndex}-${contentIndex}`}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => handleContentChange("file", e.target.files[0])}
          />

          {content.file && (
            <span className="text-sm text-gray-600 flex items-center">
              <FiVideo className="mr-2 h-4 w-4" />
              {content.file.name}
            </span>
          )}
        </div>
      </div>

      {/* Durée de la vidéo */}
      <div className="flex items-center gap-2">
        <label
          htmlFor={`videoDuration-${sectionIndex}-${contentIndex}`}
          className="text-sm font-medium text-gray-700"
        >
          Duration:
        </label>
        <input
          id={`videoDuration-${sectionIndex}-${contentIndex}`}
          type="text"
          placeholder="MM:SS"
          value={content.duration || ""}
          onChange={(e) => handleContentChange("duration", e.target.value)}
          className="w-24 px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
    </div>
  );
}
