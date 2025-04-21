import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  HiHome,
  HiBookOpen,
  HiChevronDown,
  HiChevronRight,
  HiChartPie,
} from "react-icons/hi";
import { HiMiniAcademicCap } from "react-icons/hi2";
export default function MainNavigation() {
  const [openSubMenus, setOpenSubMenus] = useState({});

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
        { label: "Paiments", path: "/dashboard/payments" },
      ],
    },
    {
      icon: HiMiniAcademicCap,
      label: "Mes cours inscrits",
      path: "/my-enrolled-courses",
    },

    { icon: HiBookOpen, label: "Courses", path: "/courses" },
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
          {subItem.label}
        </NavLink>
      ))}
    </div>
  );
  return (
    <div>
      {navItems.map(({ icon: Icon, label, path, subItems }) => {
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

                <>
                  <span className="ml-3 flex-1 text-left">{label}</span>
                  {openSubMenus[path] ? (
                    <HiChevronDown className="ml-2" />
                  ) : (
                    <HiChevronRight className="ml-2" />
                  )}
                </>
              </button>
              {openSubMenus[path] && renderSubItems(subItems, path)}
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
            <span className="ml-3">{label}</span>
          </NavLink>
        );
      })}
    </div>
  );
}
