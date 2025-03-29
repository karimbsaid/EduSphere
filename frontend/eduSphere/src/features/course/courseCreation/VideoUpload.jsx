/* eslint-disable react/prop-types */
import { FiVideo, FiUploadCloud } from "react-icons/fi";
import FileUploader from "../../../components/FileUploader";

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
  const handleFileChange = (file) => {
    handleContentChange("file", file);
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
      {/* Section Upload Vidéo */}
      <FileUploader
        file={content.file || content.url}
        onFileSelect={handleFileChange}
        acceptedTypes="video/mp4,video/webm,video/ogg"
      />

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
