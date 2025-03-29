/* eslint-disable react/prop-types */
import { FaStar, FaThumbsUp, FaFlag, FaUser } from "react-icons/fa";
import { Button } from "./Button"; // À remplacer par votre implémentation

export default function CourseReviewItem({ review }) {
  const { student, rating, comment, createdAt } = review;

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-4">
        <div className="h-10 w-10 rounded-full border overflow-hidden">
          {student.additionalDetails.photo ? (
            <img
              src={student.additionalDetails.photo}
              alt={student.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-muted flex items-center justify-center">
              <FaUser className="h-5 w-5 text-muted-foreground" />
            </div>
          )}
        </div>

        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">{student.name}</div>
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <span>{createdAt}</span>
              </div>
            </div>

            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <FaStar
                  key={star}
                  className={`h-4 w-4 ${
                    star <= rating
                      ? "text-yellow-400 fill-current"
                      : "text-muted-foreground fill-muted"
                  }`}
                />
              ))}
            </div>
          </div>

          {review.title && <h4 className="font-medium mt-2">{review.title}</h4>}

          <p className="text-sm leading-relaxed mt-2">{review.content}</p>
        </div>
      </div>
    </div>
  );
}
