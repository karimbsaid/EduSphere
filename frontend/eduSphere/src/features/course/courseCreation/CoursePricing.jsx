/* eslint-disable react/prop-types */
import { motion } from "framer-motion";
import { FiDollarSign } from "react-icons/fi";

export default function CoursePricing({ courseData, handleCourseDataChange }) {
  console.log(courseData.price);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-6 bg-white rounded-lg shadow-sm border"
    >
      <h2 className="mb-6 text-2xl font-bold text-gray-800 flex items-center gap-2">
        <FiDollarSign className="text-indigo-600" />
        Course Pricing
      </h2>

      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <label
            htmlFor="price"
            className="text-sm font-medium text-gray-700 flex items-center gap-1"
          >
            Price in USD
          </label>

          <div className="relative">
            <FiDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              id="price"
              type="number"
              value={courseData.price || ""}
              onChange={(e) => handleCourseDataChange("price", e.target.value)}
              placeholder="0.00"
              className={`w-full pl-8 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                courseData.price < 0 ? "border-red-500" : ""
              }`}
              min="0"
              step="0.01"
            />
          </div>
        </div>

        {/* Ajoutez d'autres éléments de tarification ici */}
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            <span className="font-semibold">Note :</span> Un prix de 0 $ rendra
            le cours gratuit
          </p>
        </div>
      </div>
    </motion.div>
  );
}
