import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import CourseFilter from "../features/course/CourseFilter";
import { getAllcourse } from "../services/apiCourse";
import CourseCard from "../components/CourseCard";
import DropDown from "../ui/DropDownn";
import { useAuth } from "../context/authContext";
export default function CoursesPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { token } = user;
  const [courses, setCourses] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialiser les filtres à partir des searchParams
  const [filters, setFilters] = useState({
    category: searchParams.get("category") || "all",
    price: searchParams.get("price") || "tous",
    search: searchParams.get("search") || "",
    level: searchParams.get("level") || "",
    averageRating: searchParams.get("averageRating") || "tous",
    sort: searchParams.get("sort") || "totalStudents",
    duration: searchParams.get("duration") || "tous",
  });

  // Gérer les changements de filtre et mettre à jour l'URL
  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => {
      const newFilters = { ...prev, [filterType]: value };

      // Mettre à jour les searchParams dans l'URL
      setSearchParams(newFilters);

      return newFilters;
    });
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        const query = {
          ...filters,
          page: 1,
          limit: 5,
        };

        const response = await getAllcourse(query, token);
        if (response.status === "success") {
          console.log(response.courses);
          setCourses(response.courses);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, [filters, token]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center">
        <CourseFilter filters={filters} onFilterChange={handleFilterChange} />
        {/* <Chart /> */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <div className="text-sm text-textPrimary">
              Affichage de {courses.length} cours
            </div>
            <div className="flex items-center gap-4">
              <DropDown
                value={filters.sort}
                onValueChange={(v) => handleFilterChange("sort", v)}
              >
                <DropDown.Button label="Popularity" />
                <DropDown.Content>
                  <DropDown.Item value="totalStudents">
                    Popularity
                  </DropDown.Item>
                  <DropDown.Item value="createdAt">Plus récents</DropDown.Item>
                  <DropDown.Item value="price">prix:croissant</DropDown.Item>
                  <DropDown.Item value="-price">prix:décroissant</DropDown.Item>
                  <DropDown.Item value="-averageRating">Notation</DropDown.Item>
                </DropDown.Content>
              </DropDown>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {courses.map((course) => (
              <CourseCard key={course._id} course={course} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
