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
    success: "bg-white/80 text-green-600",
    warning: "bg-white/80 text-yellow-600",
    secondary: "bg-white/80 text-blue-600",
    primary: "bg-green-100 text-green-700",
  };
  return (
    <span
      className={`flex items-center w-auto justify-center text-sm  rounded-xl  ${style} ${varianatStyles[variant]}`}
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
