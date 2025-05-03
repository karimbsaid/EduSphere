import React from "react";
import Navbar from "./NavBar";
import { Outlet } from "react-router-dom";

const PublicLayout = () => {
  return (
    <div className="public-layout min-h-screen bg-gray-100 flex flex-col">
      <div className="sticky top-0 z-10">
        <Navbar />
      </div>
      <div className="content flex-1 container mx-auto px-4 py-6">
        <Outlet />
      </div>
    </div>
  );
};

export default PublicLayout;
