/* eslint-disable react/prop-types */
import React from "react";
import Button from "./Button";

const Tab = ({ tabData, field, setField }) => {
  return (
    <div className="flex flex-wrap justify-center space-x-4  bg-gray-100 items-center">
      {tabData.map((tab) => (
        <Button
          key={tab.id}
          label={tab.tabName}
          className={
            field === tab.type
              ? "bg-black text-white"
              : "text-gray-600 bg-transparent"
          }
          onClick={(e) => {
            e.preventDefault(); // Empêche la soumission du formulaire
            setField(tab.type);
          }}
        />
      ))}
    </div>
  );
};

export default Tab;
