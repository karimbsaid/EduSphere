import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { useAuth } from "../context/authContext";

// Composant pour les cartes de statistiques
const StatCard = ({ title, value, change, changeText }) => (
  <div className="bg-white p-4 rounded-lg shadow-md">
    <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
    <p className="text-3xl font-bold text-gray-900">{value}</p>
    {change !== undefined && changeText && (
      <p
        className={`text-sm ${change >= 0 ? "text-green-500" : "text-red-500"}`}
      >
        {change >= 0 ? "+" : ""}
        {change} {changeText}
      </p>
    )}
  </div>
);

// Composant pour le graphique des revenus / mois
const RevenueChart = ({ labels, data }) => {
  const chartData = labels.map((label, index) => ({
    month: label,
    revenue: data[index],
  }));

  return (
    <LineChart width={500} height={300} data={chartData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="month" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Line
        type="monotone"
        dataKey="revenue"
        stroke="#1E90FF"
        name="Revenus (TND)"
      />
    </LineChart>
  );
};

// Composant pour le graphique des étudiants / cours (instructeurs) ou revenus / cours (admins)
const CourseStatsChart = ({ isAdmin, courseStats }) => {
  if (isAdmin) {
    const chartData = courseStats.map((stat) => ({
      course: stat.courseTitle,
      revenue: stat.totalRevenue,
      students: stat.totalStudents,
    }));

    return (
      <BarChart width={500} height={300} data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="course" />
        <YAxis yAxisId="left" />
        <YAxis yAxisId="right" orientation="right" />
        <Tooltip />
        <Legend />
        <Bar
          yAxisId="left"
          dataKey="revenue"
          fill="#1E90FF"
          name="Revenus (TND)"
        />
        <Bar
          yAxisId="right"
          dataKey="students"
          fill="#32CD32"
          name="Étudiants"
        />
      </BarChart>
    );
  } else {
    const chartData = courseStats.map((stat) => ({
      course: stat.courseTitle,
      students: stat.totalStudents,
    }));

    return (
      <BarChart width={500} height={300} data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="course" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="students" fill="#32CD32" name="Étudiants" />
      </BarChart>
    );
  }
};

// Composant pour l’activité récente
const RecentActivity = ({ activities }) => (
  <div className="bg-white p-4 rounded-lg shadow-md">
    <h3 className="text-lg font-semibold text-gray-700">Activité récente</h3>
    <ul className="mt-2 space-y-2">
      {activities.map((activity, index) => (
        <li key={index} className="text-sm text-gray-600">
          {activity.message}{" "}
          <span className="text-gray-400">({activity.time})</span>
        </li>
      ))}
    </ul>
  </div>
);

// Composant pour les actions rapides (adapté selon le rôle)
const QuickActions = ({ isAdmin }) => (
  <div className="bg-white p-4 rounded-lg shadow-md">
    <h3 className="text-lg font-semibold text-gray-700">Actions rapides</h3>
    <div className="mt-2 space-x-2">
      {isAdmin ? (
        <>
          <button className="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600">
            Approuver des cours
          </button>
          <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Voir les paiements
          </button>
          <button className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
            Gérer les utilisateurs
          </button>
        </>
      ) : (
        <>
          <button className="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600">
            Créer un nouveau cours
          </button>
          <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Voir mes étudiants
          </button>
        </>
      )}
    </div>
  </div>
);

// Composant pour les filtres des graphiques
const ChartFilters = ({ onFilterChange }) => (
  <div className="mb-4">
    <label className="mr-2 text-gray-700">Période :</label>
    <select
      onChange={(e) => onFilterChange(e.target.value)}
      className="border rounded px-2 py-1"
    >
      <option value="7days">Derniers 7 jours</option>
      <option value="month">Ce mois</option>
      <option value="year">Cette année</option>
    </select>
  </div>
);

// Composant principal du tableau de bord unifié
const Dashboard = () => {
  const { user } = useAuth();
  const isAdmin = user?.role?.name === "Admin";
  const { token } = user;

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
    revenueByMonth: { labels: [], data: [] },
    revenueByCourse: [],
    studentsByCourse: [],
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [filter, setFilter] = useState("month");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `http://localhost:8080/api/v1/statistiques/stats?period=${filter}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        // console.log(response);

        if (response.data.status !== "success" || !response.data.data) {
          throw new Error(
            response.data.message || "Réponse inattendue de l’API"
          );
        }

        const { stats, charts, recentActivity } = response.data.data;
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
        setCharts(
          charts || {
            revenueByMonth: { labels: [], data: [] },
            revenueByCourse: [],
            studentsByCourse: [],
          }
        );
        setRecentActivity(recentActivity || []);
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des statistiques :",
          error.message
        );
        setRecentActivity([
          {
            message: "Erreur lors du chargement des données",
            time: new Date().toLocaleTimeString(),
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [filter, token]);

  if (loading) {
    return <div className="p-6 text-center">Chargement...</div>;
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
              changeText="cette période"
            />
            <StatCard
              title="Revenus totaux"
              value={`${stats.totalRevenue} TND`}
              change={stats.recentRevenue}
              changeText="cette période"
            />
            <StatCard
              title="Cours actifs"
              value={stats.totalCoursesActive}
              change={stats.newCourses}
              changeText="cette période"
            />
            <StatCard
              title="Inscriptions récentes"
              value={stats.totalEnrollments}
              change={stats.recentEnrollments}
              changeText="cette période"
            />
          </>
        ) : (
          <>
            <StatCard
              title="Cours créés"
              value={stats.totalCourses}
              change={stats.newCourses}
              changeText="cette période"
            />
            <StatCard
              title="Revenus générés"
              value={`${stats.totalRevenue} TND`}
              change={stats.recentRevenue}
              changeText="cette période"
            />
            <StatCard
              title="Étudiants inscrits"
              value={stats.totalStudents}
              change={stats.newStudents}
              changeText="cette période"
            />
            <StatCard title="Cours en attente" value={stats.pendingCourses} />
          </>
        )}
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <ChartFilters onFilterChange={setFilter} />
          <RevenueChart
            labels={charts.revenueByMonth.labels}
            data={charts.revenueByMonth.data}
          />
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <ChartFilters onFilterChange={setFilter} />
          <CourseStatsChart
            isAdmin={isAdmin}
            courseStats={
              isAdmin ? charts.revenueByCourse : charts.studentsByCourse
            }
          />
        </div>
      </div>

      {/* Activité récente et actions rapides */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity activities={recentActivity} />
        <QuickActions isAdmin={isAdmin} />
      </div>
    </div>
  );
};

export default Dashboard;
