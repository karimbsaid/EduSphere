const CourseCardSkeleton = () => {
  return (
    <div className="max-w-xs bg-white rounded-lg shadow-sm overflow-hidden animate-pulse flex flex-col">
      {/* Image skeleton */}
      <div className="relative h-56 bg-gray-200">
        <div className="absolute top-3 left-3 w-16 h-6 bg-gray-300 rounded-md" />
      </div>

      {/* Card content */}
      <div className="p-4 flex flex-col flex-1">
        {/* Metrics */}
        <div className="flex justify-end gap-3 mb-2">
          <div className="w-10 h-4 bg-gray-300 rounded" />
          <div className="w-10 h-4 bg-gray-300 rounded" />
        </div>

        {/* Title */}
        <div className="h-5 bg-gray-300 rounded mb-4 w-3/4" />

        {/* Instructor and price */}
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gray-300 rounded-full mr-2" />
            <div className="w-24 h-4 bg-gray-300 rounded" />
          </div>
          <div className="w-12 h-5 bg-gray-300 rounded" />
        </div>
      </div>
    </div>
  );
};

export default CourseCardSkeleton;
