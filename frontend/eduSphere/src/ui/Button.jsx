// /* eslint-disable react/prop-types */
// const Button = ({
//   label = "Button",
//   className = "",
//   onClick,
//   icon: Icon = null,
//   iconEnd: IconEnd = null,
//   disabled = false,
//   variant = "simple",
//   outline = false,
//   ...props
// }) => {
//   const variantStyles = {
//     success: {
//       solid: "bg-green-200 text-green-600",
//       outline: "border border-green-600 text-green-600 bg-transparent",
//     },
//     warning: {
//       solid: "bg-yellow-200 text-yellow-600",
//       outline: "border border-yellow-600 text-yellow-600 bg-transparent",
//     },
//     ghost: {
//       solid: "bg-red-200 text-red-600",
//       outline: "border border-red-600 text-red-600 bg-transparent",
//     },
//     simple: {
//       solid: "bg-black text-white",
//       outline: "border border-black text-black bg-transparent",
//     },
//   };

//   const disabledStyles = "opacity-50 cursor-not-allowed pointer-events-none";
//   const styleType = outline ? "outline" : "solid";
//   const varStyle = variantStyles[variant][styleType];

//   return (
//     <button
//       className={`flex items-center gap-2 px-4 py-2 rounded-lg transition whitespace-nowrap my-2
//         ${varStyle} ${disabled ? disabledStyles : ""} `}
//       onClick={onClick}
//       disabled={disabled}
//       {...props}
//     >
//       {Icon && <Icon className="mr-2 h-5 w-5" />}
//       {label}
//       {IconEnd && <IconEnd className="ml-2 h-5 w-5" />}
//     </button>
//   );
// };

// export default Button;

/* eslint-disable react/prop-types */
import React from "react";

const Button = ({
  type = "button",
  disabled = false,
  variant,
  outline = false,
  size = "md", // optional: sm, md, lg
  label,
  children,
  className = "",
  ...props
}) => {
  const variantStyles = {
    success: {
      solid: "bg-green-200 text-green-600",
      outline: "border border-green-600 text-green-600 bg-transparent",
    },
    warning: {
      solid: "bg-yellow-200 text-yellow-600",
      outline: "border border-yellow-600 text-yellow-600 bg-transparent",
    },
    ghost: {
      solid: "bg-red-200 text-red-600",
      outline: "border border-red-600 text-red-600 bg-transparent",
    },
    simple: {
      solid: "bg-black text-white hover:bg-gray-600",
      outline:
        "border border-black text-black bg-transparent hover:bg-gray-100",
    },
  };

  const sizeStyles = {
    sm: "px-2 py-1 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  const disabledStyles = "opacity-50 cursor-not-allowed pointer-events-none";
  const styleType = outline ? "outline" : "solid";
  const varStyle = (variant && variantStyles[variant]?.[styleType]) || "";
  const sizeStyle = sizeStyles[size] || "";

  return (
    <button
      type={type}
      disabled={disabled}
      aria-disabled={disabled}
      className={`
        inline-flex items-center gap-2 rounded-lg transition whitespace-nowrap my-1
        ${varStyle} ${sizeStyle} ${disabled ? disabledStyles : ""} ${className}
      `}
      {...props}
    >
      {label || children}
    </button>
  );
};

export default Button;
