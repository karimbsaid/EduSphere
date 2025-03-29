import { Outlet, useParams } from "react-router-dom";
import SideBar from "./SideBar";
import { useEffect, useState } from "react";
import { getCourseDetail } from "../services/apiCourse";
import { HiMenu, HiX } from "react-icons/hi";
import { getMyprofile } from "../services/apiProfile";
import { useAuth } from "../context/authContext";

export default function AppLayout() {
  const { courseId, sectionId, lectureId } = useParams(); // Récupérer les paramètres de l'URL
  const [course, setCourse] = useState({
    title: "",
    sections: [],
    id: "",
  });
  const [userDetails, setUserDetails] = useState({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useAuth();
  const token = user?.token;

  useEffect(() => {
    const fetchUserDetail = async () => {
      const userData = await getMyprofile(token);
      setUserDetails(userData.user);
    };

    const fetchCoursDetail = async () => {
      const { course } = await getCourseDetail(courseId);
      setCourse({
        title: course.title,
        sections: course.sections,
        id: course._id,
      });
    };
    if (token) {
      fetchUserDetail();
    }

    if (courseId && sectionId) {
      fetchCoursDetail();
    }
  }, [courseId, sectionId, token]);

  return (
    <div className="flex  min-h-screen bg-gray-100 dark:bg-gray-900">
      <SideBar
        course={course}
        userDetail={userDetails}
        sectionId={sectionId}
        className={`fixed md:relative  transform transition-transform duration-300 ease-in-out z-50 h-screen ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      />

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <main className="flex-1 overflow-auto w-full">
        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="md:hidden fixed top-4 left-4 p-2 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 z-50 transition-colors"
          >
            <HiMenu className="w-6 h-6 text-gray-800 dark:text-gray-200" />
          </button>
        )}
        {isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden fixed top-4 right-4 p-2 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 z-50 transition-colors"
          >
            <HiX className="w-6 h-6 text-gray-800 dark:text-gray-200" />
          </button>
        )}

        <Outlet />
      </main>
    </div>
  );
}
