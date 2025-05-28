const express = require("express");
const router = express.Router();
const Course = require("../models/course.models");
const auth = require("../middleware/auth");
const courseMiddleware = require("../middleware/courseMiddleware");
const courseController = require("../controllers/course.controller");
const resourceController = require("../controllers/resource.controller");
const recommendController = require("../controllers/recommendation.controller");
const moderationCoursController = require("../controllers/moderationCourse.controller");
const reviewRouter = require("./review.routes");
const sectionRouter = require("./section.routes");
const resourceRouter = require("./resource.routes");
const Enrollment = require("../models/enrollment.model");
// router.get("/stats", courseController.getStatistics);
router.get("/recommend", auth.protect, recommendController.recommend);

// router.get("/my-courses-stats", auth.protect, courseController.getMyCourses);
// router.get("/courses-stats", courseController.getCourseStats);
router.post(
  "/",
  auth.protect,
  auth.restrictTo("Instructor"),
  courseMiddleware.checkSlugUniqueMiddleware({
    model: Course,
    sourceField: "title",
  }),
  courseMiddleware.parseJSONFieldsMiddleware(["tags"]),
  courseController.createFullCourse
);
router.patch(
  "/:courseId",
  auth.protect,
  auth.restrictTo("Instructor"),
  courseMiddleware.getDocumentById({
    model: Course,
    paramIdKey: "courseId",
    reqKey: "course",
    select: ["+assetFolder"],
  }),
  courseMiddleware.checkOwnership,
  courseMiddleware.parseJSONFieldsMiddleware(["tags"]),
  courseController.updateCourse
);
router.delete(
  "/:courseId",
  auth.protect,
  auth.restrictTo("Instructor"),
  courseMiddleware.getDocumentById({
    model: Course,
    paramIdKey: "courseId",
    reqKey: "course",
    select: ["+assetFolder"],
  }),
  courseMiddleware.checkOwnership,
  courseMiddleware.checkCourseStatus(["pending"]),
  courseMiddleware.isCourseHasStudents,
  courseController.deleteCourse
);

// Récupérer tous les cours
router.get("", auth.optionalProtect, courseController.getAllCourses);
router.get(
  "/top-five",
  courseController.getTopPopularCourses,
  courseController.getAllCourses
);
router.get(
  "/titles",
  auth.protect,
  auth.restrictTo("Admin", "Instructor"),
  courseController.getAllCourseTitle,
  courseController.getManagedCours
);

router.get(
  "/managed-course",
  auth.protect,
  auth.restrictTo("Admin", "Instructor"),
  courseController.getManagedCours
);

// Récupérer un cours spécifique
router.get(
  "/:courseId",
  auth.optionalProtect,
  courseController.getCourseDetails
);
router.get(
  "/:courseId/programme",
  auth.protect,
  courseMiddleware.getDocumentById({
    model: Course,
    paramIdKey: "courseId",
    reqKey: "course",
    populate: [
      {
        path: "sections",
        populate: { path: "lectures" },
      },
    ],
    select: ["sections"],
  }),
  courseMiddleware.getDocumentByQuery({
    model: Enrollment,
    buildQuery: (req) => ({
      courseId: req.course._id,
      studentId: req.user._id,
    }),
    reqKey: "enrollment",
    populate: ["progress"],
    notFoundMessage: "Vous n'avez pas inscrit a ce cours ",
  }),
  courseController.getManagedCoursDetail
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
  courseMiddleware.getDocumentById({
    model: Course,
    paramIdKey: "courseId",
    reqKey: "course",
  }),
  courseMiddleware.checkIsAdminOrInstructor,
  courseController.getManagedCoursDetail
);
router.post(
  "/:courseId/create-update",
  auth.protect,
  courseController.createCourseUpdate
);
router.patch(
  "/:courseId/submit",
  auth.protect,
  courseMiddleware.getDocumentById({
    model: Course,
    paramIdKey: "courseId",
    reqKey: "course",
  }),
  courseMiddleware.checkOwnership,
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
