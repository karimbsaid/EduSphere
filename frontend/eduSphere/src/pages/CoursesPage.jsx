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
  const token = user?.token;
  const [courses, setCourses] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const limit = parseInt(searchParams.get("limit") || 5);
  const currentPage = parseInt(searchParams.get("page") || 1, 10);
  const category = searchParams.get("category") || "tous";
  const price = searchParams.get("price") || "tous";
  const search = searchParams.get("search") || "";
  const level = searchParams.get("level") || "tous";
  const averageRating = searchParams.get("averageRating") || "tous";
  const sort = searchParams.get("sort") || "totalStudents";
  const duration = searchParams.get("duration") || "tous";

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        const query = {
          page: currentPage,
          limit,
          sort,
        };
        switch (price) {
          case "free":
            query["price"] = 0;
            break;
          case "paid":
            query["price[gt]"] = 0;
            break;
          case "low":
            query["price[lte]"] = 20;
            break;
          case "medium":
            query["price[gte]"] = 20;
            query["price[lte]"] = 50;
            break;
          case "high":
            query["price[gt]"] = 50;
            break;
          default:
            if (price !== "tous") {
              query.price = price;
            }
        }

        switch (averageRating) {
          case "HIGH":
            query["averageRating"] = 5;
            break;
          case "MEDIUM":
            query["averageRating[gte]"] = 4;
            break;
          case "LOW":
            query["averageRating[gte]"] = 3;
            break;
          default:
            if (averageRating !== "tous") {
              query.averageRating = averageRating;
            }
        }
        switch (duration) {
          case "short":
            query["totalDuration[lte]"] = 3 * 3600;
            break;
          case "medium":
            query["totalDuration[gte]"] = 3 * 3600;
            query["totalDuration[lte]"] = 10 * 3600;
            break;
          case "long":
            query["totalDuration[gte]"] = 10 * 3600;
            break;
          default:
            if (duration !== "tous") {
              query.duration = duration;
            }
        }
        if (search.trim() != "") {
          query.search = search;
        }
        if (level != "tous") {
          query.level = level;
        }
        if (category != "tous") {
          query.category = category;
        }

        const { status, data } = await getAllcourse(query, token || null);
        if (status === "success") {
          // console.log(response.courses);
          setCourses(data.data);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, [token, searchParams]);

  const onFilterChange = (filterType, value) => {
    const params = new URLSearchParams(searchParams);
    params.set(filterType, value);
    setSearchParams(params);
  };
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center">
        <CourseFilter />
        {/* <Chart /> */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <div className="text-sm text-textPrimary">
              Affichage de {courses.length} cours
            </div>
            <div className="flex items-center gap-4">
              <DropDown
                value={searchParams.get("sort") || "totalStudents"}
                onValueChange={(v) => onFilterChange("sort", v)}
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
