const mongoose = require("mongoose");
const {
  deleteResourceFromCloudinary,
  getPublicId,
} = require("../utils/cloudinaryService");

// Schéma des options
const optionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  isCorrect: { type: Boolean, default: false }, // Indique si l'option est correcte
});

// Schéma des questions
const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: [optionSchema], // Liste des options
});

// Schéma principal des lectures

const lectureSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    duration: { type: Number, required: true, min: 0 },
    type: {
      type: String,
      required: true,
      enum: ["text", "video", "quiz"],
    },
    content: {
      type: String,
      required: function () {
        return this.type === "text";
      },
    },
    url: {
      type: String,
      match: /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i,
      required: function () {
        return this.type === "video";
      },
    },
    questions: {
      type: [questionSchema],
      required: function () {
        return this.type === "quiz";
      },
    },
    draftVersion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lecture",
      default: null, // Référence à la version copiée (si elle existe)
    },
  },
  { timestamps: true }
);

lectureSchema.statics.deleteLectureWithCloudinary = async function (lectureId) {
  const lecture = await this.findById(lectureId);
  console.log(lectureId);
  if (lecture.type === "video" && lecture.url) {
    const publicId = getPublicId(lecture.url);
    const res = await deleteResourceFromCloudinary(publicId, "video");
  }
  await lecture.deleteOne();
  return true;
};

module.exports = mongoose.model("Lecture", lectureSchema);
