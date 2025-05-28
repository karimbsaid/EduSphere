/* eslint-disable react/prop-types */
import { FiVideo, FiUploadCloud } from "react-icons/fi";
import FileUploader from "../../../components/FileUploader";
import { CourseContext } from "../../../context/courseContext";
import { useContext, useEffect } from "react";

export default function VideoUpload({ sectionIndex, contentIndex, content }) {
  const { dispatch } = useContext(CourseContext);
  console.log(content.file);
  const handleContentChange = (field, value) => {
    dispatch({
      type: "UPDATE_LECTURE_FIELD",
      sectionIndex,
      lectureIndex: contentIndex,
      field,
      value,
    });
  };
  const handleFileChange = (file) => {
    handleContentChange("file", file);
  };

  useEffect(() => {
    const source = content.file
      ? URL.createObjectURL(content.file)
      : content.url;

    if (!source) return;

    const video = document.createElement("video");
    video.preload = "metadata";
    video.src = source;

    video.onloadedmetadata = () => {
      if (!content.duration) {
        const durationInSeconds = Math.floor(video.duration);
        handleContentChange("duration", durationInSeconds);
      }

      if (content.file) URL.revokeObjectURL(source);
    };
  }, [content.file, content.url]);
  return (
    <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
      <FileUploader
        file={content.file || content.url}
        onFileSelect={handleFileChange}
        acceptedTypes="video/mp4,video/webm,video/ogg"
      />

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
