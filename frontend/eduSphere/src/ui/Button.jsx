/* eslint-disable react/prop-types */
const Button = ({
  label = "Button",
  className = "",
  onClick,
  icon: Icon = null,
  iconEnd: IconEnd = null,
  disabled = false,
  variant = "simple",
  outline = false,
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
      solid: "bg-black text-white",
      outline: "border border-black text-black bg-transparent",
    },
  };

  const disabledStyles = "opacity-50 cursor-not-allowed pointer-events-none";
  const styleType = outline ? "outline" : "solid";
  const varStyle = variantStyles[variant][styleType];

  return (
    <button
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition whitespace-nowrap 
        ${varStyle} ${disabled ? disabledStyles : ""} `}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {Icon && <Icon className="mr-2 h-5 w-5" />}
      {label}
      {IconEnd && <IconEnd className="ml-2 h-5 w-5" />}
    </button>
  );
};

export default Button;
