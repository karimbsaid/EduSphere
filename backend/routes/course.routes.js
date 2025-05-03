const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const courseController = require("../controllers/course.controller");
const resourceController = require("../controllers/resource.controller");
const recommendController = require("../controllers/recommendation.controller");
const moderationCoursController = require("../controllers/moderationCourse.controller");
const reviewRouter = require("./review.routes");
const sectionRouter = require("./section.routes");
const resourceRouter = require("./resource.routes");
router.get("/stats", courseController.getStatistics);
router.get("/recommend", auth.protect, recommendController.recommend);

// router.get("/my-courses-stats", auth.protect, courseController.getMyCourses);
router.get("/courses-stats", courseController.getCourseStats);
router.post("/", auth.protect, courseController.createCourse);
router.patch(
  "/:courseId",
  auth.protect,
  auth.checkInstructor,
  courseController.updateCourse
);
router.delete(
  "/:courseId",
  auth.protect,
  auth.checkInstructor,
  courseController.deleteCourse
);

// Récupérer tous les cours
router.get("", auth.optionalProtect, courseController.getAllCourses);
router.get(
  "/top-five",
  courseController.getTopPopularCourses,
  courseController.getAllCourses
);

// Récupérer un cours spécifique
router.get(
  "/:courseId",
  auth.optionalProtect,
  courseController.getCourseDetails
);
router.patch(
  "/:courseId/approuverejet",
  auth.protect,
  auth.restrictTo("Admin"),
  moderationCoursController.accepteRejetCours
);
router.get(
  "/:courseId/edit",
  auth.protect,
  // auth.checkInstructor,
  courseController.getCourseDetails
);
router.post(
  "/:courseId/create-update",
  auth.protect,
  courseController.createCourseUpdate
);
router.patch(
  "/:courseId/submit",
  auth.protect,
  moderationCoursController.submitCourseForApproval
);

router.post("/:courseId/resources", resourceController.addResource);
router.patch("/resources/:resourceId", resourceController.updateResource);
//nested route
// /courses/:courseId/reviews
router.use("/:courseId/reviews", reviewRouter);
// /courses/:courseId/sections
router.use("/:courseId/sections", sectionRouter);
router.use("/:courseId/resources", resourceRouter);

module.exports = router;
