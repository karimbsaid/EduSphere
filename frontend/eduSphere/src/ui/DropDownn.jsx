// /* eslint-disable react/prop-types */
// import {
//   useState,
//   useEffect,
//   useRef,
//   createContext,
//   useContext,
//   useCallback,
// } from "react";
// import { HiCheck, HiChevronDown } from "react-icons/hi2";
// import Button from "./Button";

// const DropDownContext = createContext();

// const useDropDown = () => {
//   const context = useContext(DropDownContext);
//   if (!context) {
//     throw new Error("DropDown components must be wrapped in <DropDown>");
//   }
//   return context;
// };

// const DropDown = ({ value, onValueChange, children }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [items, setItems] = useState([]);
//   const dropdownRef = useRef(null);

//   const selectedItem = items.find((item) => item.value === value);

//   const registerItem = useCallback((value, optionText) => {
//     setItems((prev) => [...prev, { value, optionText }]);
//     return () => {
//       setItems((prev) => prev.filter((item) => item.value !== value));
//     };
//   }, []);

//   const handleSelect = (value) => {
//     setIsOpen(false);
//     onValueChange(value);
//   };

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//         setIsOpen(false);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const contextValue = {
//     isOpen,
//     setIsOpen,
//     selectedItem,
//     handleSelect,
//     registerItem,
//   };

//   return (
//     <DropDownContext.Provider value={contextValue}>
//       <div className="relative inline-block w-[200px]" ref={dropdownRef}>
//         {children}
//       </div>
//     </DropDownContext.Provider>
//   );
// };

// const ButtonComponent = ({ icon, label }) => {
//   const { selectedItem, setIsOpen, isOpen } = useDropDown();

//   return (
//     <Button
//       onClick={() => setIsOpen(!isOpen)}
//       icon={icon}
//       type="button"
//       label={selectedItem ? selectedItem.optionText : label}
//       className="bg-black text-white"
//       iconEnd={HiChevronDown}
//     />
//   );
// };

// const Content = ({ children }) => {
//   const { isOpen } = useDropDown();

//   if (!isOpen) return null;

//   return (
//     <div className="absolute mt-2 w-full bg-white border rounded-lg shadow-md z-5000">
//       {children}
//     </div>
//   );
// };

// const Item = ({ value, children }) => {
//   const { handleSelect, selectedItem, registerItem } = useDropDown();

//   useEffect(() => {
//     const unregister = registerItem(value, children);
//     return unregister;
//   }, [value, children, registerItem]);

//   return (
//     <div
//       className="px-4 py-2 hover:bg-gray-200 cursor-pointer flex items-center"
//       onClick={() => handleSelect(value)}
//     >
//       <HiCheck
//         opacity={selectedItem?.value === value ? 100 : 0}
//         className="mr-1"
//       />
//       {children}
//     </div>
//   );
// };

// DropDown.Button = ButtonComponent;
// DropDown.Content = Content;
// DropDown.Item = Item;

// export default DropDown;

/* eslint-disable react/prop-types */
import {
  useState,
  useEffect,
  useRef,
  createContext,
  useContext,
  useCallback,
} from "react";
import { HiCheck, HiChevronDown } from "react-icons/hi2";
import Button from "./Button";

const DropDownContext = createContext();

const useDropDown = () => {
  const context = useContext(DropDownContext);
  if (!context) {
    throw new Error("DropDown components must be wrapped in <DropDown>");
  }
  return context;
};

const DropDown = ({ value, onValueChange, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState([]);
  const dropdownRef = useRef(null);

  const selectedItem = items.find((item) => item.value === value);
  const registerItem = useCallback((itemValue, optionText, type) => {
    if (type !== "value") return () => {};
    setItems((prev) => [...prev, { value: itemValue, optionText, type }]);
    return () => {
      setItems((prev) => prev.filter((item) => item.value !== itemValue));
    };
  }, []);

  const handleSelect = (item) => {
    setIsOpen(false);
    if (item.type === "value") {
      onValueChange(item.value);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const contextValue = {
    isOpen,
    setIsOpen,
    selectedItem,
    handleSelect,
    registerItem,
  };

  return (
    <DropDownContext.Provider value={contextValue}>
      <div className="relative inline-block w-[200px]" ref={dropdownRef}>
        {children}
      </div>
    </DropDownContext.Provider>
  );
};

const ButtonComponent = ({ icon = "", label }) => {
  const { selectedItem, setIsOpen, isOpen } = useDropDown();
  return (
    <Button variant="simple" onClick={() => setIsOpen(!isOpen)} type="button">
      <span>{selectedItem ? selectedItem.optionText : label}</span>
      <HiChevronDown />
    </Button>
  );
};

const Content = ({ children }) => {
  const { isOpen } = useDropDown();

  if (!isOpen) return null;

  return (
    <div className="absolute mt-2 w-full bg-white border rounded-lg shadow-md z-50">
      {children}
    </div>
  );
};

const Item = ({ value, children, type = "value", onClick }) => {
  const { handleSelect, selectedItem, registerItem } = useDropDown();

  useEffect(() => {
    const unregister = registerItem(value, children, type);
    return unregister;
  }, [value, children, registerItem, type]);

  const handleClick = () => {
    if (type === "action" && onClick) onClick();
    handleSelect({ value, type }); // Ferme le dropdown
  };

  return (
    <div
      className="px-4 py-2 hover:bg-gray-200 cursor-pointer flex items-center"
      onClick={handleClick}
    >
      <HiCheck
        opacity={type === "value" && selectedItem?.value === value ? 100 : 0}
        className="mr-1"
      />
      {children}
    </div>
  );
};

DropDown.Button = ButtonComponent;
DropDown.Content = Content;
DropDown.Item = Item;

export default DropDown;
