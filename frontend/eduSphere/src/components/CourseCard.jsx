/* eslint-disable react/prop-types */
import { HiMiniUsers, HiMiniStar } from "react-icons/hi2";
import { useNavigate } from "react-router-dom";
import Badge from "../ui/Badge";

const CourseCard = ({ course }) => {
  const levelStyles = {
    BEGINNER: "success",
    INTERMEDIATE: "warning",
    ADVANCED: "secondary",
  };

  const {
    title,
    imageUrl,
    level,
    instructor,
    averageRating = 0,
    totalStudent = 0,
    price,
    _id,
  } = course;
  const { name: teacherName } = instructor;
  const { photo: teacherImg } = instructor.additionalDetails;

  const navigate = useNavigate();
  const handleNavigate = () => {
    navigate(`/course/${_id}`);
  };

  return (
    <div
      onClick={handleNavigate}
      className="max-w-xs bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300 cursor-pointer flex flex-col"
    >
      {/* Image avec hauteur fixe */}
      <div className="relative h-56">
        <img
          src={imageUrl}
          className="w-full h-full object-cover rounded-t-lg"
          alt={title}
        />
        <Badge
          text={level}
          style="absolute top-3 left-3 rounded-md px-2 py-1 text-sm font-semibold uppercase"
          variant={levelStyles[level]}
        />
      </div>

      {/* Contenu de la carte */}
      <div className="p-4 flex flex-col flex-1">
        {/* Métriques (étudiants et note) */}
        <div className="flex justify-end gap-3 mb-2">
          <div className="flex items-center text-gray-500">
            <HiMiniUsers className="mr-1 text-sm" />
            <span className="text-xs">{totalStudent}</span>
          </div>
          <div className="flex items-center text-gray-500">
            <HiMiniStar className="mr-1 text-sm text-yellow-500" />
            <span className="text-xs">{averageRating}</span>
          </div>
        </div>

        {/* Titre du cours */}
        <h3 className="text-l font-bold text-gray-800 mb-2 lowercase flex-1">
          {title}
        </h3>

        {/* Footer (instructeur et prix) avec hauteur fixe */}
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <img
              src={teacherImg}
              className="w-12 h-12 rounded-full object-cover mr-2"
              alt={teacherName}
            />
            <span className="text-l text-purple-600 font-medium truncate">
              {teacherName}
            </span>
          </div>
          <span className="text-base text-gray-700 font-medium">
            {price > 0 ? `${price} TND` : "gratuit"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
