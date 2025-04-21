/* eslint-disable react/prop-types */
import React from "react";
import Card from "../ui/Card";
import { Link } from "react-router-dom";
import { LuFile, LuFileText } from "react-icons/lu";

export default function CourseResource({ resources = [] }) {
  console.log("resources", resources);
  const handleLinkClick = (url) => {
    window.open(url, "_blank"); // Ouvre le lien dans un nouvel onglet
  };
  return (
    <Card>
      <ul className="space-y-2">
        {resources.map((resource, index) => (
          <li key={index}>
            <button
              onClick={() => handleLinkClick(resource.resourceUrl)} // Utilisation du onClick
              className="flex items-center gap-2 text-sm hover:underline"
            >
              <LuFile className="h-4 w-4" />
              {resource.title}
            </button>
          </li>
        ))}
      </ul>
    </Card>
  );
}
