const mongoose = require("mongoose");
const User = require("../models/user.models");
const Course = require("../models/course.models");
const Enrollment = require("../models/enrollment.model");
const Paiment = require("../models/payment.models");
const catchAsync = require("../utils/catchAsync");
const factory = require("../controllers/HandleFactory");
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
const getUsersStats = async () => {
  const now = new Date();

  const startDate = new Date(now.setDate(now.getDate() - 7));
  const endDate = new Date();
  const totalUsers = await User.countDocuments();
  const newUsers = await User.countDocuments({
    createdAt: { $gte: startDate, $lte: endDate },
  });

  return { totalUsers, newUsers };
};

// Fonction pour récupérer le nombre de cours créés et nouveaux cours
const getCoursesStats = async (instructorId) => {
  const now = new Date();

  const startDate = new Date(now.setDate(now.getDate() - 7));
  const endDate = new Date();
  const courseMatch = instructorId ? { instructor: instructorId } : {};
  const totalCourses = await Course.countDocuments(courseMatch);
  const newCourses = await Course.countDocuments({
    ...courseMatch,
    createdAt: { $gte: startDate, $lte: endDate },
  });

  return { totalCourses, newCourses };
};

const getRevenueStats = async (instructorId) => {
  const now = new Date();

  const startDate = new Date(now.setDate(now.getDate() - 7));
  const endDate = new Date();

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
const getEnrollmentsStats = async (instructorId) => {
  const now = new Date();

  const startDate = new Date(now.setDate(now.getDate() - 7));
  const endDate = new Date();
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
// exports.getRevenueByDuration = catchAsync(async (req, res, next) => {
//   const { instructorId, courseId, startDate, endDate } = req.query;

//   const match = {
//     paymentStatus: "paid",
//   };

//   if (instructorId)
//     match["course.instructor"] = new mongoose.Types.ObjectId(instructorId);
//   if (courseId) match["course._id"] = new mongoose.Types.ObjectId(courseId);

//   if (startDate || endDate) {
//     match.createdAt = {};
//     if (startDate) match.createdAt.$gte = new Date(startDate);
//     if (endDate) match.createdAt.$lte = new Date(endDate);
//   }
//   const pipeline = [
//     {
//       $lookup: {
//         from: "courses",
//         localField: "courseId",
//         foreignField: "_id",
//         as: "course",
//       },
//     },
//     { $unwind: "$course" },
//     { $match: match },
//     {
//       $group: {
//         _id: { $month: "$createdAt" },
//         total: { $sum: "$amount" },
//       },
//     },
//     {
//       $project: {
//         month: "$_id",
//         total: 1,
//         _id: 0,
//       },
//     },
//     { $sort: { month: 1 } },
//   ];

//   const revenueByDuration = await Paiment.aggregate(pipeline);

//   res.status(201).json({
//     status: "success",
//     data: revenueByDuration,
//   });
// });

exports.getRevenueByDuration = catchAsync(async (req, res, next) => {
  const { instructorId = "", courseId = "", startDate, endDate } = req.query;
  console.log(endDate);
  console.log(startDate);

  const match = {
    paymentStatus: "paid",
  };

  if (startDate || endDate) {
    match.createdAt = {};
    if (startDate) match.createdAt.$gte = new Date(startDate);
    if (endDate) match.createdAt.$lte = new Date(endDate);
  }

  const pipeline = [
    {
      $lookup: {
        from: "courses",
        localField: "courseId",
        foreignField: "_id",
        as: "course",
      },
    },
    { $unwind: "$course" },
    { $match: match },
  ];

  // Appliquer les filtres courseId et instructorId après le $lookup
  if (instructorId) {
    pipeline.push({
      $match: {
        "course.instructor": new mongoose.Types.ObjectId(instructorId),
      },
    });
  }

  if (courseId) {
    pipeline.push({
      $match: {
        "course._id": new mongoose.Types.ObjectId(courseId),
      },
    });
  }

  // Déterminer la granularité
  let groupFormat = "%Y-%m"; // Par défaut : par mois

  if (startDate && endDate) {
    const diffInDays =
      (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24);

    if (diffInDays <= 31) {
      groupFormat = "%Y-%m-%d"; // Regroupement par jour
    } else if (diffInDays <= 90) {
      groupFormat = "%Y-%U"; // Regroupement par semaine (numéro de semaine)
    } else {
      groupFormat = "%Y-%m"; // Regroupement par mois
    }
  }

  pipeline.push(
    {
      $group: {
        _id: {
          $dateToString: { format: groupFormat, date: "$createdAt" },
        },
        total: { $sum: "$amount" },
      },
    },
    {
      $project: {
        date: "$_id",
        total: 1,
        _id: 0,
      },
    },
    { $sort: { date: 1 } }
  );

  const revenueByDuration = await Paiment.aggregate(pipeline);

  res.status(200).json({
    status: "success",
    data: revenueByDuration,
  });
});

// Fonction pour récupérer les données des cours (revenus pour admins, étudiants pour instructeurs)

exports.getStudentsByCourse = catchAsync(async (req, res, next) => {
  const user = req.user;

  const pipeline = [
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
        "course.instructor": user._id,
      },
    },
    {
      $group: {
        _id: "$course._id",
        name: { $first: "$course.title" },
        value: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        name: 1, // for Recharts X-axis
        value: 1, // for Recharts Y-axis
      },
    },
  ];

  const studentByCourse = await Enrollment.aggregate(pipeline);

  res.status(200).json({
    status: "success",
    results: studentByCourse.length,
    studentByCourse,
  });
});

