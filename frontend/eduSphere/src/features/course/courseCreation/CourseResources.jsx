/* eslint-disable react/prop-types */
import React, { useContext } from "react";
import Resource from "./Resource";
import Button from "../../../ui/Button";
import { CourseContext } from "../../../context/courseContext";

export default function CourseResources() {
  const { state, dispatch } = useContext(CourseContext);
  const { resources } = state;

  const handleAddResource = () => {
    dispatch({ type: "ADD_RESOURCE" });
  };

  return (
    <div>
      {resources.map((res, index) => {
        return <Resource resource={res} key={index} resourceIndex={index} />; // Added return here
      })}
      <Button
        label="add new Resource"
        className="bg-black text-white"
        onClick={handleAddResource}
      />
    </div>
  );
}
