import { useEffect, useState } from "react";
import { getAllcourse, getStats } from "../services/apiCourse";

import HeroSection from "../features/HomePage/guest/HeroSection";
import CourseSearchSection from "../features/HomePage/guest/CourseSearchSection";
import CategorySection from "../features/HomePage/guest/CategorySection";
import PopulaireResult from "../features/HomePage/guest/PopulaireResult";
import StatsSection from "../features/HomePage/guest/StatsSection";
import Process from "../features/HomePage/guest/Process";

export default function HomePage() {
  const [stats, setStats] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [courses, setCourses] = useState([]);

  const [filters, setFilters] = useState({
    level: "level",
    duration: "tous",
    price: "tous",
    search: "",
  });
  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
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

        console.log(query);
        const response = await getAllcourse(query);
        console.log(response);
        // if (response.status === "success") {
        //   setCourses(response.data.courses);
        // }
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, [filters]);
  useEffect(() => {
    const fetchStats = async () => {
      const reponseStats = await getStats();
      if (reponseStats.status === "success") {
        const { data: stats } = reponseStats;
        console.log(stats.coursesByCategory);
        setStats(stats);
      }
      // setStats(stats);
    };

    fetchStats();
  }, []);

  return (
    <div className="flex flex-col items-center ">
      <HeroSection />
      <CourseSearchSection
        filters={filters}
        onFilterChange={handleFilterChange}
      />
      <CategorySection coursesByCategory={stats?.coursesByCategory} />
      {/* <PopulaireResult courses={courses} /> */}
      <StatsSection
        totalCourses={stats?.totalCourses}
        totalInstructors={stats?.totalInstructors}
        totalStudents={stats?.totalStudents}
      />
      <Process />
    </div>
  );
}
