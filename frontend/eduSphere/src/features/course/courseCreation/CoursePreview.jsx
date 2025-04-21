/* eslint-disable react/prop-types */
import { motion } from "framer-motion";
import { useState } from "react";
import {
  FiImage,
  FiClock,
  FiCheckCircle,
  FiPlay,
  FiHelpCircle,
  FiFileText,
  FiDollarSign,
} from "react-icons/fi";

export default function CoursePreview({ courseData }) {
  const [openSection, setOpenSection] = useState(null);

  // const totalHours = courseData.sections
  //   .reduce(
  //     (total, section) =>
  //       total +
  //       section.lectures.reduce((sectionTotal, content) => {
  //         if (content.type === "video" && content.duration) {
  //           const [minutes, seconds] = content.duration.split(":").map(Number);
  //           return sectionTotal + minutes + seconds / 60;
  //         }
  //         return sectionTotal;
  //       }, 0),
  //     0
  //   )
  //   .toFixed(1);

  const totalHours = courseData.sections.reduce((total, section) => {
    const sectionTotal = section.lectures.reduce((sum, content) => {
      return sum + Number(content.duration);
    }, 0);
    return total + sectionTotal;
  }, 0);

  // const totalHours = 50;
  const coverImage = courseData.isEdit
    ? courseData.coverImage
    : URL.createObjectURL(courseData.coverImage);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-8  w-full "
    >
      <h2 className="text-3xl font-bold text-gray-800 mb-8">Course Preview</h2>

      <div className="rounded-lg w-full border border-gray-200 bg-white shadow-lg">
        {/* Cover Image Section */}
        <div className="relative h-64 w-full overflow-hidden rounded-t-lg">
          {courseData.coverImage ? (
            <img
              src={coverImage}
              alt="Course cover"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-gray-100 flex items-center justify-center">
              <FiImage className="h-24 w-24 text-gray-400" />
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
            <h3 className="text-3xl font-bold text-white">
              {courseData.title || "Course Title"}
            </h3>
          </div>
        </div>

        {/* Course Details */}
        <div className="p-6 space-y-6">
          {/* Metadata */}
          <div className="flex flex-wrap gap-4 items-center">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              {courseData.category || "Category"}
            </span>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              {courseData.level || "Level"}
            </span>
            <div className="flex items-center text-gray-600">
              <FiClock className="mr-2" />
              <span className="text-sm">{totalHours} hours</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-600 leading-relaxed">
            {courseData.description || "Course description..."}
          </p>

          {/* Learning Objectives */}
          <div>
            <h4 className="text-xl font-semibold mb-4 text-gray-800">
              What you&apos;ll learn
            </h4>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {courseData.sections.slice(0, 4).map((section, index) => (
                <li key={index} className="flex items-start text-gray-700">
                  <FiCheckCircle className="mt-1 mr-2 text-green-600" />
                  <span>{section.title || `Section ${index + 1}`}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Curriculum Accordion */}
          <div className="space-y-2">
            {courseData.sections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="border rounded-lg">
                <button
                  onClick={() =>
                    setOpenSection(
                      openSection === sectionIndex ? null : sectionIndex
                    )
                  }
                  className="w-full px-4 py-3 flex justify-between items-center hover:bg-gray-50"
                >
                  <span className="font-medium">
                    {section.title || `Section ${sectionIndex + 1}`}
                  </span>
                  <span
                    className={`transform transition-transform ${
                      openSection === sectionIndex ? "rotate-180" : ""
                    }`}
                  >
                    ▼
                  </span>
                </button>

                {openSection === sectionIndex && (
                  <div className="p-4 border-t">
                    <ul className="space-y-3">
                      {section.lectures.map((content, contentIndex) => (
                        <li
                          key={contentIndex}
                          className="flex items-center text-gray-600"
                        >
                          {content.type === "video" && (
                            <FiPlay className="mr-2" />
                          )}
                          {content.type === "quiz" && (
                            <FiHelpCircle className="mr-2" />
                          )}
                          {content.type === "text" && (
                            <FiFileText className="mr-2" />
                          )}
                          <span>
                            {content.title || `${content.type} content`}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Footer */}
        <div className="border-t px-6 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <FiDollarSign className="h-6 w-6 text-gray-700 mr-2" />
            <span className="text-2xl font-bold text-gray-900">
              {courseData.price > 0 ? `${courseData.price}` : "gratuit"}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
