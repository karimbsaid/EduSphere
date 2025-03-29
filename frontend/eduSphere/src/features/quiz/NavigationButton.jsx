/* eslint-disable react/prop-types */
import React from "react";
import Button from "../../ui/Button";

export default function NavigationButton({
  onBack,
  onNext,
  nextDisabled,
  prevDisabled,
  nextLabel = "",
  className = "",
}) {
  return (
    <div className="flex justify-between mt-5">
      <Button
        label="Précedant"
        onClick={onBack}
        disabled={prevDisabled}
        className={`${
          prevDisabled ? "bg-gray-200 text-white" : "bg-black text-white"
        }`}
      />
      <Button
        label={nextLabel || "suivant"}
        onClick={onNext}
        disabled={nextDisabled}
        className={`${
          nextDisabled ? "bg-gray-200 text-white" : "bg-black text-white"
        } ${className}`}
      />
    </div>
  );
}
