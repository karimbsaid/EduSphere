/* eslint-disable react/prop-types */
import React from "react";

export default function Option({
  option,
  isMultipleChoice = false,
  toggleOption,
  isSelected,
  optionIndex,
}) {
  if (option.text.trim() === "") {
    return;
  }
  return (
    <div className="flex items-center space-x-2 mb-2">
      <input
        id={`option-${optionIndex}`}
        type={isMultipleChoice ? "checkbox" : "radio"}
        checked={isSelected}
        onChange={() => toggleOption(optionIndex)}
        className="appearance-none w-5 h-5 border border-gray-300 rounded checked:bg-black checked:border-black"
      />
      <label htmlFor={`option-${optionIndex}`}>{option.text}</label>
    </div>
  );
}
