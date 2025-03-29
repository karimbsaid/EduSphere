/* eslint-disable react/prop-types */
const Button = ({
  label = "Button",
  className = "",
  onClick,
  icon: Icon = null,
  iconEnd: IconEnd = null,
  disabled = false,
}) => {
  return (
    <button
      className={`flex items-center px-4 py-2 rounded-lg transition 
      whitespace-nowrap  ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {Icon && <Icon className="mr-2" />}
      {label}
      {IconEnd && <IconEnd className="ml-2" />}
    </button>
  );
};

export default Button;
