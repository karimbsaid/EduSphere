/* eslint-disable react/prop-types */
import { useContext, useEffect, useState } from "react";
import Resource from "./Resource";
import Button from "../../../ui/Button";

import { CourseContext } from "../../../context/courseContext";

export default function CourseResources() {
  const { state, dispatch } = useContext(CourseContext);

  const { resources } = state;
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isThereFileToSplit = resources.some((res) => res.isSpliter === true);
  // const handleFaqChange = (index, field, value) => {
  //   dispatch({
  //     type: "UPDATE_FAQ_FIELD",
  //     index,
  //     field,
  //     value,
  //   });
  // };

  // const handleAddFAQ = () => {
  //   dispatch({ type: "ADD_FAQ" });
  // };

  // const handleDeleteFaq = (index) => {
  //   dispatch({ type: "DELETE_FAQ", index });
  // };

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
