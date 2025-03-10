/* eslint-disable react/prop-types */
import { HiMiniUsers, HiMiniStar } from "react-icons/hi2";
import { useNavigate } from "react-router-dom";

const CourseCard = ({ course }) => {
  const levelStyles = {
    Beginner: "bg-green-100 text-green-700",
    intermediate: "bg-orange-200 text-orange-700",
    advanced: "bg-red-500 text-red-700",
  };
  const {
    title,
    coverImage,
    level,
    instructor,
    vote = 0,
    studentN = 0,
    slug,
  } = course;
  const { name: teacherName } = instructor;
  const { photo: teacherImg } = instructor.additionalDetails;
  const navigate = useNavigate();
  const handleNavigate = () => {
    navigate(`/course/${slug}`);
  };

  return (
    <div
      onClick={handleNavigate}
      className="max-w-xs bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
    >
      <div className="p-6">
        <img
          src={coverImage.url}
          className="mr-5 rounded-xl w-full h-auto  object-cover"
          alt={title}
        />
        <div className="flex justify-between my-2">
          <span
            className={`rounded-xl px-2 py-1 font-semibold ${levelStyles[level]}`}
          >
            {level}
          </span>
          <div className="flex">
            <div className="flex items-center text-gray-500 mr-2 ">
              <HiMiniUsers className="mr-1" />
              <span className="text-sm font-normal">{studentN}</span>
            </div>

            <div className="flex items-center text-gray-500 ">
              <HiMiniStar className="mr-1 text-yellow-500" />
              <span className="text-sm font-light">{vote}</span>
            </div>
          </div>
        </div>
        <span className="font-bold text-gray-600 ">{title}</span>

        <div className="flex items-center justify-between">
          <div className="flex items-center mt-2 ">
            <img
              src={teacherImg}
              className="mr-5 rounded-lg w-9 h-9 object-cover"
              alt="http://127.0.0.1:8080/images/student.jpg"
            />
            <span className="text-purple-600 font-medium">{teacherName}</span>
          </div>
          <span>25 $</span>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
