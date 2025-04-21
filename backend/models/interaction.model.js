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
    weight: {
      type: Number,
      required: true,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Interaction", interactionSchema);
