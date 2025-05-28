const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const statistiquesController = require("../controllers/statistique.controller");

router.get(
  "/stats",
  auth.protect,
  auth.restrictTo("Admin", "Instructor"),
  statistiquesController.getStats
);

router.get(
  "/stats/recentUser",
  statistiquesController.getRecentUsers,
  statistiquesController.getRecentUserHandler
);
router.get(
  "/stats/recentEnrollement",
  auth.protect,
  auth.restrictTo("Admin", "Instructor"),
  statistiquesController.getRecentEnrollmentsForInstructor
);
router.get(
  "/stats/pendingCourses",
  auth.protect,
  auth.restrictTo("Admin", "Instructor"),
  statistiquesController.getRecentPendingCourses
);
router.get(
  "/stats/studentsByCourse",
  auth.protect,
  auth.restrictTo("Instructor"),
  statistiquesController.getStudentsByCourse
);

router.get(
  "/stats/studentsByCategory",
  // auth.protect,
  // auth.restrictTo("Admin"),
  statistiquesController.getStudentsByCategory
);
router.get(
  "/stats/coursesByCategory",
  statistiquesController.getCoursesByCategories
);
router.get(
  "/stats/revenue",
  auth.protect,
  auth.restrictTo("Admin", "Instructor"),
  statistiquesController.getRevenueByDuration
);

router.get("/global", statistiquesController.getGlobalStats);
module.exports = router;
