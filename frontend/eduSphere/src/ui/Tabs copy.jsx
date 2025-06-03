/* eslint-disable react/prop-types */
import React, {
  createContext,
  useContext,
  useState,
  cloneElement,
} from "react";

const TabsContext = createContext();

export const Tabs = ({ defaultValue, children, className }) => {
  const [activeTab, setActiveTab] = useState(defaultValue);
  const handleTabChange = (value) => {
    setActiveTab(value);
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab: handleTabChange }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
};

export const TabsList = ({ children, className }) => {
  const { setActiveTab } = useContext(TabsContext);

  return (
    <div className={`grid w-full grid-cols-1  gap-2 ${className}`}>
      {React.Children.map(children, (child) =>
        cloneElement(child, {
          onClick: () => setActiveTab(child.props.value),
        })
      )}
    </div>
  );
};

export const TabsTrigger = ({ children, value, className }) => {
  const { activeTab, setActiveTab } = useContext(TabsContext);

  return (
    <button
      className={`${
        activeTab === value
          ? "bg-black text-white"
          : "text-black bg-gray-100 hover:bg-gray-200"
      } p-2 rounded-md transition-colors ${className}`}
      onClick={() => setActiveTab(value)}
    >
      {children}
    </button>
  );
};

export const TabsContent = ({ value, children, className }) => {
  const { activeTab } = useContext(TabsContext);

  return activeTab === value ? (
    <div className={className}>{children}</div>
  ) : null;
};

// Utilisation corrigée
