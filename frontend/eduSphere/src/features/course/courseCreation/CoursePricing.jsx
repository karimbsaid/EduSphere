/* eslint-disable react/prop-types */
import { motion } from "framer-motion";
import { useContext } from "react";
import { FiDollarSign } from "react-icons/fi";
import { CourseContext } from "../../../context/courseContext";
import { useParams } from "react-router-dom";

export default function CoursePricing() {
  const { state, dispatch } = useContext(CourseContext);
  const { courseId } = useParams();
  const handleCourseDataChange = (field, value) => {
    dispatch({ type: "SET_FIELD", field, value, courseId });
  };
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-6 bg-white rounded-lg shadow-sm border"
    >
      <h2 className="mb-6 text-2xl font-bold text-gray-800 flex items-center gap-2">
        Course Pricing
      </h2>

      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <label
            htmlFor="price"
            className="text-sm font-medium text-gray-700 flex items-center gap-1"
          >
            prix en TND
          </label>

          <div className="relative">
            <input
              id="price"
              type="number"
              value={state.price}
              onChange={(e) => handleCourseDataChange("price", e.target.value)}
              placeholder="0.00"
              className={`w-full pl-8 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                state.price < 0 ? "border-red-500" : ""
              }`}
              min="0"
              step="0.01"
            />
          </div>
        </div>

        {/* Ajoutez d'autres éléments de tarification ici */}
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            <span className="font-semibold">Note :</span> Un prix de 0 TND
            rendra le cours gratuit
          </p>
        </div>
      </div>
    </motion.div>
  );
}
