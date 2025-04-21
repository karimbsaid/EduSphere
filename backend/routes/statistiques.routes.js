const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const statistiqueController = require("../controllers/statistique.controller");
router.use(auth.protect);
router.get("/revenu", statistiqueController.getRevenueStats);
router.get("/course-distribution", statistiqueController.getCourseDistribution);
router.get("/course-on-hold", statistiqueController.getCourseOnHold);
router.get("/top-5-instructor", statistiqueController.getTopInstructors);
router.get("/top-5-courses", statistiqueController.getPopularCourses);
router.get(
  "/completion-rate",
  statistiqueController.getCompletionRateByCategory
);

router.get(
  "/total-revenu",
  auth.restrictTo("admin", "instructor"),
  statistiqueController.getTotalRevenue
);
router.get(
  "/total-users",
  auth.restrictTo("admin", "instructor"),
  statistiqueController.getTotalUsers
);
module.exports = router;
