const sectionController = require("../controllers/section.controller");
const express = require("express");
const router = express.Router({ mergeParams: true });
const lectureRouter = require("./lecture.routes");
const auth = require("../middleware/auth");
const courseMiddleware = require("../middleware/courseMiddleware");
const Course = require("../models/course.models");
router.post(
  "/",
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
  sectionController.createSection
);

router.patch(
  "/:sectionId",
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
  courseMiddleware.getSection,
  sectionController.updateSection
);

router.delete(
  "/:sectionId",
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
  courseMiddleware.getSection,
  sectionController.deleteSection
);
router.use("/:sectionId/lectures", lectureRouter);

module.exports = router;
