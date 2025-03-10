const mongoose = require("mongoose");

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
  },
  { timestamps: true }
);

module.exports = mongoose.model("Lecture", lectureSchema);
