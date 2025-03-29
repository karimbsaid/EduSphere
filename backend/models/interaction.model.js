const mongoose = require("mongoose");

const interactionSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    interactionType: {
      type: String,
      required: true,
      enum: ["view", "search", "complete"],
    },
    feature: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Interaction", interactionSchema);
