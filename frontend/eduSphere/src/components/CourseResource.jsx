/* eslint-disable react/prop-types */
import React from "react";
import Card from "../ui/Card";
import { Link } from "react-router-dom";
import { LuFile, LuFileText } from "react-icons/lu";
import { HiChevronRight, HiDocument } from "react-icons/hi2";

export default function CourseResource({ resources = [] }) {
  // console.log("resources", resources);
  const handleLinkClick = (url) => {
    window.open(url, "_blank"); // Ouvre le lien dans un nouvel onglet
  };
  return (
    <div className="space-y-3">
      {resources?.map((resource) => (
        <div
          onClick={() => handleLinkClick(resource.resourceUrl)} // Utilisation du onClick
          key={resource._id}
          className="flex items-center gap-3 p-3 rounded-xl bg-slate-700/30 hover:bg-slate-700/50 transition-all duration-200 cursor-pointer group"
        >
          <HiDocument className="w-5 h-5 text-blue-400" />
          <div className="flex-1">
            <h4 className="font-medium text-white text-sm">{resource.title}</h4>
            <p className="text-xs text-slate-400 uppercase">{resource.type}</p>
          </div>
          <HiChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
        </div>
      ))}
    </div>
  );
}
