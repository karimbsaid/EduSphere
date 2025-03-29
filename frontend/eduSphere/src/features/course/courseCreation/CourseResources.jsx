/* eslint-disable react/prop-types */
import React from "react";
import Resource from "./Resource";
import Button from "../../../ui/Button";

export default function CourseResources({ courseData, setCourseData }) {
  const { resources } = courseData;

  const handleAddResource = () => {
    setCourseData((prev) => ({
      ...prev,
      resources: [
        ...prev.resources,
        { title: "", file: null, ...(prev.isEdit && { isNew: true }) },
      ],
    }));
  };

  return (
    <div>
      {resources.map((res, index) => {
        return (
          <Resource
            resource={res}
            key={index}
            setCourseData={setCourseData}
            resourceIndex={index}
          />
        ); // Added return here
      })}
      <Button
        label="add new Resource"
        className="bg-black text-white"
        onClick={handleAddResource}
      />
    </div>
  );
}
