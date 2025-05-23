import { useCallback, useEffect, useRef, useState } from "react";
import { getPopulaireCourses, getStats } from "../services/apiCourse";
import CourseCard from "../components/CourseCard";

import HeroSection from "../features/HomePage/guest/HeroSection";
import CategorySection from "../features/HomePage/guest/CategorySection";
import StatsSection from "../features/HomePage/guest/StatsSection";
import Process from "../features/HomePage/guest/Process";
import Input from "../ui/Input";
import { Link, useNavigate } from "react-router-dom";

export default function GuestPage() {
  const [stats, setStats] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [populaireCourses, setPopulaireCourses] = useState([]);
  const navigate = useNavigate();

  const inputRef = useRef(null);

  const handleKeyDown = useCallback((event) => {
    if (event.key === "Enter" && document.activeElement === inputRef.current) {
      const courseQueryUrl = `/courses?page=1&search=${inputRef.current.value}`;
      navigate(courseQueryUrl);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);
  useEffect(() => {
    const fetchStats = async () => {
      const reponseStats = await getStats();
      if (reponseStats.status === "success") {
        const { data: stats } = reponseStats;
        // console.log(stats.coursesByCategory);
        setStats(stats);
      }
      // setStats(stats);
    };

    fetchStats();
  }, []);
  useEffect(() => {
    const fetchPopulaireCourses = async () => {
      try {
        setIsLoading(true);

        const reponse = await getPopulaireCourses();
        console.log(reponse.data.data);
        if (reponse.status === "success") {
          setPopulaireCourses(reponse.data.data);
        }
      } catch (error) {
        setError(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPopulaireCourses();
  }, []);
  return (
    <div className="flex flex-col items-center ">
      <HeroSection totalStudents={stats?.totalStudents} />

      <CategorySection coursesByCategory={stats?.coursesByCategory} />
      <section className="mb-12">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-2 mt-5">
          <h2 className="text-2xl font-bold">Cours Populaires</h2>
          <div className="flex flex-col md:flex-row items-center gap-2">
            <Input
              placeholder="Rechercher des cours..."
              className="w-64"
              ref={inputRef}
            />
            <Link
              to="/courses"
              className="bg-black text-white  px-4 py-2 rounded text-center block"
            >
              Voir tous les cours
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {populaireCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </section>
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
