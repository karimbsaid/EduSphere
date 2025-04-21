import React, { useEffect, useState } from "react";
import DropDown from "../ui/DropDownn";
import Card from "../ui/Card";
import { getTopCourses, getTopInstructors } from "../services/apiStats";
import { useAuth } from "../context/authContext";
export default function RapportAndAnalyse() {
  const [popularCourses, setPopularCourses] = useState([]);
  const [topInstructors, setTopInstructors] = useState([]);
  const { user } = useAuth();
  const { token } = user;
  const [query, setQuery] = useState({ timeRange: "year" });
  useEffect(() => {
    const fetchTopInstrcutor = async () => {
      const { data } = await getTopInstructors(token, query);
      setTopInstructors(data.instructors);
    };
    const fetchTopCourses = async () => {
      const { data } = await getTopCourses(token, query);
      setPopularCourses(data.courses);
    };
    fetchTopInstrcutor();
    fetchTopCourses();
  }, [query, token]);
  return (
    <Card>
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Rapports et analyses </h1>
          <p className="text-slate-500">
            Analysez les performances de votre plateforme
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <DropDown
            value={query.timeRange}
            onValueChange={(v) => setQuery({ timeRange: v })}
          >
            <DropDown.Button label="Filtrer par" />
            <DropDown.Content>
              <DropDown.Item value="mois">ce mois</DropDown.Item>
              <DropDown.Item value="week">ce semaine</DropDown.Item>
              <DropDown.Item value="year">cette année</DropDown.Item>
            </DropDown.Content>
          </DropDown>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div>
            <h1 className="text-3xl font-bold">Cours les plus populaires</h1>
            <p className="text-slate-500">
              Basé sur le nombre d&apos;inscriptions
            </p>
          </div>
          <div className="space-y-4">
            {popularCourses.map((course, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="font-bold text-lg text-slate-400 w-6">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{course.courseName}</div>
                  <div className="text-sm text-slate-500">
                    {course.instructorName}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">{course.totalStudents}</div>
                  <div className="text-xs text-slate-500">étudiants</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div>
            <h1 className="text-3xl font-bold">
              Instructeurs les plus performants
            </h1>
            <p className="text-slate-500">Basé sur les revenus générés</p>
          </div>
          <div className="space-y-4">
            {topInstructors.map((instructor, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="font-bold text-lg text-slate-400 w-6">
                  {index + 1}
                </div>
                {/* <img
                  src={instructor?.additionalDetail.photo}
                  alt={instructor.name}
                  className="h-full w-full rounded-full object-cover"
                /> */}
                <div className="flex-1">
                  <div className="font-medium">{instructor.name}</div>
                  {/* <div className="text-sm text-slate-500">
                    {instructor.courses} cours
                  </div> */}
                </div>
                <div className="text-right">
                  <div className="font-bold">{instructor.totalRevenue}</div>
                  <div className="text-xs text-slate-500">revenus</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </Card>
  );
}
