const Review = require("../models/review.models");
const Course = require("../models/course.models");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

// Ajouter un avis sur un cours
exports.addReview = catchAsync(async (req, res, next) => {
  const { rating, comment } = req.body;
  const { courseId } = req.params;
  const { _id: studentId } = req.user;

  console.log("add review");
  const review = new Review({
    course: courseId,
    student: studentId,
    rating,
    comment,
  });
  await review.save();
  res.status(201).json({ status: "success" });
});

exports.getCourseReviews = async (req, res, next) => {
  const courseId = req.params.courseId;

  const reviews = await Review.find({ course: courseId })
    .populate({
      path: "student",
      select: " name additionalDetails",
      populate: { path: "additionalDetails", select: "-contactNumber -bio" },
    })
    .select("-course");

  res.status(200).json({ status: "success", reviews });
};
