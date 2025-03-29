const mongoose = require("mongoose");
const Course = require("./course.models");
const reviewSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

reviewSchema.index({ student: 1, course: 1 }, { unique: true });

reviewSchema.statics.calcAverageRatings = async function (courseId) {
  const stats = await this.aggregate([
    {
      $match: { course: courseId },
    },
    {
      $group: {
        _id: "$course",
        nRating: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);

  if (stats.length > 0) {
    await Course.findByIdAndUpdate(courseId, {
      ratingsQuantity: stats[0].nRating,

      averageRating: stats[0].avgRating,
    });
  }
};

reviewSchema.post("save", function () {
  this.constructor.calcAverageRatings(this.course);
});

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: "student",
    select: " name additionalDetails",
    populate: { path: "additionalDetails", select: "-contactNumber -bio" },
  });

  next();
});

module.exports = mongoose.model("Review", reviewSchema);
