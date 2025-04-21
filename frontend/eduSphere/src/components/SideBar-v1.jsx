// /* eslint-disable react/prop-types */
// import { useEffect, useState } from "react";
// import {
//   HiHome,
//   HiBookOpen,
//   HiChevronDown,
//   HiChevronRight,
//   HiChartPie,
// } from "react-icons/hi";
// import {
//   HiMiniAcademicCap,
//   HiMiniBookOpen,
//   HiArrowLeftOnRectangle,
// } from "react-icons/hi2";
// import { NavLink, useNavigate } from "react-router-dom";
// import { useAuth } from "../context/authContext";

// export default function SideBar({ course, sectionId, className, userDetail }) {
//   const [isCollapsed, setIsCollapsed] = useState(false);
//   const [openSections, setOpenSections] = useState({}); // Gérer les sections ouvertes
//   const { logout } = useAuth();
//   const isCourseEmpty =
//     !course.title && !course.id && course.sections.length === 0;
//   const navigate = useNavigate();

//   const handleLogout = () => {
//     logout();
//     console.log("deconnexion..");
//   };
//   const toggleSection = (sectionId) => {
//     setOpenSections((prev) => ({
//       ...prev,
//       [sectionId]: !prev[sectionId], // Inverser l'état de la section
//     }));
//   };

//   const navItems = [
//     { icon: HiHome, label: "Home", path: "/" },
//     {
//       icon: HiChartPie,
//       label: "Dashboard",
//       path: "#",
//       subItems: [
//         { label: "Utilisateur", path: "/dashboard/users" },
//         { label: "Cours", path: "/dashboard/cours" },
//         { label: "tableau de bord", path: "/dashbaord" },
//       ],
//     },
//     {
//       icon: HiMiniAcademicCap,
//       label: "My Enrolled Courses",
//       path: "/my-enrolled-courses",
//     },
//     { icon: HiBookOpen, label: "Resources", path: "/resources" },
//   ];

//   return (
//     <aside
//       className={` bg-gray-800 text-white transition-all duration-300 flex flex-col max-w-64 ${className}`}
//     >
//       <div className="p-4 flex items-center justify-between">
//         {!isCollapsed && <h1 className="text-l font-bold">EduSphere</h1>}
//         <button
//           onClick={() => setIsCollapsed(!isCollapsed)}
//           className="p-2 rounded-lg hover:bg-gray-700"
//         >
//           {isCollapsed ? "→" : "←"}
//         </button>
//       </div>

//       <nav className="flex-1 overflow-y-auto">
//         {isCourseEmpty &&
//           navItems.map(({ icon: Icon, label, path }) => (
//             <NavLink
//               key={path}
//               to={path}
//               className={({ isActive }) =>
//                 `flex items-center px-4 py-3 hover:bg-gray-700 ${
//                   isActive && "bg-gray-700"
//                 }`
//               }
//             >
//               <Icon />
//               {!isCollapsed && <span className="ml-3 text-sm">{label}</span>}
//             </NavLink>
//           ))}
//         {course && (
//           <div className="p-4 text-white text-center font-bold text-lg uppercase">
//             {course.title}
//           </div>
//         )}
//         {/* Sections et lectures dynamiques */}
//         {course?.sections?.map((section) => (
//           <div key={section._id}>
//             <button
//               className="flex items-center px-4 py-3 w-full text-left hover:bg-gray-700"
//               onClick={() => toggleSection(section._id)}
//             >
//               {openSections[section._id] ? (
//                 <HiChevronDown />
//               ) : (
//                 <HiChevronRight />
//               )}
//               {!isCollapsed && <span className="ml-3">{section.title}</span>}
//             </button>
//             {openSections[section._id] && (
//               <div className="pl-6">
//                 {section.lectures.map((lecture, index) => (
//                   <NavLink
//                     key={index}
//                     to={`/course/${course.id}/chapter/${section._id}/lecture/${lecture._id}`}
//                     className="block px-4 py-2 text-sm hover:bg-gray-700"
//                   >
//                     {lecture.title}
//                   </NavLink>
//                 ))}
//               </div>
//             )}
//           </div>
//         ))}
//       </nav>

//       {!isCollapsed && userDetail.name && (
//         <div className="sticky bottom-0 bg-gray-800 p-4 border-t border-gray-700 flex justify-between items-center">
//           <div
//             className="flex items-center"
//             onClick={() => navigate("/my-profile")}
//           >
//             <img
//               src={userDetail.additionalDetails?.photo}
//               alt="User Avatar"
//               className="w-10 h-10 rounded-full"
//             />
//             <span className="ml-3">{userDetail.name}</span>
//           </div>

//           <button
//             onClick={handleLogout}
//             className="p-2 rounded-lg hover:bg-red-600 transition"
//           >
//             <HiArrowLeftOnRectangle className="w-6 h-6 text-red-400" />
//           </button>
//         </div>
//       )}
//     </aside>
//   );
// }

/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import {
  HiHome,
  HiBookOpen,
  HiChevronDown,
  HiChevronRight,
  HiChartPie,
} from "react-icons/hi";
import {
  HiMiniAcademicCap,
  HiMiniBookOpen,
  HiArrowLeftOnRectangle,
} from "react-icons/hi2";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";

