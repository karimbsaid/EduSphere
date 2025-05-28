import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";
import { useNavigate } from "react-router-dom";

export default function Breadcrumb({ items }) {
  const navigate = useNavigate();

  const handleClick = (path) => {
    if (path) navigate(path);
  };

  return (
    <div className="my-6 flex items-center space-x-2 text-gray-600">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-sm hover:text-black"
      >
        <HiChevronLeft className="mr-1 h-4 w-4 " />
      </button>
      {items.map((item, index) => (
        <div key={item.label} className="flex items-center">
          {index > 0 && <HiChevronRight className="mx-1 h-4 w-4" />}
          {item.path ? (
            <button
              onClick={() => handleClick(item.path)}
              className="text-sm hover:underline hover:text-black"
            >
              {item.label}
            </button>
          ) : (
            <span className="text-sm text-gray-500">{item.label}</span>
          )}
        </div>
      ))}
    </div>
  );
}
