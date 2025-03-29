/* eslint-disable react/prop-types */
import { useState } from "react";
import { HiCheck, HiChevronDown } from "react-icons/hi2";
import Button from "./Button";

const DropDown = ({ value, onValueChange, options, icon, label }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Find the optionText for the current value
  const selectedOption = options.find((opt) => opt.value === value);

  const handleSelect = (optValue) => {
    setIsOpen(false);
    onValueChange(optValue);
  };

  return (
    <div className="relative inline-block w-[200px]">
      {/* Dropdown Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        icon={icon}
        label={selectedOption ? selectedOption.optionText : label}
        iconEnd={HiChevronDown}
      />

      {/* Dropdown Content (Visible when isOpen is true) */}
      {isOpen && (
        <SelectContent>
          {options.map((opt) => (
            <SelectItem
              key={opt.id}
              value={opt.value}
              isActive={selectedOption?.value === opt.value ? true : false}
              optionText={opt.optionText}
              handleSelect={handleSelect}
            />
          ))}
        </SelectContent>
      )}
    </div>
  );
};

// Dropdown Menu Container
const SelectContent = ({ children }) => (
  <div className="absolute mt-2 w-full bg-white border rounded-lg shadow-md z-10">
    {children}
  </div>
);

// Dropdown Item
const SelectItem = ({ value, optionText, handleSelect, isActive }) => (
  <div
    className="px-4 py-2 hover:bg-gray-200 cursor-pointe flex items-center"
    onClick={() => handleSelect(value)}
  >
    <HiCheck opacity={isActive ? 100 : 0} className="mr-1" />
    {optionText}
  </div>
);

export { DropDown };
