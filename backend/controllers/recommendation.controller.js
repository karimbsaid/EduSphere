const Interaction = require("../models/interaction.model");
const Course = require("../models/course.models");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.recommend = catchAsync(async (req, res, next) => {
  const userId = req.user._id;

  const interactions = await Interaction.find({ student: userId });

  const tagScores = interactions.reduce((scores, interaction) => {
    const { feature: tag, weight } = interaction;

    if (scores[tag]) {
      scores[tag] += weight;
    } else {
      scores[tag] = weight;
    }

    return scores;
  }, {});

  const popularTags = Object.keys(tagScores).sort(
    (a, b) => tagScores[b] - tagScores[a]
  );

  const recommendedCourses = await Course.find({
    tags: { $in: popularTags },
  })
    .populate("instructor", "name")
    .select(
      "title tags instructor imageUrl level price totalStudents averageRating"
    );

  recommendedCourses.sort((a, b) => {
    const scoreA = a.tags.reduce((sum, tag) => sum + (tagScores[tag] || 0), 0);
    const scoreB = b.tags.reduce((sum, tag) => sum + (tagScores[tag] || 0), 0);
    return scoreB - scoreA;
  });

  res.status(200).json({
    status: "success",
    results: recommendedCourses.length,
    courses: recommendedCourses,
  });
});
