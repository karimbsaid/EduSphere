const mongoose = require("mongoose");
const slugify = require("slugify");

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, unique: true },
    description: String,
    imageUrl: String,
    status: {
      type: String,
      enum: ["draft", "published", "pending"],
      default: "draft",
    },
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
    totalStudent: { type: Number, default: 0 },
    totalStudentComplete: { type: Number, default: 0 },
    resources: [{ type: mongoose.Schema.Types.ObjectId, ref: "Resource" }],
    averageRating: { type: Number, default: 4.5 },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    totalDuration: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    assetFolder: { type: String, select: false },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

courseSchema.pre("save", function (next) {
  if (!this.slug) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

courseSchema.index({
  title: "text",
  description: "text",
  category: "text",
  tags: "text",
});
courseSchema.virtual("revenu").get(function () {
  console.log(this.totalStudent);
  return this.price * this.totalStudent;
});

// courseSchema.virtual("firstSectionId").get(function () {
//   console.log(this.sections[0]);
//   return this.sections[0];
// });
// courseSchema.virtual("firstLectureId").get(function () {
//   return this.sections[0].lectures[0];
// });

courseSchema.statics.getCourseResources = async function (courseId) {
  return this.findById(courseId)
    .populate({
      path: "resources",
      select: "title resourceUrl createdAt",
    })
    .select("resources -_id")
    .lean();
};

courseSchema.methods.getFirstSectionAndLecture = async function () {
  const courseWithSections = this;
  if (courseWithSections.sections && courseWithSections.sections.length > 0) {
    return {
      firstSectionId: courseWithSections.sections[0]._id,
      firstLectureId: courseWithSections.sections[0].lectures
        ? courseWithSections.sections[0].lectures[0]._id
        : null,
    };
  }

  return { firstSectionId: null, firstLectureId: null };
};

// courseSchema.pre(/^find/, function (next) {
//   if (this.options.skipInstructor) {
//     this.select("-instructor -sections -resources");
//     return next();
//   }
//   this.populate({
//     path: "instructor",
//     select: "_id name additionalDetails",
//     populate: { path: "additionalDetails", select: "-contactNumber -bio" },
//   }).select("-sections -resources");

//   next();
// });

courseSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "course",
});

courseSchema.statics.deleteCourse = async function (courseId) {
  const course = this.findById(courseId).populate("sections");
  for (const section of course.sections) {
    await section.deleteSectionWithLecture(section._id);
  }
  await course.deleteOne();
};

module.exports = mongoose.model("Course", courseSchema);
