import React, { useEffect, useState } from "react";
import StatCard from "../features/dashboard/StatCard";
import { HiUser } from "react-icons/hi";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/Tabs";
import {
  getCourseOnHold,
  getRevenuStats,
  getTotalRevenu,
  getTotalUser,
} from "../services/apiStats";
import Chart from "../features/admin/Chart";
import { useAuth } from "../context/authContext";
import Card from "../ui/Card";
import CourseApprovalCard from "../features/admin/CourseApprouvalCard";
import { approuveRejetCour } from "../services/apiCourse";
export default function Statistique() {
  const [revenuStats, setRevenuStats] = useState([]);
  const [revenuFilterType, setRevenuFilterType] = useState("month"); // "month" par défaut
  const [totalUser, setTotalUser] = useState(0);
  const [totalRevenuStats, setTotalRevenuStats] = useState(0);
  const [coursesOnHold, setCoursesOnHold] = useState([]);
  const { user } = useAuth();
  const token = user.token;

  useEffect(() => {
    const getRevenuStatsData = async () => {
      const response = await getRevenuStats(token, {
        groupBy: revenuFilterType,
      });
      console.log(response);
      setRevenuStats(response.data);
    };
    getRevenuStatsData();
  }, [revenuFilterType, token]);

  useEffect(() => {
    const getCourseOnHoldData = async () => {
      const response = await getCourseOnHold(token);
      console.log(response);
      setCoursesOnHold(response?.data.courses);
    };
    getCourseOnHoldData();
  }, [token]);
  useEffect(() => {
    const getTotalUserStats = async () => {
      try {
        const response = await getTotalUser(token);
        setTotalUser(response.data);
      } catch (err) {
        console.log(err);
      }
    };
    getTotalUserStats();
  }, [token]);
  useEffect(() => {
    const getTotalRevenuStats = async () => {
      try {
        const response = await getTotalRevenu(token);
        setTotalRevenuStats(response);
      } catch (err) {
        console.log(err);
      }
    };
    getTotalRevenuStats();
  }, [token]);

  const confirmRejetAccept = async (courseId, message, status) => {
    const data = await approuveRejetCour(courseId, status, message, token);
    console.log(data);
    setCoursesOnHold((prevCourses) =>
      prevCourses.filter((course) => course.id !== courseId)
    );
  };

  return (
    <div>
      <div className="mt-15 ">
        <h1 className="text-3xl font-bold">Tableau de bord administrateur</h1>
        <p className="text-slate-500">
          Gérez votre plateforme d&apos;apprentissage en ligne
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2  gap-2 mb-8">
        <StatCard
          title="Utilisateurs totaux"
          Icon={HiUser}
          value={totalUser?.totalUser}
          progress={`+${totalUser?.weeklyUser} cette semaine`}
        />
        <StatCard
          title="Revenus totaux"
          Icon={HiUser}
          value={totalRevenuStats?.totalRevenue}
          progress={`+${totalRevenuStats?.weeklyRevenue || 0} cette semaine`}
        />
      </div>
      <div>
        <Tabs
          defaultValue="month"
          className="mb-8"
          onTabChange={(v) => setRevenuFilterType(v)}
        >
          <TabsList className="mb-4">
            <TabsTrigger value="month">Revenus / mois</TabsTrigger>
            <TabsTrigger value="course">Revenus / course</TabsTrigger>
          </TabsList>
          <TabsContent value="month">
            <Chart
              data={revenuStats}
              xKey="name"
              yKeys={["revenue", "students"]}
            />
          </TabsContent>
          <TabsContent value="course">
            <Chart
              type="bar"
              data={revenuStats}
              xKey="name"
              yKeys={["revenue", "students"]}
            />
          </TabsContent>
        </Tabs>
      </div>
      <div>
        <Card className="space-y-4">
          <div className="flex flex-col  justify-between p-4 border rounded-lg w-fit">
            <div className="">
              <h1 className="text-3xl font-bold">
                Cours en attente d&apos;approbation
              </h1>
              <p className="text-slate-500">Cours nécessitant une révision</p>
            </div>
            {coursesOnHold.map((course, i) => (
              <CourseApprovalCard
                key={i}
                course={course}
                onConfirm={confirmRejetAccept}
              />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
