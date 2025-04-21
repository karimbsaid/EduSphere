const Course = require("../models/course.models");
const User = require("../models/user.models");
const Enrollment = require("../models/enrollment.model");
const Paiment = require("../models/payment.models");
const catchAsync = require("../utils/catchAsync");
const moment = require("moment");

exports.getRevenueStats = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const userRole = req.user.role;
  const groupBy = req.query.groupBy || "month"; // Par défaut, on groupe par mois

  const matchFilter = { paymentStatus: "paid" };
  if (userRole === "instructor") {
    matchFilter["course.instructor"] = userId;
  }

  const revenueData = await Enrollment.aggregate([
    {
      $lookup: {
        from: "courses",
        localField: "courseId",
        foreignField: "_id",
        as: "course",
      },
    },
    { $unwind: "$course" },
    { $match: matchFilter },

    {
      $group: {
        _id:
          groupBy === "month"
            ? { month: { $month: "$enrolledAt" } }
            : { course: "$course.title" },
        revenue: { $sum: "$course.price" },
        students: { $sum: 1 },
      },
    },

    {
      $project: {
        _id: 0,
        name:
          groupBy === "month"
            ? {
                $arrayElemAt: [
                  [
                    "Jan",
                    "Fév",
                    "Mar",
                    "Avr",
                    "Mai",
                    "Juin",
                    "Juil",
                    "Août",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Déc",
                  ],
                  { $subtract: ["$_id.month", 1] },
                ],
              }
            : "$_id.course",
        revenue: 1,
        students: 1,
      },
    },
    { $sort: { name: 1 } },
  ]);

  res.status(200).json({
    status: "success",
    data: revenueData,
  });
});

exports.getCourseDistribution = catchAsync(async (req, res, next) => {
  const distribution = await Course.aggregate([
    {
      $group: {
        _id: "$category",
        count: { $sum: 1 },
      },
    },
    {
      $sort: { count: -1 },
    },
  ]);
  const formattedData = distribution.map((item) => ({
    name: item._id,
    value: item.count,
  }));
  res.json(formattedData);
});

exports.getCourseOnHold = catchAsync(async (req, res, next) => {
  // 1️⃣ Récupération des cours en "draft" avec leurs sections et lectures
  const userId = req.user._id;
  const userRole = req.user.role;
  let courseFilter = { status: "draft" };
  if (userRole === "instructor") {
    courseFilter = { instructor: userId, status: "draft" };
  }
  const courses = await Course.find(courseFilter).populate([
    {
      path: "sections",
      populate: {
        path: "lectures",
        model: "Lecture",
      },
    },
    {
      path: "instructor",
      model: "User",
    },
  ]);

  // 2️⃣ Transformation des données avec `await` pour chaque cours
  const enhancedCourses = await Promise.all(
    courses.map(async (course) => {
      const { firstSectionId, firstLectureId } =
        await course.getFirstSectionAndLecture();

      return {
        ...course.toObject(), // Conversion en objet JS
        firstSectionId,
        firstLectureId,
      };
    })
  );

  res.status(200).json({
    status: "success",
    results: enhancedCourses.length,
    data: {
      courses: enhancedCourses,
    },
  });
});

const getTopStats = async (type, timeRange) => {
  let matchStage = {};
  if (timeRange === "week") {
    matchStage = { enrolledAt: { $gte: moment().startOf("week").toDate() } };
  } else if (timeRange === "month") {
    matchStage = { enrolledAt: { $gte: moment().startOf("month").toDate() } };
  } else if (timeRange === "year") {
    matchStage = { enrolledAt: { $gte: moment().startOf("year").toDate() } };
  }

  const pipeline = [
    { $match: { paymentStatus: "paid", ...matchStage } }, // Filtrer par paiement et période

    {
      $group:
        type === "instructor"
          ? {
              _id: "$courseId",
              totalRevenue: { $sum: "$price" },
              totalStudents: { $sum: 1 },
            }
          : {
              _id: "$courseId",
              totalStudents: { $sum: 1 },
            },
    },

    {
      $lookup: {
        from: "courses",
        localField: "_id",
        foreignField: "_id",
        as: "courseDetails",
      },
    },
    { $unwind: "$courseDetails" },

    {
      $lookup: {
        from: "users",
        localField: "courseDetails.instructor",
        foreignField: "_id",
        as: "instructorDetails",
      },
    },
    { $unwind: "$instructorDetails" },

    {
      $project:
        type === "instructor"
          ? {
              _id: "$instructorDetails._id",
              name: "$instructorDetails.name",
              email: "$instructorDetails.email",
              totalRevenue: 1,
              totalStudents: 1,
            }
          : {
              _id: "$courseDetails._id",
              courseName: "$courseDetails.title",
              instructorName: "$instructorDetails.name",
              totalStudents: 1,
            },
    },

    {
      $sort:
        type === "instructor" ? { totalRevenue: -1 } : { totalStudents: -1 },
    },
    { $limit: 5 },
  ];

  return await Enrollment.aggregate(pipeline);
};

