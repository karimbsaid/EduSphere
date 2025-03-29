/* eslint-disable react/prop-types */

export default function Input({
  label,
  type = "text",
  placeholder,
  icon: Icon,
  className,
  ...props
}) {
  return (
    <div className="w-auto">
      {label && (
        <label className="block text-gray-700 font-medium mb-1">{label}</label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
        )}
        <input
          type={type}
          placeholder={placeholder}
          className={`w-full px-4 py-2 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${className}`}
          {...props}
        />
      </div>
    </div>
  );
}
