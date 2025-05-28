import DropDown from "../../ui/DropDown";
import { useEffect, useState } from "react";
import { getAllCourseTitle } from "../../services/apiCourse";
import { useAuth } from "../../context/authContext";

export default function ChartFilters({
  filter,
  onFilterChange,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
}) {
  const [courseTitles, setCourseTitles] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const getAllCourses = async () => {
      console.log("yyyyyyyyyyyyyyyy", user.token);
      const reponse = await getAllCourseTitle(user.token);
      console.log("cour", reponse);
      setCourseTitles(reponse.data.data);
    };
    getAllCourses();
  }, []);

  const handleStartDateChange = (e) => {
    console.log(e.target.value);
    // Convert string to Date object
    setStartDate(new Date(e.target.value));
  };

  const handleEndDateChange = (e) => {
    console.log(e.target.value);
    // Convert string to Date object
    setEndDate(new Date(e.target.value));
  };

  // Helper function to format Date to YYYY-MM-DD for input value
  const formatDateForInput = (date) => {
    if (!date || !(date instanceof Date)) return "";
    return date.toISOString().split("T")[0];
  };

  return (
    <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-lg shadow-md">
      {/* Sélecteur de période */}
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700">Période :</label>
        <DropDown
          value={filter.period}
          onValueChange={(val) => onFilterChange("period", val)}
        >
          <DropDown.Button outline showSelectedValue />
          <DropDown.Content>
            <DropDown.Item value="7days">Derniers 7 jours</DropDown.Item>
            <DropDown.Item value="month">Ce mois</DropDown.Item>
            <DropDown.Item value="year">Cette année</DropDown.Item>
            <DropDown.Item value="customDate">
              Durée personnalisée
            </DropDown.Item>
          </DropDown.Content>
        </DropDown>
      </div>

      {/* Dates personnalisées */}
      {filter.period === "customDate" && (
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Du :</label>
          <input
            type="date"
            value={formatDateForInput(startDate)}
            onChange={handleStartDateChange}
            className="border border-gray-300 px-3 py-1.5 rounded-md text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <label className="text-sm font-medium text-gray-700">Au :</label>
          <input
            type="date"
            value={formatDateForInput(endDate)}
            onChange={handleEndDateChange}
            className="border border-gray-300 px-3 py-1.5 rounded-md text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      {/* Sélecteur de cours */}
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700">Cours :</label>
        <DropDown
          value={filter.courseId}
          onValueChange={(val) => onFilterChange("courseId", val)}
        >
          <DropDown.Button outline showSelectedValue />
          <DropDown.Content>
            <DropDown.Item value="All">Tous les cours</DropDown.Item>
            {courseTitles.map((course) => (
              <DropDown.Item key={course._id} value={course._id}>
                {course.title}
              </DropDown.Item>
            ))}
          </DropDown.Content>
        </DropDown>
      </div>
    </div>
  );
}
