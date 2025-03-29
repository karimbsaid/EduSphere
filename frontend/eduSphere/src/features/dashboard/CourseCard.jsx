/* eslint-disable react/prop-types */
import { motion } from "motion/react";
import {
  HiChartBar,
  HiOutlineClock,
  HiOutlineEye,
  HiOutlinePencilSquare,
  HiOutlineStar,
  HiOutlineTrash,
  HiOutlineUsers,
} from "react-icons/hi2";
import Button from "../../ui/Button";
import Badge from "../../ui/Badge";
import { Navigate, useNavigate } from "react-router-dom";
import { convertSecondToTime } from "../../utils/convertSecondToTime";

function CourseCard({ course }) {
  const navigate = useNavigate();
  const { hours, minutes, seconds } = convertSecondToTime(course.totalDuration);
  const formattedDuration = hours
    ? `${hours} hours`
    : minutes
    ? `${minutes} minutes`
    : `${seconds} seconds`;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-lg border bg-card shadow-sm my-4 mx-1"
    >
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6">
        <div className="relative h-48 md:h-full md:col-span-1 ">
          <img
            src={course.imageUrl || "/placeholder.svg"}
            alt={course.title}
            className="absolute inset-0 h-full w-full  rounded-t-lg md:rounded-l-lg md:rounded-tr-none"
          />
        </div>
        <div className="p-6 md:col-span-2 lg:col-span-3">
          <div className="flex items-center justify-between mb-2">
            <Badge
              style={
                course.status === "published"
                  ? "bg-black text-white"
                  : "bg-gray-100 text-black"
              }
              text={course.status}
            />
            <span className="text-xs text-muted-foreground">
              Mis à jour le {new Date(course.createdAt).toLocaleDateString()}
            </span>
          </div>
          <h3 className="text-xl font-bold mb-2">{course.title}</h3>
          <div className="flex items-center space-x-4 mb-4">
            <Badge style="bg-gray-100 text-black" text={course.category} />
            <Badge style="bg-gray-100 text-black" text={course.level} />
            <div className="flex items-center">
              <HiOutlineStar className="h-4 w-4 text-yellow-500 mr-1" />
              <span>4.5</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center">
              <HiOutlineUsers className="h-4 w-4 text-primary mr-2" />
              <span>{course.totalStudent} étudiants</span>
            </div>
            <div className="flex items-center">
              <HiOutlineClock className="h-4 w-4 text-primary mr-2" />
              <span>{formattedDuration}</span>
            </div>
            <div className="flex items-center">
              <HiChartBar className="h-4 w-4 text-primary mr-2" />
              <span>
                {course.totalStudents > 0
                  ? (course.totalStudentComplete / course.totalStudents) * 100
                  : 0}
                % de complétion
              </span>
            </div>
            <div className="flex items-center">
              {/* <DollarSign className="h-4 w-4 text-primary mr-2" /> */}
              <span>{course.price} €</span>
            </div>
          </div>
        </div>
        <div className="p-6 bg-muted/30 md:col-span-1 lg:col-span-2 rounded-b-lg md:rounded-r-lg md:rounded-bl-none">
          <h4 className="font-semibold mb-2">Statistiques</h4>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm">Revenu</span>
                <span className="text-sm font-medium">{course.revenue}€</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-between sm:mt-4 md:my-2">
              <Button
                label="Voir"
                onClick={() =>
                  navigate(
                    `/course/${course._id}/chapter/${course.firstSectionId}/lecture/${course.firstLectureId}`
                  )
                }
                icon={HiOutlineEye}
                className="bg-white text-black w-auto hover:bg-gray-200"
              />
              <Button
                label="Modifier"
                icon={HiOutlinePencilSquare}
                onClick={() => navigate(`/my-courses/${course._id}`)}
                className="bg-white text-black hover:bg-gray-200"
              />
              <Button
                label="Supprimer"
                icon={HiOutlineTrash}
                className="bg-red-500 text-white hover:bg-red-600"
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
export default CourseCard;