const getStartDate = (timeRange) => {
  const now = moment();
  switch (timeRange) {
    case "week":
      return now.startOf("isoWeek").toDate(); // Start of the current week (Monday)
    case "month":
      return now.startOf("month").toDate(); // Start of the current month
    case "year":
      return now.startOf("year").toDate(); // Start of the current year
    default:
      return null; // No filter (all-time stats)
  }
};

exports.getTopInstructors = catchAsync(async (req, res, next) => {
  const { timeRange } = req.query; // Expected values: "week", "month", "year"
  const startDate = getStartDate(timeRange);

  let matchStage = { paymentStatus: "paid" }; // Consider only paid enrollments

  if (startDate) {
    matchStage.enrolledAt = { $gte: startDate };
  }

  const instructors = await Enrollment.aggregate([
    { $match: matchStage }, // Filter enrollments based on date & payment status
    {
      $lookup: {
        from: "courses",
        localField: "courseId",
        foreignField: "_id",
        as: "courseDetails",
      },
    },
    { $unwind: "$courseDetails" },

    {
      $group: {
        _id: "$courseDetails.instructor",
        totalRevenue: {
          $sum: {
            $multiply: ["$courseDetails.price", "$courseDetails.totalStudent"],
          },
        },
        totalStudents: { $sum: "$courseDetails.totalStudent" },
        courseCount: { $addToSet: "$courseId" },
      },
    },
    { $set: { courseCount: { $size: "$courseCount" } } },
    { $sort: { totalRevenue: -1 } },
    { $limit: 5 },

    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "instructorDetails",
      },
    },
    { $unwind: "$instructorDetails" },
    {
      $project: {
        _id: 1,
        name: "$instructorDetails.name",
        email: "$instructorDetails.email",
        totalRevenue: 1,
        totalStudents: 1,
        courseCount: 1,
      },
    },
  ]);

  res.status(200).json({
    status: "success",
    results: instructors.length,
    data: {
      instructors,
    },
  });
});

exports.getPopularCourses = catchAsync(async (req, res, next) => {
  const courses = await Enrollment.aggregate([
    // 1️⃣ Filtrer uniquement les inscriptions payées
    { $match: { paymentStatus: "paid" } },

    // 2️⃣ Regrouper par `courseId` et compter le nombre d'inscriptions
    {
      $group: {
        _id: "$courseId",
        totalStudents: { $sum: 1 },
      },
    },

    // 3️⃣ Joindre avec `Course` pour récupérer les détails du cours
    {
      $lookup: {
        from: "courses",
        localField: "_id",
        foreignField: "_id",
        as: "courseDetails",
      },
    },
    { $unwind: "$courseDetails" },

    // 4️⃣ Joindre avec `User` pour récupérer les détails de l'instructeur
    {
      $lookup: {
        from: "users",
        localField: "courseDetails.instructor",
        foreignField: "_id",
        as: "instructorDetails",
      },
    },
    { $unwind: "$instructorDetails" },

    // 5️⃣ Sélectionner uniquement les champs nécessaires
    {
      $project: {
        _id: 0,
        courseName: "$courseDetails.title",
        instructorName: "$instructorDetails.name",
        totalStudents: 1,
      },
    },

    // 6️⃣ Trier par nombre d'étudiants décroissant (du plus populaire au moins populaire)
    { $sort: { totalStudents: -1 } },

    // 7️⃣ Limiter aux 5 cours les plus populaires
    { $limit: 5 },
  ]);

  res.status(200).json({
    status: "success",
    results: courses.length,
    data: {
      courses,
    },
  });
});

