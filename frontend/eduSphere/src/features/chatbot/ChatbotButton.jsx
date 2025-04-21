import { LuMessageSquare, LuX } from "react-icons/lu";

/* eslint-disable react/prop-types */
export function ChatbotButton({ isOpen, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`
        fixed bottom-6 right-6 z-50
        rounded-full w-14 h-14
        flex items-center justify-center
        shadow-lg transition-all duration-300
      `}
    >
      {isOpen ? (
        <LuX className="h-6 w-6" />
      ) : (
        <LuMessageSquare className="h-6 w-6" />
      )}
    </button>
  );
}
