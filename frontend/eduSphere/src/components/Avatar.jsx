export default function Avatar({ image, alt, size = 32, children, ...props }) {
  const dimension = `h-${size} w-${size}`;

  return (
    <div className={`relative`}>
      <div
        className={`rounded-full overflow-hidden bg-gray-200 flex items-center justify-center ${dimension}`}
        {...props}
      >
        <img
          src={image || "/placeholder.svg"}
          alt={alt}
          width={size}
          height={size}
          className="h-full w-full object-cover"
        />
        {children}
      </div>
    </div>
  );
}