exports.getCompletionRateByCategory = catchAsync(async (req, res, next) => {
  const completionRates = await Enrollment.aggregate([
    {
      $lookup: {
        from: "courses", // Association avec Course
        localField: "courseId",
        foreignField: "_id",
        as: "course",
      },
    },
    { $unwind: "$course" }, // Décompresser le tableau course
    {
      $lookup: {
        from: "progresses", // Association avec Progress
        localField: "progress",
        foreignField: "_id",
        as: "progress",
      },
    },
    { $unwind: "$progress" }, // Décompresser le tableau progress
    {
      $group: {
        _id: "$course.category",
        totalCourses: { $sum: 1 },
        completedCourses: {
          $sum: {
            $cond: [{ $eq: ["$progress.progressPercentage", 100] }, 1, 0],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        category: "$_id",
        completionRate: {
          $multiply: [{ $divide: ["$completedCourses", "$totalCourses"] }, 100],
        },
      },
    },
    { $sort: { completionRate: -1 } }, // Trier par taux de complétion décroissant
  ]);

  res.status(200).json({
    status: "success",
    results: completionRates.length,
    data: {
      completionRates,
    },
  });
});

exports.getTotalUsers = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const userRole = req.user.role;

  let courseFilter = {};
  if (userRole === "instructor") {
    courseFilter = { instructor: userId };
  }

  let courseIds = [];
  if (userRole === "instructor") {
    const courses = await Course.find(courseFilter).select("_id");
    courseIds = courses.map((course) => course._id);
  }

  const enrollmentFilter =
    userRole === "admin" ? {} : { courseId: { $in: courseIds } };

  // Calcul du total des étudiants inscrits
  const totalUserResult = await Enrollment.aggregate([
    { $match: enrollmentFilter },
    { $group: { _id: null, count: { $sum: 1 } } },
  ]);
  const totalUser = totalUserResult.length > 0 ? totalUserResult[0].count : 0;

  // Calcul de la semaine en cours (Lundi - Dimanche)
  const today = new Date();
  const firstDayOfWeek = new Date(today);
  firstDayOfWeek.setDate(today.getDate() - today.getDay() + 1); // Lundi
  firstDayOfWeek.setHours(0, 0, 0, 0);

  const lastDayOfWeek = new Date(today);
  lastDayOfWeek.setDate(today.getDate() - today.getDay() + 7); // Dimanche
  lastDayOfWeek.setHours(23, 59, 59, 999);

  // Calcul des étudiants inscrits cette semaine
  const weeklyUserResult = await Enrollment.aggregate([
    {
      $match: {
        ...enrollmentFilter,
        enrolledAt: { $gte: firstDayOfWeek, $lte: lastDayOfWeek },
      },
    },
    { $group: { _id: null, count: { $sum: 1 } } },
  ]);
  const weeklyUser =
    weeklyUserResult.length > 0 ? weeklyUserResult[0].count : 0;

  res.status(200).json({
    status: "success",
    data: {
      totalUser,
      weeklyUser,
    },
  });
});

exports.getTotalRevenue = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const userRole = req.user.role;
  let courseFilter = {};
  if (userRole === "instructor") {
    courseFilter = { instructor: userId };
  }
  const courses = await Course.find(courseFilter).select(
    "title revenu price totalStudent"
  );
  console.log(courses);
  const totalRevenue = courses.reduce((sum, course) => sum + course.revenu, 0);
  const courseIds = courses.map((course) => course._id);
  const today = new Date();
  const firstDayOfWeek = new Date(
    today.setDate(today.getDate() - today.getDay() + 1)
  ); // Lundi
  const lastDayOfWeek = new Date(
    today.setDate(today.getDate() - today.getDay() + 7)
  ); // Dimanche

  firstDayOfWeek.setHours(0, 0, 0, 0);
  lastDayOfWeek.setHours(23, 59, 59, 999);
  const weeklyRevenue = await Paiment.aggregate([
    {
      $match: {
        paymentStatus: "paid",
        courseId: { $in: courseIds },
        updatedAt: { $gte: firstDayOfWeek, $lte: lastDayOfWeek },
      },
    },
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
      $group: {
        _id: null,
        weeklyRevenue: { $sum: "$course.price" },
      },
    },
  ]);

  res.json({
    totalRevenue,
    weeklyRevenue,
  });
});
