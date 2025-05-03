/* eslint-disable react/prop-types */
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { HiArrowLeftOnRectangle } from "react-icons/hi2";

export default function UserPanel({ userDetail }) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
    // console.log("deconnexion..");
  };
  return (
    <div className="sticky bottom-0 bg-gray-800 p-4 border-t border-gray-700 flex justify-between items-center">
      <div
        className="flex items-center cursor-pointer hover:bg-gray-700 rounded-lg p-2"
        onClick={() => navigate("/my-profile")}
      >
        <img
          src={userDetail.additionalDetails?.photo}
          alt="User Avatar"
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="ml-3">
          <p className="text-sm font-medium">{userDetail.name}</p>
          <p className="text-xs text-gray-400">{userDetail?.role?.name}</p>
        </div>
      </div>

      <button
        onClick={handleLogout}
        className="p-2 rounded-lg hover:bg-red-600 transition"
      >
        <HiArrowLeftOnRectangle className="w-6 h-6 text-red-400" />
      </button>
    </div>
  );
}
