import { useEffect, useState } from "react";
import { getAllcourse, getStats } from "../services/apiCourse";

import HeroSection from "../features/HomePage/guest/HeroSection";
import CourseSearchSection from "../features/HomePage/user/CourseSearchSection";
import CategorySection from "../features/HomePage/guest/CategorySection";
import PopulaireResult from "../features/HomePage/guest/PopulaireResult";
import StatsSection from "../features/HomePage/guest/StatsSection";
import Process from "../features/HomePage/guest/Process";

export default function GuestPage() {
  const [stats, setStats] = useState({});

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
      <HeroSection totalStudents={stats?.totalStudents} />

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
