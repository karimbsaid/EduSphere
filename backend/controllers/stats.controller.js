const mongoose = require("mongoose");
const User = require("../models/user.models");
const Course = require("../models/course.models");
const Enrollment = require("../models/enrollment.model");
const Paiment = require("../models/payment.models");

// Fonction utilitaire pour calculer les dates selon la période
const getDateRange = (period) => {
  const now = new Date();
  let startDate;

  switch (period) {
    case "7days":
      startDate = new Date(now.setDate(now.getDate() - 7));
      break;
    case "month":
      startDate = new Date(now.setMonth(now.getMonth() - 1));
      break;
    case "year":
      startDate = new Date(now.setFullYear(now.getFullYear() - 1));
      break;
    default:
      startDate = new Date(0); // Depuis le début
  }

  return { startDate, endDate: new Date() };
};

// Fonction pour récupérer le nombre d'utilisateurs (totaux et nouveaux)
const getUsersStats = async (startDate, endDate) => {
  const totalUsers = await User.countDocuments();
  const newUsers = await User.countDocuments({
    createdAt: { $gte: startDate, $lte: endDate },
  });

  return { totalUsers, newUsers };
};

// Fonction pour récupérer les revenus (totaux et récents)
const getRevenueStats = async (startDate, endDate) => {
  const totalRevenueResult = await Paiment.aggregate([
    { $match: { paymentStatus: "paid" } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  const totalRevenue =
    totalRevenueResult.length > 0 ? totalRevenueResult[0].total : 0;

  const recentRevenueResult = await Paiment.aggregate([
    {
      $match: {
        paymentStatus: "paid",
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  const recentRevenue =
    recentRevenueResult.length > 0 ? recentRevenueResult[0].total : 0;

  return { totalRevenue, recentRevenue };
};

// Fonction pour récupérer le nombre de cours actifs et nouveaux cours
const getCoursesStats = async (startDate, endDate) => {
  const totalCourses = await Course.countDocuments({ status: "published" });
  const newCourses = await Course.countDocuments({
    status: "published",
    createdAt: { $gte: startDate, $lte: endDate },
  });

  return { totalCourses, newCourses };
};

// Fonction pour récupérer le nombre d'inscriptions (totales et récentes)
const getEnrollmentsStats = async (startDate, endDate) => {
  const totalEnrollments = await Enrollment.countDocuments();
  const recentEnrollments = await Enrollment.countDocuments({
    enrolledAt: { $gte: startDate, $lte: endDate },
  });

  return { totalEnrollments, recentEnrollments };
};

// Fonction pour récupérer les revenus par mois (pour le graphique "Revenus / mois")
const getRevenueByMonth = async () => {
  const revenueByMonth = await Paiment.aggregate([
    { $match: { paymentStatus: "paid" } },
    {
      $group: {
        _id: { $month: "$createdAt" },
        total: { $sum: "$amount" },
      },
    },
    {
      $project: {
        month: "$_id",
        total: 1,
        _id: 0,
      },
    },
    { $sort: { month: 1 } },
  ]);

  const months = [
    "Jan",
    "Fév",
    "Mar",
    "Avr",
    "Mai",
    "Juin",
    "Juil",
    "Août",
    "Sept",
    "Oct",
    "Nov",
    "Déc",
  ];
  const revenueByMonthData = Array(12).fill(0);
  revenueByMonth.forEach((item) => {
    revenueByMonthData[item.month - 1] = item.total;
  });

  return { labels: months, data: revenueByMonthData };
};

// Fonction pour récupérer les données des cours (revenus et étudiants par cours)
const getCourseStats = async () => {
  const revenueByCourse = await Paiment.aggregate([
    { $match: { paymentStatus: "paid" } },
    {
      $group: {
        _id: "$courseId",
        totalRevenue: { $sum: "$amount" },
      },
    },
    {
      $lookup: {
        from: "courses",
        localField: "_id",
        foreignField: "_id",
        as: "course",
      },
    },
    { $unwind: "$course" },
    {
      $project: {
        courseTitle: "$course.title",
        totalRevenue: 1,
      },
    },
  ]);

  const studentsByCourse = await Enrollment.aggregate([
    {
      $group: {
        _id: "$courseId",
        totalStudents: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: "courses",
        localField: "_id",
        foreignField: "_id",
        as: "course",
      },
    },
    { $unwind: "$course" },
    {
      $project: {
        courseTitle: "$course.title",
        totalStudents: 1,
      },
    },
  ]);

  const courseStats = revenueByCourse.map((course) => {
    const studentData = studentsByCourse.find(
      (s) => s.courseTitle === course.courseTitle
    ) || { totalStudents: 0 };
    return {
      courseTitle: course.courseTitle,
      totalRevenue: course.totalRevenue,
      totalStudents: studentData.totalStudents,
    };
  });

  return courseStats;
};

// Fonction pour récupérer l'activité récente
const getRecentActivity = async () => {
  const recentUsers = await User.find()
    .sort({ createdAt: -1 })
    .limit(3)
    .select("name createdAt");
  const recentEnrollmentActivities = await Enrollment.find()
    .sort({ enrolledAt: -1 })
    .limit(3)
    .populate("courseId", "title")
    .select("courseId enrolledAt");
  const recentCourses = await Course.find({ status: "pending" })
    .sort({ createdAt: -1 })
    .limit(3)
    .select("title createdAt");

  const recentActivity = [
    ...recentUsers.map((user) => ({
      message: `Nouvel utilisateur inscrit : ${user.name}`,
      time: user.createdAt.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    })),
    ...recentEnrollmentActivities.map((enrollment) => ({
      message: `Inscription au cours : ${enrollment.courseId.title}`,
      time: enrollment.enrolledAt.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    })),
    ...recentCourses.map((course) => ({
      message: `Cours soumis pour approbation : ${course.title}`,
      time: course.createdAt.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    })),
  ]
    .sort((a, b) => new Date(b.time) - new Date(a.time))
    .slice(0, 5);

  return recentActivity;
};

// Contrôleur principal pour les statistiques des admins
exports.getAdminStats = async (req, res) => {
  try {
    const { period = "month" } = req.query; // Par défaut : dernier mois
    console.log(period);
    const { startDate, endDate } = getDateRange(period);

    // Récupérer toutes les statistiques et données via les fonctions
    const { totalUsers, newUsers } = await getUsersStats(startDate, endDate);
    const { totalRevenue, recentRevenue } = await getRevenueStats(
      startDate,
      endDate
    );
    const { totalCourses, newCourses } = await getCoursesStats(
      startDate,
      endDate
    );
    const { totalEnrollments, recentEnrollments } = await getEnrollmentsStats(
      startDate,
      endDate
    );
    const revenueByMonth = await getRevenueByMonth();
    const courseStats = await getCourseStats();
    const recentActivity = await getRecentActivity();

    // Réponse finale
    res.status(200).json({
      status: "success",
      data: {
        stats: {
          totalUsers,
          newUsers,
          totalRevenue,
          recentRevenue,
          totalCourses,
          newCourses,
          totalEnrollments,
          recentEnrollments,
        },
        charts: {
          revenueByMonth,
          revenueByCourse: courseStats,
        },
        recentActivity,
      },
    });
  } catch (error) {
    console.error("Erreur dans getAdminStats :", error);
    res.status(500).json({
      status: "error",
      message: "Erreur lors de la récupération des statistiques",
      error: error.message,
    });
  }
};
