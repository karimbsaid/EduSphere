const mongoose = require("mongoose");
const slugify = require("slugify");
const Section = require("./section.models");
const Lecture = require("./lecture.models");
const {
  deleteResourceFromCloudinary,
  getPublicId,
} = require("../utils/cloudinaryService");
const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, unique: true },
    description: String,
    imageUrl: String,
    status: {
      type: String,
      enum: ["draft", "published", "pending", "rejected"], // Ajout de "rejected"
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
    totalStudents: { type: Number, default: 0 }, // Renommé de totalStudent à totalStudents
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
    parentCourseId: {
      // Nouveau champ pour indiquer si c'est une copie brouillon
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      default: null,
    },
    updatedVersionId: {
      // Nouveau champ pour indiquer une copie brouillon en cours
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      default: null,
    },
    rejectionReason: {
      // Nouveau champ pour stocker la raison du rejet
      type: String,
      default: null,
    },
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
  return this.price * this.totalStudents; // Ajusté pour totalStudents
});

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

courseSchema.statics.deleteCourse = async function (courseId) {
  const course = await this.findById(courseId).populate("sections");
  for (const section of course.sections) {
    await Section.deleteSectionWithLecture(section._id);
  }
  await course.deleteOne();
};

courseSchema.statics.mergeCourseUpdates = async function (
  draftCourseId,
  originalCourseId,
  session
) {
  const originalCourse = await this.findById(originalCourseId)
    .populate({
      path: "sections",
      populate: { path: "lectures" },
    })
    .session(session);
  const draftCourse = await this.findById(draftCourseId)
    .populate({
      path: "sections",
      populate: { path: "lectures" },
    })
    .session(session);

  if (!originalCourse || !draftCourse) {
    throw new Error("Cours original ou brouillon non trouvé");
  }

  // Étape 1 : Construire la nouvelle liste de sections
  const newSections = [];

  // Traiter les sections originales
  for (const originalSection of originalCourse.sections) {
    if (originalSection.draftVersion) {
      const draftSection = draftCourse.sections.find(
        (s) => s._id.toString() === originalSection.draftVersion.toString()
      );
      if (draftSection) {
        // Scénario 1 : Mettre à jour la section
        originalSection.title = draftSection.title;

        // Traiter les leçons
        const newLectures = [];
        for (const originalLecture of originalSection.lectures) {
          if (originalLecture.draftVersion) {
            const draftLecture = draftSection.lectures.find(
              (l) =>
                l._id.toString() === originalLecture.draftVersion.toString()
            );
            if (draftLecture) {
              if (
                originalLecture.type === "video" &&
                originalLecture.url &&
                originalLecture.url !== draftLecture.url
              ) {
                const publicId = getPublicId(originalLecture.url);
                await deleteResourceFromCloudinary(publicId, "video");
              }
              // Scénario 2 : Mettre à jour la leçon
              originalLecture.title = draftLecture.title;
              originalLecture.type = draftLecture.type;
              originalLecture.url = draftLecture.url;
              originalLecture.duration = draftLecture.duration;
              originalLecture.questions = draftLecture.questions;
              originalLecture.draftVersion = null;
              await originalLecture.save({ session });
              newLectures.push(originalLecture._id);
              draftSection.lectures = draftSection.lectures.filter(
                (l) => l._id.toString() !== draftLecture._id.toString()
              );
              await draftSection.save({ session });
              await Lecture.findByIdAndDelete(draftLecture._id, { session });
            } else {
              // Scénario 5 : Supprimer la leçon
              await Lecture.deleteLectureWithCloudinary(
                originalLecture._id,
                session
              );

              // Retirer la leçon originale de originalSection.lectures
              originalSection.lectures = originalSection.lectures.filter(
                (l) => l._id.toString() !== originalLecture._id.toString()
              );
              await originalSection.save({ session });
            }
          }
        }

        // Scénario 3 : Ajouter les nouvelles leçons
        const newDraftLectures = draftSection.lectures.filter(
          (l) =>
            !originalSection.lectures.some(
              (ol) => ol.draftVersion?.toString() === l._id.toString()
            )
        );
        newLectures.push(...newDraftLectures.map((l) => l._id));

        originalSection.lectures = newLectures;
        originalSection.draftVersion = null;
        await originalSection.save({ session });
        await Section.findByIdAndDelete(draftSection._id, { session });
        newSections.push(originalSection._id);
      } else {
        // Scénario 6 : Supprimer la section
        await Section.deleteSectionWithLecture(originalSection._id, session);

        // Retirer la section originale de originalCourse.sections
        originalCourse.sections = originalCourse.sections.filter(
          (s) => s._id.toString() !== originalSection._id.toString()
        );
        await originalCourse.save({ session });
      }
    }
  }

  // Scénario 4 : Ajouter les nouvelles sections
  const newDraftSections = draftCourse.sections.filter(
    (s) =>
      !originalCourse.sections.some(
        (os) => os.draftVersion?.toString() === s._id.toString()
      )
  );
  newSections.push(...newDraftSections.map((s) => s._id));

  // Étape 2 : Mettre à jour le cours original
  originalCourse.sections = newSections;
  // originalCourse.title = draftCourse.title;
  originalCourse.description = draftCourse.description;
  originalCourse.imageUrl = draftCourse.imageUrl;
  originalCourse.level = draftCourse.level;
  originalCourse.price = draftCourse.price;
  originalCourse.category = draftCourse.category;
  originalCourse.tags = draftCourse.tags;
  originalCourse.totalDuration = draftCourse.totalDuration;
  originalCourse.status = "published";
  originalCourse.updatedVersionId = null;
  await originalCourse.save({ session });

  // Étape 3 : Supprimer le cours brouillon
  await this.findByIdAndDelete(draftCourseId, { session });

  return originalCourse;
};

courseSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "course",
});

module.exports = mongoose.model("Course", courseSchema);
