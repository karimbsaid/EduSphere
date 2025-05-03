import React, { useCallback, useEffect, useRef, useState } from "react";
import { getMyEnrolledCourse } from "../services/apiEnrollment";
import { useAuth } from "../context/authContext";
import DropDown from "../ui/DropDownn";
import Input from "../ui/Input";
import { HiMiniMagnifyingGlass } from "react-icons/hi2";
import EnrolledCourseTab from "../features/course/enrolledCourses/EnrolledCourseTab";
import { useSearchParams } from "react-router-dom";
import Button from "../ui/Button";
import Spinner from "../ui/Spinner";

export default function EnrolledCourse() {
  const { user } = useAuth();
  const token = user?.token;
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const fetchMyEnrolledCourses = async () => {
      try {
        const response = await getMyEnrolledCourse(token);
        if (response.status === "success") {
          setEnrolledCourses(response.enrolledCourses);
          setFilteredCourses(response.enrolledCourses);
        }
      } catch (error) {
        setError("Erreur lors de la récupération des cours.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyEnrolledCourses();
  }, [token]);

  useEffect(() => {
    if (!enrolledCourses.length) return;

    const category = searchParams.get("category") || "all";
    const search = searchParams.get("search") || "";

    const filtered = enrolledCourses.filter((course) => {
      const courseName = course.courseId.title
        ? course.courseId.title.toLowerCase()
        : "";
      return (
        (category === "all" ||
          course.courseId.category === category.toUpperCase()) &&
        (search ? courseName.includes(search.toLowerCase()) : true)
      );
    });

    setFilteredCourses(filtered);
  }, [searchParams, enrolledCourses]);

  const inputRef = useRef(null);

  const handleKeyDown = useCallback((event) => {
    if (event.key === "Enter" && document.activeElement === inputRef.current) {
      handleFilterChange("search", inputRef.current.value);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  const handleFilterChange = (field, value) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set(field, value);
      return newParams;
    });
  };

  // Fonction pour réinitialiser les filtres
  const handleClearFilters = () => {
    setSearchParams({
      category: "all",
      search: "",
    });
  };
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <Spinner size="lg" />
        <div className="ml-4 text-lg">Chargement...</div>
      </div>
    );
  }
  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="text-3xl font-bold">Mes cours</h1>
        <div className="flex flex-col sm:flex-row gap-4 mt-4 md:mt-0">
          {/*<Input
            placeholder="Rechercher dans mes cours..."
            className="w-full sm:w-64"
            icon={HiMiniMagnifyingGlass}
            ref={inputRef}
          />
          <DropDown
            value={searchParams.get("category") || "all"}
            onValueChange={(v) => handleFilterChange("category", v)}
          >
            <DropDown.Button label="Catégorie" />
            <DropDown.Content>
              <DropDown.Item value="all">Toutes</DropDown.Item>
              <DropDown.Item value="development">Développement</DropDown.Item>
              <DropDown.Item value="design">Design</DropDown.Item>
              <DropDown.Item value="business">Business</DropDown.Item>
              <DropDown.Item value="marketing">Marketing</DropDown.Item>
            </DropDown.Content>
          </DropDown>
          <Button
            onClick={handleClearFilters}
            className="bg-red-400 text-white p-2 rounded cursor-pointer"
            label="Clear Filters"
          />*/}
        </div>
      </div>
      <div className="p-4">
        {filteredCourses.length === 0 ? (
          <div className="text-center text-lg font-semibold text-gray-500">
            Aucun cours trouvé.
          </div>
        ) : (
          <EnrolledCourseTab enrolledCourses={filteredCourses} />
        )}
      </div>
    </div>
  );
}
