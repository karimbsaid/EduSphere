/* eslint-disable react/prop-types */
"use client";

import { FaStar, FaCheckCircle } from "react-icons/fa";
import Card from "../../../ui/Card";

const ReviewCard = ({ review }) => {
  const { student, rating, comment } = review;
  return (
    <Card className="p-4 shadow-md border rounded-lg max-w-md">
      <div className="flex items-center gap-3">
        <img
          src={student.additionalDetails.photo}
          alt={student.name}
          className="w-12 h-12 rounded-full object-cover"
        />
        <div>
          <div className="flex items-center gap-1">
            <h3 className="font-semibold text-lg">{student.name}</h3>
          </div>
        </div>
      </div>

      {/* Étoiles */}
      <div className="flex gap-1 text-yellow-500">
        {[...Array(rating)].map((_, i) => (
          <FaStar key={i} />
        ))}
      </div>

      {/* Commentaire */}
      <p className="text-gray-700">{comment}</p>
    </Card>
  );
};

export default ReviewCard;
