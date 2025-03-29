const Review = require("../models/review.models");
const Course = require("../models/course.models");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

// Ajouter un avis sur un cours
exports.addReview = catchAsync(async (req, res, next) => {
  const { courseId } = req.params;
  const { rating, comment } = req.body;
  const studentId = req.user.id;

  const course = await Course.findById(courseId);
  if (!course) {
    return next(new AppError("cour n'existe pas", 404));
  }
  const existingReview = await Review.findOne({
    course: courseId,
    student: studentId,
  });
  if (existingReview) {
    return next(
      new AppError("Vous avez déjà laissé un avis sur ce cours", 400)
    );
  }

  if (!rating || rating < 1 || rating > 5 || !comment.trim()) {
    return next(new AppError("Note et commentaire valides requis", 400));
  }

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
  const { courseId } = req.params;

  const reviews = await Review.find({ course: courseId })
    .populate({
      path: "student",
      select: " name additionalDetails",
      populate: { path: "additionalDetails", select: "-contactNumber -bio" },
    })
    .select("-course")
    .sort({ createdAt: -1 })
    .lean();

  res.status(200).json({ status: "success", reviews });
};
