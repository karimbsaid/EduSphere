import React, { useEffect, useMemo, useState } from "react";
import CourseCard from "../features/dashboard/CourseCard";
import { useAuth } from "../context/authContext";
import { getAllMyCourseStats } from "../services/apiCourse";
import {
  HiArrowsUpDown,
  HiMiniArrowTrendingUp,
  HiMiniMagnifyingGlass,
  HiMiniPlus,
  HiOutlineCurrencyDollar,
  HiOutlineFunnel,
  HiOutlineStar,
  HiOutlineUsers,
} from "react-icons/hi2";
import CourseStatsOverview from "../features/dashboard/CourseStatsOverview";
import Button from "../ui/Button";
import Card from "../ui/Card";
import { useNavigate } from "react-router-dom";
import Input from "../ui/Input";
import Tab from "../ui/Tab";
import { DropDown } from "../ui/DropDown";
import { getMyCourses } from "../services/apiProfile";

export default function Dashboard() {
  const [courses, setCourses] = useState([]);
  const [selectedCategorie, setCategorie] = useState("All");
  const [selectedSort, setSort] = useState("");
  const [searchQuery, setSearchQuery] = useState(""); // Ajout du state pour la recherche

  const { user } = useAuth();
  const token = user.token;
  const navigate = useNavigate();

  const totalStudents = courses.reduce(
    (sum, course) => sum + course.totalStudent,
    0
  );
  const totalRevenue = courses.reduce((sum, course) => sum + course.revenu, 0);
  const averageRating =
    courses.reduce((sum, course) => sum + course.averageRating, 0) /
    courses.length;
  const averageCompletion =
    totalStudents > 0
      ? courses.reduce((sum, course) => sum + course.totalStudentComplete, 0) /
        totalStudents
      : 0;

  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (!token) return;

    const fetchCourses = async () => {
      try {
        const { user: teacherCourses } = await getMyCourses(token);
        const { courses } = teacherCourses;
        console.log(courses);
        setCourses(courses);
      } catch (error) {
        console.error("Erreur lors de la récupération des cours:", error);
      }
    };

    fetchCourses();
  }, [token]);
  const stats = [
    { label: "Total Students", value: totalStudents, Icon: HiOutlineUsers },
    {
      label: "Total Revenue",
      value:
        totalRevenue.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }) + " €",
      Icon: HiOutlineCurrencyDollar,
    },
    {
      label: "Average Rating",
      value: averageRating.toFixed(2),
      Icon: HiOutlineStar,
    },
    {
      label: "Average Completion Rate",
      value: (averageCompletion * 100).toFixed(2) + "%",
      Icon: HiMiniArrowTrendingUp,
    },
  ];
  const tabData = [
    { id: 1, tabName: "tous les cours", type: "all" },
    { id: 2, tabName: "Publiés", type: "publié" },
    { id: 3, tabName: "Draft", type: "Draft" },
  ];
  const categorieOption = [
    { id: 1, optionText: "Toutes les catégories", value: "All" },
    { id: 2, optionText: "Programmation", value: "Programmation" },
    { id: 3, optionText: "Design", value: "Design" },
    { id: 4, optionText: "Marketing", value: "Marketing" },
  ];
  const sortOption = [
    { id: 1, optionText: "Nombre d'etudiant", value: "NombreEtudiant" },
    { id: 2, optionText: "Note", value: "Note" },
    { id: 3, optionText: "Revenue", value: "Revenu" },
    { id: 4, optionText: "Date", value: "Date" },
  ];

  const filteredCourses = useMemo(() => {
    let filtered = [...courses];

    if (activeTab !== "all") {
      filtered = filtered.filter(
        (course) => course.status.toLowerCase() === activeTab.toLowerCase()
      );
    }

    if (searchQuery) {
      filtered = filtered.filter((course) =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategorie !== "All") {
      filtered = filtered.filter(
        (course) =>
          course.category &&
          course.category.toUpperCase() === selectedCategorie.toUpperCase()
      );
    }

    if (selectedSort) {
      filtered.sort((a, b) => {
        if (selectedSort === "createdAt") {
          return new Date(b.createdAt) - new Date(a.createdAt);
        }
        return b[selectedSort] - a[selectedSort];
      });
    }
    return filtered;
  }, [courses, activeTab, searchQuery, selectedCategorie, selectedSort]);
  return (
    <Card className="flex flex-col">
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Tableau de Bord Enseignant</h1>
            <p className="text-muted-foreground">
              Gérez vos cours et suivez vos performances
            </p>
          </div>
        </div>
      </header>
      {filteredCourses.length > 0 ? (
        <div>
          <div className="flex flex-col sm:flex-row justify-center sm:justify-between items-center gap-4 w-full">
            <Tab
              tabData={tabData}
              field={activeTab}
              setField={(type) => setActiveTab(type)}
            />

            {/* Centered filters in small screens, right-aligned in large screens */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto sm:ml-auto justify-center text-center">
              <Input
                placeholder="Rechercher un cours"
                icon={HiMiniMagnifyingGlass}
                className="w-full sm:w-auto"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <DropDown
                options={categorieOption}
                onValueChange={setCategorie}
                value={selectedCategorie}
                label="Catégorie"
                icon={HiOutlineFunnel}
                className="w-full sm:w-auto"
              />
              <DropDown
                options={sortOption}
                onValueChange={setSort}
                value={selectedSort}
                label="Trier par"
                icon={HiArrowsUpDown}
                className="w-full sm:w-auto"
              />
            </div>
          </div>

          <CourseStatsOverview stats={stats} />
          {filteredCourses.map((course) => (
            <CourseCard course={course} key={course._id} />
          ))}
        </div>
      ) : (
        <h1 className="font-bold my-2">
          tu n&apos;a pas déja créer un cour faire créer votre premier cours{" "}
        </h1>
      )}

      <Button
        label="Créer un nouveau cours"
        icon={HiMiniPlus}
        onClick={() => navigate("/my-courses/add")}
        className="bg-black text-white self-center"
      />
    </Card>
  );
}
