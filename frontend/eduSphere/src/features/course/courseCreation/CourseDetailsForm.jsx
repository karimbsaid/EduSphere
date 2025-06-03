import { useContext, useEffect, useState } from "react";
import { motion } from "framer-motion";
import TagInput from "../../../components/TagInput";
import { useParams } from "react-router-dom";
import { CourseContext } from "../../../context/courseContext";
import Input from "../../../ui/Input";

export default function CourseDetailsForm() {
  const { courseId } = useParams();
  const { state, dispatch } = useContext(CourseContext);
  const isEdit = state.isEdit;
  const handleCourseDataChange = (field, value) => {
    dispatch({
      type: "SET_FIELD",
      field,
      value,
      courseId,
    });
  };
  const [coverPreview, setCoverPreview] = useState(null);
  useEffect(() => {
    if (state.coverImage && !coverPreview) {
      if (state.coverImage instanceof File) {
        setCoverPreview(URL.createObjectURL(state.coverImage));
      } else if (typeof state.coverImage === "string") {
        setCoverPreview(state.coverImage);
      }
    }
  }, [state.coverImage, coverPreview]);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setCoverPreview(URL.createObjectURL(file));
      handleCourseDataChange("coverImage", file);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <h2 className="mb-6 text-2xl font-bold">Course Details</h2>
      <div className="space-y-4">
        <div>
          <Input
            label="Course Title"
            type="text"
            disabled={isEdit}
            value={state.title}
            onChange={(e) => handleCourseDataChange("title", e.target.value)}
            className="w-full"
            placeholder="Enter course title"
          />
          {/* <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700"
          >
            Course Title
          </label>
          <input
            id="title"
            type="text"
            value={state.title}
            onChange={(e) => handleCourseDataChange("title", e.target.value)}
            placeholder="Enter course title"
            className="mt-1 w-full rounded border-gray-300 p-2 shadow-sm focus:border-black focus:ring-black"
          /> */}
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700"
          >
            Course Description
          </label>
          <textarea
            id="description"
            value={state.description}
            onChange={(e) =>
              handleCourseDataChange("description", e.target.value)
            }
            placeholder="Enter course description"
            rows={4}
            className="mt-1 w-full rounded border-gray-300 p-2 shadow-sm focus:border-black focus:ring-black"
          />
        </div>

        <div>
          <label
            htmlFor="category"
            className="block text-sm font-medium text-gray-700"
          >
            Category
          </label>
          <select
            id="category"
            value={state.category}
            onChange={(e) => handleCourseDataChange("category", e.target.value)}
            className="mt-1 w-full rounded border-gray-300 p-2 shadow-sm focus:border-black focus:ring-black"
          >
            <option value="">Select a category</option>
            <option value="PROGRAMMING">Programming</option>
            <option value="DESIGN">Design</option>
            <option value="BUSINESS">Business</option>
            <option value="MARKETING">Marketing</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="level"
            className="block text-sm font-medium text-gray-700"
          >
            Level
          </label>
          <select
            id="level"
            value={state.level}
            onChange={(e) => handleCourseDataChange("level", e.target.value)}
            className="mt-1 w-full rounded border-gray-300 p-2 shadow-sm focus:border-black focus:ring-black"
          >
            <option value="">Select a level</option>
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="AVANCE">Avance</option>
          </select>
        </div>
        <TagInput
          onChange={(tags) => handleCourseDataChange("tags", tags)}
          initialTags={state.tags}
        />

        <div>
          <label
            htmlFor="coverImage"
            className="block text-sm font-medium text-gray-700"
          >
            Cover Image
          </label>
          <div className="mt-2 flex items-center space-x-4">
            {coverPreview && (
              <img
                src={coverPreview}
                alt="Cover"
                className="h-24 w-24 rounded object-cover"
              />
            )}
            <button
              type="button"
              onClick={() => document.getElementById("coverImageInput").click()}
              className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
            >
              Upload Image
            </button>
            <input
              id="coverImageInput"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
