const express = require("express");
const router = express.Router({ mergeParams: true });
const auth = require("../middleware/auth");
const reviewController = require("../controllers/review.controller");
const courseMiddleware = require("../middleware/courseMiddleware");
const Course = require("../models/course.models");
const Review = require("../models/review.models");

router.get(
  "/",
  courseMiddleware.getDocumentByQuery({
    model: Review,
    buildQuery: (req) => ({ course: req.params.courseId }),
    populate: [
      {
        path: "student",
        select: " name additionalDetails",
        populate: { path: "additionalDetails", select: "-contactNumber -bio" },
      },
    ],
    select: ["-course"],
    reqKey: "reviews",
  }),
  reviewController.getCourseReviews
);
router.post(
  "/",
  auth.protect,
  courseMiddleware.getDocumentById({ model: Course, paramIdKey: "courseId" }),
  courseMiddleware.getDocumentByQuery({
    model: Review,
    buildQuery: (req) => ({
      course: req.params.courseId,
      student: req.user._id,
    }),
  }),
  reviewController.addReview
);

module.exports = router;
