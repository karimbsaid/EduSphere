import React, { useEffect, useState, useCallback } from "react";
import GestionCour from "../features/admin/GestionCour";
import { getAllcourse } from "../services/apiCourse";
import { useAuth } from "../context/authContext";
import { useSearchParams } from "react-router-dom";

export default function CoursesDashboard() {
  const [courses, setCourses] = useState([]);
  const [totalCourses, setTotalCourses] = useState(0);
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const token = user?.token;
  const limit = parseInt(searchParams.get("limit") || 5);
  const page = parseInt(searchParams.get("page") || 1);

  const fetchCours = useCallback(async () => {
    const query = {
      sort: searchParams.get("sort") || "totalStudents",
      page,
      limit,
      status:
        searchParams.get("status") && searchParams.get("status") !== "ALL"
          ? searchParams.get("status")
          : undefined,
      search: searchParams.get("search")?.trim() || undefined,
    };
    const courseData = await getAllcourse(query, token);
    setTotalCourses(courseData.totalDocuments);
    setCourses(courseData.courses);
  }, [searchParams, page, limit, token]);

  useEffect(() => {
    fetchCours();
  }, [fetchCours]);

  return (
    <div>
      <GestionCour
        course={courses}
        setSearchParams={setSearchParams}
        searchParams={searchParams}
        totalCourses={totalCourses}
        limit={limit}
        currentPage={page}
      />
    </div>
  );
}
