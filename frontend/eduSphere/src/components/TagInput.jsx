/* eslint-disable react/prop-types */
"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const TagIcon = () => (
  <svg
    className="h-4 w-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 10V3a2 2 0 0 0-2-2h-7a2 2 0 0 0-1.41.59l-7 7a2 2 0 0 0 0 2.82l9 9a2 2 0 0 0 2.82 0l7-7A2 2 0 0 0 22 13v-3z" />
    <circle cx="12" cy="12" r="1" />
  </svg>
);

const CloseIcon = () => (
  <svg
    className="h-4 w-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export default function TagInput({
  label = "Tags",
  placeholder = "Ajouter un tag...",
  initialTags = [],
  maxTags = 10,
  onChange,
  className,
}) {
  const [input, setInput] = useState("");
  const inputRef = useRef(null);

  const addTag = (tag) => {
    if (
      tag.trim() !== "" &&
      !initialTags.includes(tag) &&
      initialTags.length < maxTags
    ) {
      onChange?.([...initialTags, tag.trim()]);
      setInput("");
    }
  };

  const removeTag = (index) => {
    const newTags = initialTags.filter((_, i) => i !== index);
    onChange?.(newTags);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && input.trim() !== "") {
      e.preventDefault();
      addTag(input);
    } else if (
      e.key === "Backspace" &&
      input === "" &&
      initialTags.length > 0
    ) {
      removeTag(initialTags.length - 1);
    }
  };

  return (
    <div className={`space-y-2 w-full ${className}`}>
      {label && (
        <label className="text-gray-700 font-medium text-sm ">{label}</label>
      )}
      <div
        className="flex flex-wrap gap-2 p-2 border rounded-md min-h-10"
        onClick={() => inputRef.current?.focus()}
      >
        <AnimatePresence>
          {initialTags.map((tag, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                <TagIcon />
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeTag(index);
                  }}
                  className="ml-1 hover:text-blue-900"
                >
                  <CloseIcon />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={initialTags.length === 0 ? placeholder : ""}
          className="flex-1 border-0 focus:ring-0 p-0 h-6 placeholder-gray-400 bg-transparent"
        />
      </div>
    </div>
  );
}