exports.getStudentsByCategory = catchAsync(async (req, res, next) => {
  const pipeline = [
    {
      $lookup: {
        from: "courses",
        foreignField: "_id",
        localField: "courseId",
        as: "course",
      },
    },
    { $unwind: "$course" },
    {
      $group: {
        _id: "$course.category",
        value: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        name: "$_id", // for Recharts X-axis
        value: 1, // for Recharts Y-axis
      },
    },
  ];

  const studentsByCategory = await Enrollment.aggregate(pipeline);
  res.status(200).json({ studentsByCategory });
});

exports.getCoursesByCategories = catchAsync(async (req, res, next) => {
  const pipeline = [
    {
      $group: {
        _id: "$category",
        value: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        name: "$_id",
        value: 1,
      },
    },
  ];

  const coursesByCategories = await Course.aggregate(pipeline);
  res.status(201).json({ coursesByCategories });
});

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
          _id: {
            courseId: "$courseId",
            title: "$course.title",
          },
          totalStudents: { $sum: 1 },
        },
      },
      {
        $project: {
          courseTitle: "$_id.title",
          totalStudents: 1,
          _id: 0,
        },
      },
    ]);
  }
};

exports.getRecentUsers = (req, res, next) => {
  req.query.sort = "-createdAt";
  req.query.limit = "3";
  req.query.fields = "name,createdAt";
  next();
};
exports.getRecentUserHandler = factory.getAll(User);

exports.getRecentPendingCourses = catchAsync(async (req, res, next) => {
  console.log(req.user);
  // Construire le filtre en fonction du rôle
  const filter = { status: "pending" };

  if (req.user.role.name === "Instructor") {
    filter.instructor = req.user._id;
  }

  // Requête Mongoose
  const courses = await Course.find(filter).sort({ createdAt: -1 });

  res.status(200).json({
    status: "success",
    results: courses.length,
    data: {
      data: courses,
    },
  });
});
exports.getRecentEnrollmentsForInstructor = catchAsync(
  async (req, res, next) => {
    const isAdmin = req.user.role?.name === "Admin";
    const userId = req.user._id;

    const matchStage = isAdmin
      ? {} // pas de filtre si admin
      : { "course.instructor": new mongoose.Types.ObjectId(userId) }; // filtre si instructeur

    const recentEnrollments = await Enrollment.aggregate([
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
        $lookup: {
          from: "users",
          localField: "studentId",
          foreignField: "_id",
          as: "student",
        },
      },
      { $unwind: "$student" },

      {
        $match: matchStage,
      },
      {
        $sort: { enrolledAt: -1 },
      },
      { $limit: 3 },
      {
        $project: {
          courseTitle: "$course.title",
          studentName: "$student.name",
          enrolledAt: 1,
        },
      },
    ]);

    res.status(200).json({
      status: "success",
      results: recentEnrollments.length,
      recentEnrollments,
    });
  }
);

