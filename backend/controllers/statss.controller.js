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

// Fonction pour récupérer le nombre d'utilisateurs (pour admins)
const getUsersStats = async (startDate, endDate) => {
  const totalUsers = await User.countDocuments();
  const newUsers = await User.countDocuments({
    createdAt: { $gte: startDate, $lte: endDate },
  });

  return { totalUsers, newUsers };
};

// Fonction pour récupérer le nombre de cours créés et nouveaux cours
const getCoursesStats = async (instructorId, startDate, endDate) => {
  const courseMatch = instructorId ? { instructor: instructorId } : {};
  const totalCourses = await Course.countDocuments(courseMatch);
  const newCourses = await Course.countDocuments({
    ...courseMatch,
    createdAt: { $gte: startDate, $lte: endDate },
  });

  return { totalCourses, newCourses };
};

// Fonction pour récupérer les revenus (totaux et récents)
const getRevenueStats = async (instructorId, startDate, endDate) => {
  const paymentPipeline = instructorId
    ? [
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
      ]
    : [{ $match: { paymentStatus: "paid" } }];

  const totalRevenueResult = await Paiment.aggregate([
    ...paymentPipeline,
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  const totalRevenue =
    totalRevenueResult.length > 0 ? totalRevenueResult[0].total : 0;

  const recentRevenueResult = await Paiment.aggregate([
    ...paymentPipeline,
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  const recentRevenue =
    recentRevenueResult.length > 0 ? recentRevenueResult[0].total : 0;

  return { totalRevenue, recentRevenue };
};

// Fonction pour récupérer le nombre d'inscriptions ou d'étudiants
const getEnrollmentsStats = async (instructorId, startDate, endDate) => {
  const enrollmentPipeline = instructorId
    ? [
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
      ]
    : [];

  const totalEnrollmentsResult = await Enrollment.aggregate([
    ...enrollmentPipeline,
    { $group: { _id: null, total: { $sum: 1 } } },
  ]);
  const totalEnrollments =
    totalEnrollmentsResult.length > 0 ? totalEnrollmentsResult[0].total : 0;

  const recentEnrollmentsResult = await Enrollment.aggregate([
    ...enrollmentPipeline,
    {
      $match: {
        enrolledAt: { $gte: startDate, $lte: endDate },
      },
    },
    { $group: { _id: null, total: { $sum: 1 } } },
  ]);
  const recentEnrollments =
    recentEnrollmentsResult.length > 0 ? recentEnrollmentsResult[0].total : 0;

  return { totalEnrollments, recentEnrollments };
};

// Fonction pour récupérer les cours actifs (admins) ou en attente (instructeurs)
const getCoursesStatusStats = async (isAdmin, instructorId) => {
  if (isAdmin) {
    return await Course.countDocuments({ status: "published" });
  } else {
    return await Course.countDocuments({
      instructor: instructorId,
      status: "pending",
    });
  }
};

// Fonction pour récupérer les revenus par mois (pour le graphique)
const getRevenueByMonth = async (instructorId) => {
  const pipeline = instructorId
    ? [
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
      ]
    : [{ $match: { paymentStatus: "paid" } }];

  const revenueByMonth = await Paiment.aggregate([
    ...pipeline,
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

// Fonction pour récupérer les données des cours (revenus pour admins, étudiants pour instructeurs)
const getCourseStats = async (isAdmin, instructorId) => {
  if (isAdmin) {
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

    return revenueByCourse.map((course) => {
      const studentData = studentsByCourse.find(
        (s) => s.courseTitle === course.courseTitle
      ) || {
        totalStudents: 0,
      };
      return {
        courseTitle: course.courseTitle,
        totalRevenue: course.totalRevenue,
        totalStudents: studentData.totalStudents,
      };
    });
  } else {
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
  }
};

// Fonction pour récupérer l'activité récente
const getRecentActivity = async (isAdmin, instructorId) => {
  if (isAdmin) {
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

    return [
      ...recentUsers.map((user) => ({
        message: `Nouvel utilisateur inscrit : ${user.name}`,
        time: user.createdAt.toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      })),
      ...recentEnrollmentActivities.map((enrollment) => ({
        message: `Inscription au cours : ${enrollment?.courseId?.title}`,
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
  } else {
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

    return [
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
  }
};

// Contrôleur unifié pour les statistiques (admins et instructeurs)
exports.getStats = async (req, res) => {
  try {
    const { period = "month" } = req.query; // Par défaut : dernier mois
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "Utilisateur non authentifié",
      });
    }

    const isAdmin = user.role.name === "Admin";
    const instructorId = isAdmin ? null : user._id;
    const { startDate, endDate } = getDateRange(period);

    // Récupérer toutes les statistiques et données via les fonctions
    const usersStats = isAdmin
      ? await getUsersStats(startDate, endDate)
      : { totalUsers: 0, newUsers: 0 };
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
    const { totalEnrollments, recentEnrollments } = await getEnrollmentsStats(
      instructorId,
      startDate,
      endDate
    );
    const totalCoursesActiveOrPending = await getCoursesStatusStats(
      isAdmin,
      instructorId
    );
    const revenueByMonth = await getRevenueByMonth(instructorId);
    const courseStats = await getCourseStats(isAdmin, instructorId);
    const recentActivity = await getRecentActivity(isAdmin, instructorId);

    // Réponse finale
    res.status(200).json({
      status: "success",
      data: {
        stats: {
          ...(isAdmin && {
            totalUsers: usersStats.totalUsers,
            newUsers: usersStats.newUsers,
          }),
          totalCourses,
          newCourses,
          totalRevenue,
          recentRevenue,
          totalEnrollments: isAdmin ? totalEnrollments : undefined,
          recentEnrollments,
          totalStudents: isAdmin ? undefined : totalEnrollments,
          newStudents: isAdmin ? undefined : recentEnrollments,
          totalCoursesActive: isAdmin ? totalCoursesActiveOrPending : undefined,
          pendingCourses: isAdmin ? undefined : totalCoursesActiveOrPending,
        },
        charts: {
          revenueByMonth,
          ...(isAdmin
            ? { revenueByCourse: courseStats }
            : { studentsByCourse: courseStats }),
        },
        recentActivity,
      },
    });
  } catch (error) {
    console.error("Erreur dans getStats :", error);
    res.status(500).json({
      status: "error",
      message: "Erreur lors de la récupération des statistiques",
      error: error.message || "Erreur inconnue",
    });
  }
};
