/* eslint-disable react/prop-types */

export default function Input({
  label,
  type = "text",
  placeholder,
  icon: Icon,
  className,
  disabled,
  ...props
}) {
  return (
    <div className="w-auto">
      {label && (
        <label
          className={`block font-medium mb-1 ${
            disabled ? "text-gray-400" : "text-gray-700"
          }`}
        >
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon
            className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
              disabled ? "text-gray-300" : "text-gray-500"
            }`}
          />
        )}
        <input
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-auto px-4 py-1 my-1 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${
            disabled
              ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
              : "bg-white text-gray-900 border-gray-300"
          } ${className}`}
          {...props}
        />
      </div>
    </div>
  );
}
