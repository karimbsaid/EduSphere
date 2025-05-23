const lectureController = require("../controllers/lecture.controller");
const express = require("express");
const auth = require("../middleware/auth");
const router = express.Router({ mergeParams: true });
const courseMiddleware = require("../middleware/courseMiddleware");
const Course = require("../models/course.models");
const Section = require("../models/section.models");
const Lecture = require("../models/lecture.models");
const Enrollment = require("../models/enrollment.model");
router.post(
  "/",
  auth.protect,
  auth.restrictTo("Instructor"),
  courseMiddleware.getDocumentById({
    model: Course,
    paramIdKey: "courseId",
    reqKey: "course",
  }),
  courseMiddleware.getDocumentById({
    model: Section,
    paramIdKey: "sectionId",
    reqKey: "section",
  }),
  courseMiddleware.checkOwnership,
  courseMiddleware.parseJSONFieldsMiddleware(["questions"]),
  lectureController.createLecture
);

router.patch(
  "/:lectureId",
  auth.protect,
  auth.restrictTo("Instructor"),
  courseMiddleware.getDocumentById({
    model: Course,
    paramIdKey: "courseId",
    reqKey: "course",
  }),
  courseMiddleware.getDocumentById({
    model: Section,
    paramIdKey: "sectionId",
    reqKey: "section",
  }),
  courseMiddleware.getDocumentById({
    model: Lecture,
    paramIdKey: "lectureId",
    reqKey: "lecture",
  }),
  courseMiddleware.checkOwnership,
  courseMiddleware.parseJSONFieldsMiddleware(["questions"]),
  lectureController.updateLecture
);

router.delete(
  "/:lectureId",
  auth.protect,
  auth.restrictTo("Instructor"),
  courseMiddleware.getDocumentById({
    model: Course,
    paramIdKey: "courseId",
    reqKey: "course",
  }),
  courseMiddleware.getDocumentById({
    model: Section,
    paramIdKey: "sectionId",
    reqKey: "section",
  }),
  courseMiddleware.getDocumentById({
    model: Lecture,
    paramIdKey: "lectureId",
    reqKey: "lecture",
  }),
  courseMiddleware.checkOwnership,
  courseMiddleware.checkCourseStatus(["pending"]),
  lectureController.deleteLecture
);

router.get(
  "/:lectureId",
  auth.protect,
  courseMiddleware.getDocumentById({
    model: Course,
    paramIdKey: "courseId",
    reqKey: "course",
  }),
  courseMiddleware.getDocumentById({
    model: Section,
    paramIdKey: "sectionId",
    reqKey: "section",
  }),
  courseMiddleware.getDocumentById({
    model: Lecture,
    paramIdKey: "lectureId",
    reqKey: "lecture",
  }),
  courseMiddleware.getDocumentByQuery({
    model: Enrollment,
    buildQuery: (req) => ({
      courseId: req.course._id,
      studentId: req.user._id,
      paymentStatus: "paid",
    }),
    reqKey: "enrollment",
    notFoundMessage: "Vous devez être inscrit à ce cours pour y accéder",
  }),
  lectureController.getLecture
);
module.exports = router;