// Fonction pour récupérer l'activité récente
// const getRecentActivity = async (isAdmin, instructorId) => {
//   if (isAdmin) {
//     const recentUsers = await User.find()
//       .sort({ createdAt: -1 })
//       .limit(3)
//       .select("name createdAt");
//     const recentEnrollmentActivities = await Enrollment.find()
//       .sort({ enrolledAt: -1 })
//       .limit(3)
//       .populate("courseId", "title")
//       .select("courseId enrolledAt");
//     const recentCourses = await Course.find({ status: "pending" })
//       .sort({ createdAt: -1 })
//       .limit(3)
//       .select("title createdAt");

//     return [
//       ...recentUsers.map((user) => ({
//         message: `Nouvel utilisateur inscrit : ${user.name}`,
//         time: user.createdAt.toLocaleTimeString("fr-FR", {
//           hour: "2-digit",
//           minute: "2-digit",
//         }),
//       })),
//       ...recentEnrollmentActivities.map((enrollment) => ({
//         message: `Inscription au cours : ${enrollment?.courseId?.title}`,
//         time: enrollment.enrolledAt.toLocaleTimeString("fr-FR", {
//           hour: "2-digit",
//           minute: "2-digit",
//         }),
//       })),
//       ...recentCourses.map((course) => ({
//         message: `Cours soumis pour approbation : ${course.title}`,
//         time: course.createdAt.toLocaleTimeString("fr-FR", {
//           hour: "2-digit",
//           minute: "2-digit",
//         }),
//       })),
//     ]
//       .sort((a, b) => new Date(b.time) - new Date(a.time))
//       .slice(0, 5);
//   } else {
//     const recentEnrollments = await Enrollment.find()
//       .populate({
//         path: "courseId",
//         match: { instructor: instructorId },
//         select: "title",
//       })
//       .sort({ enrolledAt: -1 })
//       .limit(3)
//       .select("courseId enrolledAt");

//     const recentCourses = await Course.find({
//       instructor: instructorId,
//       status: "pending",
//     })
//       .sort({ createdAt: -1 })
//       .limit(3)
//       .select("title createdAt");

//     return [
//       ...recentEnrollments
//         .filter((enrollment) => enrollment.courseId)
//         .map((enrollment) => ({
//           message: `Nouvel étudiant inscrit au cours : ${enrollment.courseId.title}`,
//           time: enrollment.enrolledAt.toLocaleTimeString("fr-FR", {
//             hour: "2-digit",
//             minute: "2-digit",
//           }),
//         })),
//       ...recentCourses.map((course) => ({
//         message: `Cours soumis pour approbation : ${course.title}`,
//         time: course.createdAt.toLocaleTimeString("fr-FR", {
//           hour: "2-digit",
//           minute: "2-digit",
//         }),
//       })),
//     ]
//       .sort((a, b) => new Date(b.time) - new Date(a.time))
//       .slice(0, 5);
//   }
// };

// Contrôleur unifié pour les statistiques (admins et instructeurs)

