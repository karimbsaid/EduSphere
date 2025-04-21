const mongoose = require("mongoose");
const Enrollment = require("./enrollment.model");
const Course = require("./course.models");
const Interaction = require("./interaction.model");
const progressSchema = new mongoose.Schema(
  {
    currentSection: { type: mongoose.Schema.Types.ObjectId, ref: "Section" },
    currentLecture: { type: mongoose.Schema.Types.ObjectId, ref: "Lecture" },
    completedSections: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Section" },
    ],
    completedLectures: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Lecture" },
    ],
    progressPercentage: { type: Number, default: 0 },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

progressSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

progressSchema.post("save", async function (doc) {
  if (doc.progressPercentage === 100) {
    try {
      const enrollment = await Enrollment.findOne({ progress: doc._id });
      if (!enrollment) return;

      const course = await Course.findById(enrollment.courseId);
      if (!course) return;

      const interactions = course.tags.map((tag) =>
        Interaction.create({
          student: enrollment.studentId,
          interactionType: "complete",
          feature: tag,
          weight: 5,
        })
      );

      await Promise.all(interactions);

      await Course.findByIdAndUpdate(
        enrollment.courseId,
        { $inc: { totalStudentComplete: 1 } },
        { new: true }
      );
    } catch (error) {
      console.error("Erreur lors de la mise à jour du progrès :", error);
    }
  }
});

module.exports = mongoose.model("Progress", progressSchema);
