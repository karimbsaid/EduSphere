const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const courseController = require("../controllers/course.controller");
const resourceController = require("../controllers/resource.controller");
const reviewRouter = require("./review.routes");
const sectionRouter = require("./section.routes");
const resourceRouter = require("./resource.routes");

router.get("/my-courses-stats", auth.protect, courseController.getMyCourses);

router.post("/", auth.protect, courseController.createCourse);
router.patch("/:courseId", courseController.updateCourse);
router.delete("/:courseId", courseController.deleteCourse);

// Récupérer tous les cours
router.get("", courseController.getAllCourses);

// Récupérer un cours spécifique
router.get(
  "/:courseId",
  auth.optionalProtect,
  courseController.getCourseDetails
);
router.get(
  "/:courseId/edit",
  auth.protect,
  auth.checkInstructor,
  courseController.getCourseDetails
);

router.get("/recommend", auth.protect, courseController.recommend);
router.post("/:courseId/resources", resourceController.addResource);
router.patch("/resources/:resourceId", resourceController.updateResource);
//nested route
// /courses/:courseId/reviews
router.use("/:courseId/reviews", reviewRouter);
// /courses/:courseId/sections
router.use("/:courseId/sections", sectionRouter);
router.use("/:courseId/resources", resourceRouter);

module.exports = router;
