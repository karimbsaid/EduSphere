/* eslint-disable react/prop-types */
import React, {
  createContext,
  useContext,
  useState,
  cloneElement,
} from "react";

const TabsContext = createContext();

const Tabs = ({ defaultValue, children, className }) => {
  const [activeTab, setActiveTab] = useState(defaultValue);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
};
const TabsList = ({ children, className }) => {
  return (
    <div
      className={`flex bg-slate-800/50 backdrop-blur-sm rounded-xl p-1 gap-1 ${className}`}
    >
      {children}
    </div>
  );
};

const TabsTrigger = ({ children, value, className }) => {
  const { activeTab, setActiveTab } = useContext(TabsContext);

  return (
    <button
      className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
        activeTab === value
          ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-[1.02]"
          : "text-slate-300 hover:text-white hover:bg-slate-700/50"
      } ${className}`}
      onClick={() => setActiveTab(value)}
    >
      {children}
    </button>
  );
};

const TabsContent = ({ value, children, className }) => {
  const { activeTab } = useContext(TabsContext);

  return activeTab === value ? (
    <div
      className={`animate-in fade-in-0 slide-in-from-bottom-2 duration-300 ${className}`}
    >
      {children}
    </div>
  ) : null;
};

// Utilisation corrigée
export { Tabs, TabsList, TabsTrigger, TabsContent };
