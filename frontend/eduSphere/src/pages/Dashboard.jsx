import { useState, useEffect } from "react";
import { useAuth } from "../context/authContext";
import StatCard from "../features/dashboard/StatCard";
import QuickActions from "../features/dashboard/QuickActions";
import ChartFilters from "../features/dashboard/ChartFilters";
import RevenueChart from "../features/dashboard/RevenueChart";
import Loading from "../components/Loading";
import {
  getCoursesByCategories,
  getRecentEnrollments,
  getRecentPendingCourse,
  getRecentUsers,
  GetRevenueByPeriod,
  getStatsForDashboard,
  getStudentsByCategory,
  getStudentsByCourses,
} from "../services/apiStats";
import { toast } from "react-hot-toast";
import {
  format,
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
  startOfWeek,
  startOfMonth,
} from "date-fns";
import fr from "date-fns/locale/fr";
import RecentTable from "../features/dashboard/Recents";
import PieChartCustom from "../features/dashboard/PieChart";
import BarChartCustom from "../features/dashboard/BarChart";
const Dashboard = () => {
  const { user } = useAuth();
  const isAdmin = user?.role?.name === "Admin";
  const { token } = user;
  const [startDateRevenu, setStartDateRevenu] = useState(null);
  const [endDateRevenu, setEndDateRevenu] = useState(new Date());

  const [stats, setStats] = useState({
    totalUsers: 0,
    newUsers: 0,
    totalCourses: 0,
    newCourses: 0,
    totalRevenue: 0,
    recentRevenue: 0,
    totalEnrollments: 0,
    recentEnrollments: 0,
    totalStudents: 0,
    newStudents: 0,
    totalCoursesActive: 0,
    pendingCourses: 0,
  });

  const [charts, setCharts] = useState({
    revenue: {
      labels: [],
      data: [],
    },
    coursesByCategories: [],
    studentsByCategory: [],
    studentsByCourses: [],
  });

  const [recentActivity, setRecentActivity] = useState({
    recenteUsers: [],
    recentEnrollments: [],
    recentPendingCourse: [],
  });
  const [filterRevenu, setFilterRevenu] = useState({
    period: "7days",
    courseId: "All",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const now = new Date();
    let startDate;

    if (filterRevenu.period === "7days") {
      startDate = new Date(now.setDate(now.getDate() - 7));
      setStartDateRevenu(startDate);
    } else if (filterRevenu.period === "month") {
      startDate = new Date(now.setMonth(now.getMonth() - 1));
      setStartDateRevenu(startDate);
    } else if (filterRevenu.period === "year") {
      startDate = new Date(now.setFullYear(now.getFullYear() - 1));
      setStartDateRevenu(startDate);
    }
  }, [filterRevenu.period]);

  useEffect(() => {
    if (startDateRevenu && endDateRevenu) {
      fetchRevenueData();
    }
  }, [startDateRevenu, endDateRevenu, filterRevenu.courseId]);

  const fetchRevenueData = async () => {
    const instructorId = !isAdmin ? user._id : "";
    const courseId =
      filterRevenu.courseId !== "All" ? filterRevenu.courseId : "";

    const response = await GetRevenueByPeriod(
      token,
      instructorId,
      courseId,
      startDateRevenu.toISOString(),
      endDateRevenu.toISOString()
    );

    const revenueData = response.data;

    // Calculer la différence en jours pour déterminer la granularité
    // (même logique que dans le backend)
    const diffInDays =
      (endDateRevenu - startDateRevenu) / (1000 * 60 * 60 * 24);

    let granularity;
    if (diffInDays <= 31) {
      granularity = "day";
    } else if (diffInDays <= 90) {
      granularity = "week";
    } else {
      granularity = "month";
    }

    let allDates = [];
    let formattedLabelFn;
    let rawKeyFn;

    if (granularity === "day") {
      // Groupement par jour
      allDates = eachDayOfInterval({
        start: startDateRevenu,
        end: endDateRevenu,
      });
      formattedLabelFn = (date) => format(date, "EEE dd/MM", { locale: fr }); // ex: "lun. 20/05"
      rawKeyFn = (date) => format(date, "yyyy-MM-dd"); // ex: "2025-05-20"
    } else if (granularity === "week") {
      allDates = eachWeekOfInterval({
        start: startDateRevenu,
        end: endDateRevenu,
      });
      formattedLabelFn = (date) => {
        const weekNumber = format(date, "w");
        const startOfWeekDate = startOfWeek(date, { weekStartsOn: 1 }); // Lundi = début de semaine
        return `Sem. ${weekNumber} (${format(startOfWeekDate, "dd/MM", {
          locale: fr,
        })})`;
      };
      rawKeyFn = (date) => {
        const startOfWeekDate = startOfWeek(date, { weekStartsOn: 1 });
        return format(startOfWeekDate, "yyyy-ww"); // ex: "2025-21"
      };
    } else {
      // Groupement par mois
      allDates = eachMonthOfInterval({
        start: startDateRevenu,
        end: endDateRevenu,
      });
      formattedLabelFn = (date) => format(date, "MMMM yyyy", { locale: fr }); // ex: "mai 2025"
      rawKeyFn = (date) => format(startOfMonth(date), "yyyy-MM"); // ex: "2025-05"
    }

    // Déduire la clé depuis le backend (devrait être "date")
    const key =
      revenueData.length > 0
        ? Object.keys(revenueData[0]).find((k) => k !== "total")
        : "date";

    // Créer une Map pour un accès rapide aux données
    const dataMap = new Map(revenueData.map((item) => [item[key], item.total]));

    const labelsFinal = [];
    const dataFinal = [];

    for (let date of allDates) {
      const label = formattedLabelFn(date);
      const rawKey = rawKeyFn(date);

      labelsFinal.push(label);
      dataFinal.push(dataMap.get(rawKey) || 0);
    }

    setCharts((prev) => ({
      ...prev,
      revenue: { labels: labelsFinal, data: dataFinal },
    }));
  };

  const handleFilterChange = (field, value) => {
    setFilterRevenu((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const responsestats = await getStatsForDashboard(token);
        if (isAdmin) {
          const recentUsersResponse = await getRecentUsers("");
          setRecentActivity((prev) => ({
            ...prev,
            recenteUsers: recentUsersResponse.data.data,
          }));
        }
        const recentEnrollementResponse = await getRecentEnrollments(token);
        setRecentActivity((prev) => ({
          ...prev,
          recentEnrollments: recentEnrollementResponse.recentEnrollments,
        }));
        const recentPendingCourseResponse = await getRecentPendingCourse(token);
        setRecentActivity((prev) => ({
          ...prev,
          recentPendingCourse: recentPendingCourseResponse.data.data,
        }));
        if (isAdmin) {
          const coursesByCategoriesResponse = await getCoursesByCategories(
            token
          );
          setCharts((prev) => ({
            ...prev,
            coursesByCategories:
              coursesByCategoriesResponse.coursesByCategories,
          }));
        }
        if (isAdmin) {
          const { studentsByCategory } = await getStudentsByCategory(token);
          setCharts((prev) => ({ ...prev, studentsByCategory }));
        }
        if (!isAdmin) {
          const { studentByCourse } = await getStudentsByCourses(token);
          setCharts((prev) => ({
            ...prev,
            studentsByCourses: studentByCourse,
          }));
        }

        const { stats } = responsestats.data;
        setStats(
          stats || {
            totalUsers: 0,
            newUsers: 0,
            totalCourses: 0,
            newCourses: 0,
            totalRevenue: 0,
            recentRevenue: 0,
            totalEnrollments: 0,
            recentEnrollments: 0,
            totalStudents: 0,
            newStudents: 0,
            totalCoursesActive: 0,
            pendingCourses: 0,
          }
        );
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        {isAdmin
          ? "Tableau de bord administrateur - Gérez votre plateforme d’apprentissage en ligne"
          : "Tableau de bord instructeur - Gérez vos cours et vos étudiants"}
      </h1>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {isAdmin ? (
          <>
            <StatCard
              title="Utilisateurs totaux"
              value={stats.totalUsers}
              change={stats.newUsers}
              changeText="ce semaine"
            />
            <StatCard
              title="Revenus totaux"
              value={stats.totalRevenue}
              change={stats.recentRevenue}
              changeText="ce semaine"
            />
            <StatCard
              title="Cours actifs"
              value={stats.totalCoursesActive}
              change={stats.newCourses}
              changeText="ce semaine"
            />
            <StatCard
              title="Inscriptions récentes"
              value={stats.totalEnrollments}
              change={stats.recentEnrollments}
              changeText="ce semaine"
            />
          </>
        ) : (
          <>
            <StatCard
              title="Cours créés"
              value={stats.totalCourses}
              change={stats.newCourses}
              changeText="ce semaine"
            />
            <StatCard
              title="Revenus générés"
              value={`${stats.totalRevenue} TND`}
              change={stats.recentRevenue}
              changeText="ce semaine"
            />
            <StatCard
              title="Étudiants inscrits"
              value={stats.totalStudents}
              change={stats.newStudents}
              changeText="ce semaine"
            />
            <StatCard title="Cours en attente" value={stats.pendingCourses} />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <ChartFilters
            onFilterChange={handleFilterChange}
            filter={filterRevenu}
            setStartDate={setStartDateRevenu}
            startDate={startDateRevenu}
            setEndDate={setEndDateRevenu}
            endDate={endDateRevenu}
          />

          <RevenueChart
            labels={charts.revenue.labels}
            data={charts.revenue.data}
          />
        </div>
        <div>
          {charts.studentsByCourses.length > 0 && (
            <BarChartCustom
              data={charts.studentsByCourses}
              title="repartion étudiants par cours "
            />
          )}
          {charts.studentsByCategory.length > 0 && (
            <BarChartCustom data={charts.studentsByCategory} />
          )}
          {charts.coursesByCategories.length > 0 && (
            <div className="bg-white p-4 rounded-lg shadow-md">
              <PieChartCustom
                data={charts.coursesByCategories}
                nameKey="_id"
                value="totalCourses"
                title="repartion de cour par categories"
              />
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {recentActivity.recenteUsers.length > 0 && (
          <RecentTable
            data={recentActivity.recenteUsers}
            labels={[
              { label: "name", value: "name" },
              { label: "date inscription", value: "createdAt" },
            ]}
            name="Recent users"
          />
        )}
        <RecentTable
          data={recentActivity.recentEnrollments}
          labels={[
            { label: "student", value: "studentName" },
            { label: "course", value: "courseTitle" },
            { label: "date inscription", value: "enrolledAt" },
          ]}
          name="Recent inscrptions"
        />
        <RecentTable
          data={recentActivity.recentPendingCourse}
          labels={[
            { label: "title", value: "title" },
            { label: "date création", value: "createdAt" },
          ]}
          name="cours en cours"
        />
        <QuickActions isAdmin={isAdmin} />
      </div>
    </div>
  );
};

export default Dashboard;
