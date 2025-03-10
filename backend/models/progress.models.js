const mongoose = require("mongoose");

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

module.exports = mongoose.model("Progress", progressSchema);
