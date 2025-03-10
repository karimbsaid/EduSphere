const mongoose = require("mongoose");
const slugify = require("slugify");

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, unique: true },
  description: String,
  imageUrl: String,
  status: { type: String, enum: ["draft", "published"], default: "draft" },
  level: {
    type: String,
    uppercase: true,
    enum: ["BEGINNER", "INTERMEDIATE", "AVANCE"],
    required: true,
  },
  price: Number,
  category: {
    type: String,
    uppercase: true,
    enum: ["PROGRAMMING", "DESIGN", "BUSINESS", "MARKETING"],
    required: true,
  },
  tags: [String],
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    // required: true,
  },
  sections: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

courseSchema.pre("save", function (next) {
  if (!this.slug) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

module.exports = mongoose.model("Course", courseSchema);
