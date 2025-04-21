/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";

import { useAuth } from "../context/authContext";
import { getCourseDetail, getResources } from "../services/apiCourse";
import CourseTabs from "./CourseTabs";
import MainNavigation from "./MainNavigation";
import { getProgress } from "../services/apiEnrollment";
import { getMyprofile } from "../services/apiProfile";
import UserPanel from "./UserPanel";
import { HiX } from "react-icons/hi";
import { useNavigate } from "react-router-dom";

export default function SideBar({ courseId, sectionId, onClose }) {
  const { user } = useAuth();
  const token = user?.token;
  const [course, setCourse] = useState({
    courseDetail: {},
    progress: {},
    resources: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [userDetails, setUserDetails] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (token) {
        setIsLoading(true);
        // Vérifier courseId ici
        try {
          const { user } = await getMyprofile(token);
          if (courseId && sectionId) {
            const [courseData, resourcesData, progressData] = await Promise.all(
              [
                getCourseDetail(courseId),
                getResources(courseId),
                getProgress(courseId, token),
              ]
            );
            setCourse({
              courseDetail: courseData.course,
              resources: resourcesData.resources,
              progress: progressData.progress,
            });
          }

          setUserDetails(user);
        } catch (error) {
          console.error("Erreur de chargement:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchData();
  }, [courseId, sectionId, token]);

  return (
    <aside
      className={`bg-gray-800 text-white transition-all duration-300 flex flex-col max-w-64 h-screen `}
    >
      <div className="p-4 flex items-center justify-between ">
        <h1
          className="text-lg font-bold cursor-pointer"
          onClick={() => navigate("/accueil")}
        >
          EduSphere
        </h1>
        <button
          onClick={onClose}
          className="md:hidden p-2 hover:bg-gray-700 rounded-lg"
        >
          <HiX className="w-5 h-5" />
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto space-y-1">
        {isLoading && <span>loading...</span>}
        {courseId ? <CourseTabs data={course} /> : <MainNavigation />}
      </nav>
      <UserPanel userDetail={userDetails} />
    </aside>
  );
}
