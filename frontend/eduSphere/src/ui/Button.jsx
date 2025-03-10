/* eslint-disable react/prop-types */
const Button = ({
  label = "Button",
  className,
  onClick,
  icon: Icon = null,
}) => {
  return (
    <button
      className={`inline-block px-4 py-2 rounded-lg shadow-md transition ${className}`}
      onClick={onClick}
    >
      {Icon && <Icon className="mr-2" />}
      {label}
    </button>
  );
};

export default Button;
