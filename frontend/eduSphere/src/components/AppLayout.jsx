import { Outlet, useParams } from "react-router-dom";
import SideBar from "./SideBar";
import { useState } from "react";
import { HiMenu } from "react-icons/hi";
import { ChatbotButton } from "../features/chatbot/ChatbotButton";
import ChatbotWindow from "../features/chatbot/ChatbotWindow";

export default function AppLayout() {
  const { courseId, sectionId } = useParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar desktop : fixe lors du défilement */}
      <div className="hidden md:block fixed top-0 left-0 h-screen z-30">
        <SideBar courseId={courseId} sectionId={sectionId} />
      </div>

      {/* Overlay pour mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar mobile : coulissante */}
      <div
        className={`fixed md:hidden z-50 transform transition-transform duration-300 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } top-0 left-0 h-screen`}
      >
        <SideBar
          courseId={courseId}
          sectionId={sectionId}
          onClose={() => setIsSidebarOpen(false)}
        />
      </div>

      {/* Contenu principal */}
      <main className="flex-1 overflow-auto w-full md:ml-64">
        {/* Bouton menu mobile */}
        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="md:hidden fixed top-4 left-4 p-2 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 z-30"
          >
            <HiMenu className="w-6 h-6 text-gray-800 dark:text-gray-200" />
          </button>
        )}
        <Outlet />
      </main>

      {courseId && sectionId && (
        <ChatbotButton
          isOpen={isChatOpen}
          onClick={() => setIsChatOpen(!isChatOpen)}
        />
      )}
      {isChatOpen && (
        <ChatbotWindow
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
        />
      )}
    </div>
  );
}
