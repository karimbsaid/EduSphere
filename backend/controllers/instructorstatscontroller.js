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
      startDate = new Date(0);
  }

  return { startDate, endDate: new Date() };
};

// Fonction pour récupérer le nombre de cours créés et nouveaux cours
const getCoursesStats = async (instructorId, startDate, endDate) => {
  const totalCourses = await Course.countDocuments({
    instructor: instructorId,
  });
  const newCourses = await Course.countDocuments({
    instructor: instructorId,
    createdAt: { $gte: startDate, $lte: endDate },
  });

  return { totalCourses, newCourses };
};

// Fonction pour récupérer les revenus (totaux et récents)
const getRevenueStats = async (instructorId, startDate, endDate) => {
  const totalRevenueResult = await Paiment.aggregate([
    {
      $lookup: {
        from: "courses",
        localField: "courseId",
        foreignField: "_id",
        as: "course",
      },
    },
    { $unwind: "$course" },
    {
      $match: {
        "course.instructor": new mongoose.Types.ObjectId(instructorId),
        paymentStatus: "paid",
      },
    },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  const totalRevenue =
    totalRevenueResult.length > 0 ? totalRevenueResult[0].total : 0;

  const recentRevenueResult = await Paiment.aggregate([
    {
      $lookup: {
        from: "courses",
        localField: "courseId",
        foreignField: "_id",
        as: "course",
      },
    },
    { $unwind: "$course" },
    {
      $match: {
        "course.instructor": new mongoose.Types.ObjectId(instructorId),
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

// Fonction pour récupérer le nombre d'étudiants (totaux et récents)
const getStudentsStats = async (instructorId, startDate, endDate) => {
  const totalStudentsResult = await Enrollment.aggregate([
    {
      $lookup: {
        from: "courses",
        localField: "courseId",
        foreignField: "_id",
        as: "course",
      },
    },
    { $unwind: "$course" },
    {
      $match: {
        "course.instructor": new mongoose.Types.ObjectId(instructorId),
      },
    },
    { $group: { _id: null, total: { $sum: 1 } } },
  ]);
  const totalStudents =
    totalStudentsResult.length > 0 ? totalStudentsResult[0].total : 0;

  const newStudentsResult = await Enrollment.aggregate([
    {
      $lookup: {
        from: "courses",
        localField: "courseId",
        foreignField: "_id",
        as: "course",
      },
    },
    { $unwind: "$course" },
    {
      $match: {
        "course.instructor": new mongoose.Types.ObjectId(instructorId),
        enrolledAt: { $gte: startDate, $lte: endDate },
      },
    },
    { $group: { _id: null, total: { $sum: 1 } } },
  ]);
  const newStudents =
    newStudentsResult.length > 0 ? newStudentsResult[0].total : 0;

  return { totalStudents, newStudents };
};

// Fonction pour récupérer le nombre de cours en attente
const getPendingCourses = async (instructorId) => {
  return await Course.countDocuments({
    instructor: instructorId,
    status: "pending",
  });
};

// Fonction pour récupérer les revenus par mois (pour le graphique)
const getRevenueByMonth = async (instructorId) => {
  const revenueByMonth = await Paiment.aggregate([
    {
      $lookup: {
        from: "courses",
        localField: "courseId",
        foreignField: "_id",
        as: "course",
      },
    },
    { $unwind: "$course" },
    {
      $match: {
        "course.instructor": new mongoose.Types.ObjectId(instructorId),
        paymentStatus: "paid",
      },
    },
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

// Fonction pour récupérer les étudiants par cours (pour le graphique)
const getStudentsByCourse = async (instructorId) => {
  return await Enrollment.aggregate([
    {
      $lookup: {
        from: "courses",
        localField: "courseId",
        foreignField: "_id",
        as: "course",
      },
    },
    { $unwind: "$course" },
    {
      $match: {
        "course.instructor": new mongoose.Types.ObjectId(instructorId),
      },
    },
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
};

// Fonction pour récupérer l'activité récente
const getRecentActivity = async (instructorId) => {
  const recentEnrollments = await Enrollment.find()
    .populate({
      path: "courseId",
      match: { instructor: instructorId },
      select: "title",
    })
    .sort({ enrolledAt: -1 })
    .limit(3)
    .select("courseId enrolledAt");

  const recentCourses = await Course.find({
    instructor: instructorId,
    status: "pending",
  })
    .sort({ createdAt: -1 })
    .limit(3)
    .select("title createdAt");

  const recentActivity = [
    ...recentEnrollments
      .filter((enrollment) => enrollment.courseId)
      .map((enrollment) => ({
        message: `Nouvel étudiant inscrit au cours : ${enrollment.courseId.title}`,
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

// Contrôleur principal pour les statistiques des instructeurs
exports.getInstructorStats = async (req, res) => {
  try {
    const { period = "month" } = req.query; // Par défaut : dernier mois
    const instructorId = req.user?._id; // Supposons que l'ID de l'instructeur est disponible via un middleware d'authentification

    if (!instructorId) {
      return res.status(401).json({
        status: "error",
        message: "Utilisateur non authentifié",
      });
    }

    const { startDate, endDate } = getDateRange(period);

    // Récupérer toutes les statistiques et données via les fonctions
    const { totalCourses, newCourses } = await getCoursesStats(
      instructorId,
      startDate,
      endDate
    );
    const { totalRevenue, recentRevenue } = await getRevenueStats(
      instructorId,
      startDate,
      endDate
    );
    const { totalStudents, newStudents } = await getStudentsStats(
      instructorId,
      startDate,
      endDate
    );
    const pendingCourses = await getPendingCourses(instructorId);
    const revenueByMonth = await getRevenueByMonth(instructorId);
    const studentsByCourse = await getStudentsByCourse(instructorId);
    const recentActivity = await getRecentActivity(instructorId);

    // Réponse finale
    res.status(200).json({
      status: "success",
      data: {
        stats: {
          totalCourses,
          newCourses,
          totalRevenue,
          recentRevenue,
          totalStudents,
          newStudents,
          pendingCourses,
        },
        charts: {
          revenueByMonth,
          studentsByCourse,
        },
        recentActivity,
      },
    });
  } catch (error) {
    console.error("Erreur dans getInstructorStats :", error);
    res.status(500).json({
      status: "error",
      message:
        "Erreur lors de la récupération des statistiques pour l’instructeur",
      error: error.message || "Erreur inconnue",
    });
  }
};
