/* eslint-disable react/prop-types */
import React from "react";

export default function Badge({
  style,
  text,
  icon: Icon,
  onIconClick,
  variant,
  ...props
}) {
  const varianatStyles = {
    success: "bg-green-200 text-green-600",
    warning: "bg-yellow-200 text-yellow-600",
    secondary: "bg-blue-200 text-blue-600",
  };
  return (
    <span
      className={`flex items-center justify-center gap-2 rounded-xl px-2 py-1 font-semibold ${style} ${varianatStyles[variant]}`}
      {...props}
    >
      {text}
      {Icon && (
        <Icon
          className="cursor-pointer text-gray-500 hover:text-black"
          onClick={onIconClick}
        />
      )}
    </span>
  );
}
