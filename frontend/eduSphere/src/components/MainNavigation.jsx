import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  HiHome,
  HiBookOpen,
  HiChevronDown,
  HiChevronRight,
  HiChartPie,
} from "react-icons/hi";
import { HiMiniAcademicCap } from "react-icons/hi2";
import { useAuth } from "../context/authContext";

export default function MainNavigation() {
  const { user, loading } = useAuth();
  // console.log(user);
  const location = useLocation(); // Utilisé pour vérifier l'URL actuelle
  const [openSubMenus, setOpenSubMenus] = useState({});

  const toggleSubMenu = (path) => {
    setOpenSubMenus((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  };

  // Map navigation items to required permissions
  const navItems = [
    { icon: HiHome, label: "Accueil", path: "/", permission: null },
    {
      icon: HiChartPie,
      label: "Dashboard",
      path: "/dashboard", // Remplacer #tableaudebord par une vraie route
      permission: "view_analytics",
      subItems: [
        {
          label: "Utilisateurs",
          path: "/dashboard/users",
          permission: "manage_users",
        },
        {
          label: "Cours",
          path: "/dashboard/courses",
          permission: "manage_courses",
        },
        {
          label: "Tableau de bord",
          path: "/dashboard",
          permission: "view_analytics",
        },
        {
          label: "Paiements",
          path: "/dashboard/payments",
          permission: "manage_payments",
        },
        // {
        //   label: "Mes Cours",
        //   path: "/dashboard/mycourses",
        //   permission: "manage_courses",
        // },
        // {
        //   label: "Mes étudiants",
        //   path: "/my-courses/my-students",
        //   permission: "view_students",
        // },
      ],
    },
    {
      icon: HiMiniAcademicCap,
      label: "Mes cours inscrits",
      path: "/my-enrolled-courses",
      permission: null,
    },
    {
      icon: HiBookOpen,
      label: "Courses",
      path: "/courses",
      permission: "view_courses",
    },
  ];

  // Check if user has a specific permission
  const hasPermission = (permission) => {
    if (!permission) return true;
    return (
      user?.role?.permissions?.some(
        (perm) => perm.feature.name === permission && perm.authorized
      ) || false
    );
  };

  // Filter navItems based on permissions
  const filteredNavItems = navItems
    .map((item) => {
      if (item.subItems) {
        const filteredSubItems = item.subItems.filter((subItem) =>
          hasPermission(subItem.permission)
        );
        if (filteredSubItems.length > 0 || hasPermission(item.permission)) {
          return { ...item, subItems: filteredSubItems };
        }
        return null;
      }
      return hasPermission(item.permission) ? item : null;
    })
    .filter((item) => item !== null);

  // Vérifie si un sous-menu est actif pour mettre en évidence le menu parent
  const isSubMenuActive = (subItems) => {
    return subItems.some((subItem) => location.pathname === subItem.path);
  };

  const renderSubItems = (subItems, parentPath) => (
    <div className="pl-6 space-y-1">
      {subItems.map((subItem) => (
        <NavLink
          key={subItem.path}
          to={subItem.path}
          end
          className={({ isActive }) =>
            `block px-4 py-2 text-sm rounded-md hover:bg-teal-600 transition-colors ${
              isActive ? "bg-teal-600 font-medium" : "text-gray-200"
            }`
          }
        >
          {subItem.label}
        </NavLink>
      ))}
    </div>
  );

  if (loading) {
    return <div className="p-4 text-gray-200">Chargement...</div>;
  }

  return (
    <div className="space-y-1">
      {filteredNavItems.map(({ icon: Icon, label, path, subItems }) => {
        if (subItems) {
          const isParentActive =
            location.pathname === path || isSubMenuActive(subItems);
          return (
            <div key={path}>
              <button
                onClick={() => toggleSubMenu(path)}
                className={`flex items-center w-full px-4 py-3 rounded-md hover:bg-teal-600 transition-colors ${
                  isParentActive ? "bg-teal-600" : "text-gray-200"
                }`}
              >
                <Icon className="flex-shrink-0 w-5 h-5" />
                <span className="ml-3 flex-1 text-left">{label}</span>
                {openSubMenus[path] ? (
                  <HiChevronDown className="ml-2 w-4 h-4" />
                ) : (
                  <HiChevronRight className="ml-2 w-4 h-4" />
                )}
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
              `flex items-center px-4 py-3 rounded-md hover:bg-teal-600 transition-colors ${
                isActive ? "bg-teal-600" : "text-gray-200"
              }`
            }
          >
            <Icon className="flex-shrink-0 w-5 h-5" />
            <span className="ml-3">{label}</span>
          </NavLink>
        );
      })}
    </div>
  );
}
