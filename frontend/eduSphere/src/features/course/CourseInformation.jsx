import { HiChatBubbleLeftRight } from "react-icons/hi2";
export default function CourseInformation({ course }) {
  const {
    title,
    description,
    instructor,
    level,
    review = 20,
    vote = 4.5,
    nStudent = 20,
  } = course;
  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm text-gray-600">
          ⭐ {vote} based on {review} reviews
        </span>
        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
          {level}
        </span>
      </div>

      <h1 className="text-2xl font-bold text-gray-800 mb-4">{title}</h1>

      <p className="text-gray-600 mb-6">{description}</p>

      <div className="flex flex-wrap gap-4 items-center text-sm text-gray-500 mb-6">
        <span className="font-semibold">{instructor?.name}</span>
        <span>•</span>
        <span>{nStudent}+ students bought this course</span>
        <span>•</span>
        <span>98% students recommend this course</span>
      </div>
    </div>
  );
}
