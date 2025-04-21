/* eslint-disable react/prop-types */
// components/Modal.jsx
import React from "react";

export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-10 flex items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto p-6">
        {/* Title */}
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{title}</h2>

        {/* Content */}
        <div className="text-gray-700">{children}</div>

        {/* Actions */}
        <div className="mt-6 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
