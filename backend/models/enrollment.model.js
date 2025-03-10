const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed"],
    default: "paid",
  },
  enrolledAt: { type: Date, default: Date.now },
  progress: { type: mongoose.Schema.Types.ObjectId, ref: "Progress" },
});

module.exports = mongoose.model("Enrollment", enrollmentSchema);