export default function SideBar({
  course = {},
  sectionId,
  className,
  userDetail,
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openSections, setOpenSections] = useState({});
  const [openSubMenus, setOpenSubMenus] = useState({});

  const { logout } = useAuth();
  const isCourseEmpty =
    !course.title && !course.id && !(course.sections?.length > 0);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    console.log("deconnexion..");
  };

  const toggleSection = (sectionId) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const isSectionCompleted = (sectionId) => {
    return course.progress?.completedSections.includes(sectionId);
  };
  const isLectureCompleted = (lectureId) => {
    return course.progress?.completedLectures.includes(lectureId);
  };
  const toggleSubMenu = (path) => {
    setOpenSubMenus((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  };

  const navItems = [
    { icon: HiHome, label: "Accueil", path: "/accueil" },
    {
      icon: HiChartPie,
      label: "Dashboard",
      path: "#dashboard",
      subItems: [
        { label: "Utilisateurs", path: "/dashboard/users" },
        { label: "Cours", path: "/dashboard/courses" },
        { label: "Statistiques", path: "/dashboard/stats" },
      ],
    },
    {
      icon: HiMiniAcademicCap,
      label: "Mes cours inscrits",
      path: "/my-enrolled-courses",
    },
    { icon: HiBookOpen, label: "Ressources", path: "/resources" },
  ];

  const renderSubItems = (subItems, parentPath) => (
    <div className="pl-6 space-y-1">
      {subItems.map((subItem) => (
        <NavLink
          key={subItem.path}
          to={subItem.path}
          className={({ isActive }) =>
            `block px-4 py-2 text-sm rounded-md hover:bg-gray-700 transition-colors ${
              isActive ? "bg-gray-700 font-medium" : ""
            }`
          }
        >
          {!isCollapsed && subItem.label}
        </NavLink>
      ))}
    </div>
  );

  return (
    <aside
      className={`bg-gray-800 text-white transition-all duration-300 flex flex-col max-w-64 ${className}`}
    >
      <div className="p-4 flex items-center justify-between">
        {!isCollapsed && <h1 className="text-lg font-bold">EduSphere</h1>}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-gray-700"
        >
          {isCollapsed ? "→" : "←"}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto space-y-1">
        {isCourseEmpty &&
          navItems.map(({ icon: Icon, label, path, subItems }) => {
            if (subItems) {
              return (
                <div key={path}>
                  <button
                    onClick={() => toggleSubMenu(path)}
                    className={`flex items-center w-full px-4 py-3 hover:bg-gray-700 rounded-md transition-colors ${
                      openSubMenus[path] ? "bg-gray-700" : ""
                    }`}
                  >
                    <Icon className="flex-shrink-0" />
                    {!isCollapsed && (
                      <>
                        <span className="ml-3 flex-1 text-left">{label}</span>
                        {openSubMenus[path] ? (
                          <HiChevronDown className="ml-2" />
                        ) : (
                          <HiChevronRight className="ml-2" />
                        )}
                      </>
                    )}
                  </button>
                  {!isCollapsed &&
                    openSubMenus[path] &&
                    renderSubItems(subItems, path)}
                </div>
              );
            }

            return (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 hover:bg-gray-700 rounded-md transition-colors ${
                    isActive ? "bg-gray-700" : ""
                  }`
                }
              >
                <Icon className="flex-shrink-0" />
                {!isCollapsed && <span className="ml-3">{label}</span>}
              </NavLink>
            );
          })}

        {course && (
          <div className="p-4 text-white text-center font-bold text-lg uppercase">
            {!isCollapsed && course.title}
          </div>
        )}

        {course?.sections?.map((section) => {
          const sectionCompleted = isSectionCompleted(section._id);

          return (
            <div key={section._id}>
              <button
                className="flex items-center w-full px-4 py-3 hover:bg-gray-700 rounded-md"
                onClick={() => toggleSection(section._id)}
              >
                {openSections[section._id] ? (
                  <HiChevronDown />
                ) : (
                  <HiChevronRight />
                )}
                {!isCollapsed && <span className="ml-3">{section.title}</span>}
              </button>
              {!isCollapsed && openSections[section._id] && (
                <div className="pl-6 space-y-1">
                  {section.lectures.map((lecture) => {
                    const lectureCompleted = isLectureCompleted(lecture._id);
                    return (
                      <NavLink
                        key={lecture._id}
                        to={`/course/${course.id}/chapter/${section._id}/lecture/${lecture._id}`}
                        className={`block px-4 py-2 text-sm rounded-md hover:bg-gray-700 transition-colors ${
                          lectureCompleted || sectionCompleted
                            ? "bg-green-500"
                            : ""
                        }`}
                      >
                        {lecture.title}
                      </NavLink>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {!isCollapsed && userDetail.name && (
        <div className="sticky bottom-0 bg-gray-800 p-4 border-t border-gray-700 flex justify-between items-center">
          <div
            className="flex items-center cursor-pointer hover:bg-gray-700 rounded-lg p-2"
            onClick={() => navigate("/my-profile")}
          >
            <img
              src={userDetail.additionalDetails?.photo}
              alt="User Avatar"
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="ml-3">
              <p className="text-sm font-medium">{userDetail.name}</p>
              <p className="text-xs text-gray-400">{userDetail.role}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="p-2 rounded-lg hover:bg-red-600 transition"
          >
            <HiArrowLeftOnRectangle className="w-6 h-6 text-red-400" />
          </button>
        </div>
      )}
    </aside>
  );
}
