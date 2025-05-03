/* eslint-disable react/prop-types */
import React, { useState, useRef, useEffect } from "react";
import { HiChevronDown } from "react-icons/hi2";

const ActionMenu = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Ferme le menu si on clique à l'extérieur
  //   useEffect(() => {
  //     const handleClickOutside = (event) => {
  //       console.log(event.target);
  //       if (menuRef.current && !menuRef.current.contains(event.target)) {
  //         setIsOpen(false);
  //       }
  //     };
  //     document.addEventListener("mousedown", handleClickOutside);
  //     return () => document.removeEventListener("mousedown", handleClickOutside);
  //   }, []);

  return (
    <div className="relative inline-block" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gray-800 text-white px-4 py-2 rounded-md flex items-center justify-between w-[120px] text-sm"
      >
        Actions
        <HiChevronDown className="ml-2 h-4 w-4" />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-[120px] bg-white border rounded-lg shadow-md z-10">
          {React.Children.toArray(children)
            .filter((child) => child != null) // Filtre les enfants null ou undefined
            .map((child) =>
              React.cloneElement(child, {
                onAction: () => setIsOpen(false), // Ferme le menu après une action
              })
            )}
        </div>
      )}
    </div>
  );
};

const ActionItem = ({ children, onClick, onAction }) => (
  <button
    onClick={() => {
      onClick();
      onAction(); // Ferme le menu
    }}
    className="w-full text-left px-4 py-2 hover:bg-gray-200 text-sm text-gray-800"
  >
    {children}
  </button>
);

ActionMenu.Item = ActionItem;

export default ActionMenu;
