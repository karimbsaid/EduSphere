import { Outlet, useParams } from "react-router-dom";
import SideBar from "./SideBar";
import { useEffect, useState } from "react";
import { getCourseDetail } from "../services/apiCourse";

export default function AppLayout() {
  const { courseId, sectionId, lectureId } = useParams(); // Récupérer les paramètres de l'URL
  const [course, setCourse] = useState({
    title: "",
    sections: [],
    id: "",
  });
  useEffect(() => {
    const fetchCoursDetail = async () => {
      const { data } = await getCourseDetail(courseId);
      setCourse({
        title: data.title,
        sections: data.sections,
        id: data._id,
      });
    };
    if (courseId) {
      fetchCoursDetail();
    }
    console.log(courseId);
  }, [courseId]);

  return (
    <div className="flex relative min-h-screen bg-gray-100 dark:bg-gray-900">
      <SideBar course={course} sectionId={sectionId} />
      <main className="flex-1 overflow-auto w-full">
        <Outlet />
      </main>
    </div>
  );
}
