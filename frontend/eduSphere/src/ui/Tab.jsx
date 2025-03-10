/* eslint-disable react/prop-types */
import React from "react";

const Tab = ({ tabData, field, setField }) => {
  return (
    <div className="flex justify-center space-x-4 mb-4">
      {tabData.map((tab) => (
        <button
          key={tab.id}
          type="button" // Évite d'envoyer le formulaire
          className={`px-4 py-2 rounded-lg transition-all duration-300 ${
            field === tab.type
              ? "bg-blue-600 text-white shadow-lg"
              : "bg-gray-300 text-gray-700 hover:bg-gray-400"
          }`}
          onClick={(e) => {
            e.preventDefault(); // Empêche la soumission du formulaire
            setField(tab.type);
          }}
        >
          {tab.tabName}
        </button>
      ))}
    </div>
  );
};

export default Tab;