exports.getStats = async (req, res) => {
  try {
    const user = req.user;

    const isAdmin = user.role.name === "Admin";
    const instructorId = isAdmin ? null : user._id;

    const usersStats = isAdmin
      ? await getUsersStats()
      : { totalUsers: 0, newUsers: 0 };
    const { totalCourses, newCourses } = await getCoursesStats(instructorId);
    const { totalRevenue, recentRevenue } = await getRevenueStats(instructorId);
    const { totalEnrollments, recentEnrollments } = await getEnrollmentsStats(
      instructorId
    );
    const totalCoursesActiveOrPending = await getCoursesStatusStats(
      isAdmin,
      instructorId
    );

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

// exports.getStats = async (req, res) => {
//   try {
//     const { period = "month" } = req.query; // Par défaut : dernier mois
//     const { courseId, startDate: customStart, endDate: customEnd } = req.body;

//     const user = req.user;

//     if (!user) {
//       return res.status(401).json({
//         status: "error",
//         message: "Utilisateur non authentifié",
//       });
//     }

//     const isAdmin = user.role.name === "Admin";
//     const instructorId = isAdmin ? null : user._id;
//     let startDate, endDate;
//     if (customStart && customEnd) {
//       startDate = new Date(customStart);
//       endDate = new Date(customEnd);
//     } else {
//       ({ startDate, endDate } = getDateRange(period));
//     }
//     console.log(startDate, endDate, period);
//     // Récupérer toutes les statistiques et données via les fonctions
//     const usersStats = isAdmin
//       ? await getUsersStats(startDate, endDate)
//       : { totalUsers: 0, newUsers: 0 };
//     const { totalCourses, newCourses } = await getCoursesStats(
//       instructorId,
//       startDate,
//       endDate
//     );
//     const { totalRevenue, recentRevenue } = await getRevenueStats(
//       instructorId,
//       startDate,
//       endDate
//     );
//     const { totalEnrollments, recentEnrollments } = await getEnrollmentsStats(
//       instructorId,
//       startDate,
//       endDate
//     );
//     const totalCoursesActiveOrPending = await getCoursesStatusStats(
//       isAdmin,
//       instructorId
//     );
//     const revenueByMonth = await getRevenueByDuration(
//       instructorId,
//       courseId,
//       startDate,
//       endDate
//     );
//     const courseStats = await getCourseStats(isAdmin, instructorId);
//     const recentActivity = await getRecentActivity(isAdmin, instructorId);

//     // Réponse finale
//     res.status(200).json({
//       status: "success",
//       data: {
//         stats: {
//           ...(isAdmin && {
//             totalUsers: usersStats.totalUsers,
//             newUsers: usersStats.newUsers,
//           }),
//           totalCourses,
//           newCourses,
//           totalRevenue,
//           recentRevenue,
//           totalEnrollments: isAdmin ? totalEnrollments : undefined,
//           recentEnrollments,
//           totalStudents: isAdmin ? undefined : totalEnrollments,
//           newStudents: isAdmin ? undefined : recentEnrollments,
//           totalCoursesActive: isAdmin ? totalCoursesActiveOrPending : undefined,
//           pendingCourses: isAdmin ? undefined : totalCoursesActiveOrPending,
//         },
//         charts: {
//           revenueByMonth,
//           ...(isAdmin
//             ? { revenueByCourse: courseStats }
//             : { studentsByCourse: courseStats }),
//         },
//         recentActivity,
//       },
//     });
//   } catch (error) {
//     console.error("Erreur dans getStats :", error);
//     res.status(500).json({
//       status: "error",
//       message: "Erreur lors de la récupération des statistiques",
//       error: error.message || "Erreur inconnue",
//     });
//   }
// };

exports.getGlobalStats = catchAsync(async (req, res) => {
  const totalCourses = await Course.countDocuments();

  const coursesByCategory = await Course.aggregate([
    {
      $group: {
        _id: "$category",
        totalCourses: { $sum: 1 },
      },
    },
  ]);

  const instructorRole = await Role.findOne({ name: "Instructor" });
  const studentRole = await Role.findOne({ name: "student" });

  const totalInstructors = instructorRole
    ? await User.countDocuments({ role: instructorRole._id })
    : 0;

  const totalStudents = studentRole
    ? await User.countDocuments({ role: studentRole._id })
    : 0;

  res.status(200).json({
    status: "success",
    data: {
      totalCourses,
      coursesByCategory,
      totalInstructors,
      totalStudents,
    },
  });
});
