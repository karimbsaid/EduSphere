const express = require("express");
const Course = require("../models/course.models");
const Enrollment = require("../models/enrollment.model");
const router = express.Router({ mergeParams: true });
const auth = require("../middleware/auth");
const enrollmentController = require("../controllers/enrollment.controller");
const courseMiddleware = require("../middleware/courseMiddleware");
router.post(
  "/:courseId/enroll",
  auth.protect,
  courseMiddleware.getDocumentById({
    Course,
    paramIdKey: "courseId",
    reqKey: "course",
    populate: [
      {
        path: "sections",
        populate: { path: "lectures" },
      },
    ],
    select: ["sections", "price"],
  }),

  enrollmentController.enroll
);
router.get(
  "/:courseId/my-progress",
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
  enrollmentController.getProgress
);

router.patch(
  "/:courseId/section/:sectionId/lecture/:lectureId/update-progress",
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
    notFoundMessage: "Vous avez deja inscrits",
  }),
  enrollmentController.updateProgress
);

module.exports = router;
