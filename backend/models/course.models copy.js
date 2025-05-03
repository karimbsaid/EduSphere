const mongoose = require("mongoose");
const slugify = require("slugify");
const Section = require("./section.models");
const Lecture = require("./lecture.models");

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

// Nouvelle méthode pour fusionner les modifications d'une copie brouillon dans le cours original
// courseSchema.statics.mergeCourseUpdates = async function (draftCourseId) {
//   const draftCourse = await this.findById(draftCourseId).populate("sections");
//   if (!draftCourse) {
//     throw new Error("Copie brouillon non trouvée");
//   }
//   if (!draftCourse.parentCourseId) {
//     throw new Error("Ce cours n’est pas une copie brouillon");
//   }

//   const originalCourse = await this.findById(draftCourse.parentCourseId);
//   if (!originalCourse) {
//     throw new Error("Cours original non trouvé");
//   }

//   // Fusionner les données de la copie brouillon dans le cours original
//   // originalCourse.title = draftCourse.title;
//   // originalCourse.slug = draftCourse.slug;
//   originalCourse.description = draftCourse.description;
//   originalCourse.imageUrl = draftCourse.imageUrl;
//   originalCourse.level = draftCourse.level;
//   originalCourse.price = draftCourse.price;
//   originalCourse.category = draftCourse.category;
//   originalCourse.tags = draftCourse.tags;
//   originalCourse.sections = draftCourse.sections.map((section) => section._id);
//   originalCourse.totalDuration = draftCourse.totalDuration;
//   originalCourse.updatedVersionId = null; // Réinitialiser updatedVersionId
//   await originalCourse.save();

//   // Supprimer la copie brouillon
//   await this.deleteCourse(draftCourseId);

//   return originalCourse;
// };

courseSchema.statics.mergeCourseUpdates = async function (draftCourseId) {
  const draftCourse = await this.findById(draftCourseId).populate({
    path: "sections",
    populate: { path: "lectures" },
  });
  if (!draftCourse) {
    throw new Error("Copie brouillon non trouvée");
  }
  if (!draftCourse.parentCourseId) {
    throw new Error("Ce cours n’est pas une copie brouillon");
  }

  const originalCourse = await this.findById(
    draftCourse.parentCourseId
  ).populate({
    path: "sections",
    populate: { path: "lectures" },
  });
  if (!originalCourse) {
    throw new Error("Cours original non trouvé");
  }

  // Créer des Maps pour les sections originales et leurs draftVersion
  const originalSectionsMap = new Map(
    originalCourse.sections.map((s) => [s._id.toString(), s])
  );
  const draftVersionMap = new Map(
    originalCourse.sections
      .filter((s) => s.draftVersion)
      .map((s) => [s.draftVersion.toString(), s])
  );

  // Garder une trace des sections et leçons modifiées pour le nettoyage
  const modifiedSectionIds = new Set();
  const modifiedLectureIds = new Set();

  const newSections = [];
  for (const draftSection of draftCourse.sections) {
    let originalSection = originalSectionsMap.get(draftSection._id.toString());
    if (!originalSection) {
      originalSection = draftVersionMap.get(draftSection._id.toString());
    }

    if (originalSection) {
      if (originalSection.draftVersion) {
        const draftSectionDoc = await Section.findById(
          originalSection.draftVersion
        ).populate("lectures");
        if (draftSectionDoc) {
          // Marquer cette section comme modifiée
          modifiedSectionIds.add(originalSection.draftVersion.toString());

          // Mettre à jour le titre de la section originale
          originalSection.title = draftSectionDoc.title;

          // Mettre à jour ou ajouter des leçons
          const newLectures = [];
          for (const draftLecture of draftSectionDoc.lectures) {
            const originalLecture = originalSection.lectures.find(
              (l) =>
                l._id.toString() === draftLecture._id.toString() ||
                l.draftVersion?.toString() === draftLecture._id.toString()
            );

            if (originalLecture && originalLecture.draftVersion) {
              const draftLectureDoc = await Lecture.findById(
                originalLecture.draftVersion
              );
              // Marquer cette leçon comme modifiée
              modifiedLectureIds.add(originalLecture.draftVersion.toString());

              // Mettre à jour les champs de la leçon originale
              originalLecture.title = draftLectureDoc.title;
              originalLecture.url = draftLectureDoc.url;
              originalLecture.type = draftLectureDoc.type;
              originalLecture.duration = draftLectureDoc.duration;
              originalLecture.questions = draftLectureDoc.questions;
              await originalLecture.save();
              newLectures.push(originalLecture._id);
            } else {
              // Si c'est une nouvelle leçon, l'ajouter telle quelle
              newLectures.push(draftLecture._id);
            }
          }
          originalSection.lectures = newLectures;
          await originalSection.save();
        }
      }
      newSections.push(originalSection._id);
    } else {
      // Si la section est nouvelle, l'ajouter telle quelle
      newSections.push(draftSection._id);
    }
  }

  // Mettre à jour originalCourse avec les autres attributs, sauf title et slug
  originalCourse.description = draftCourse.description;
  originalCourse.imageUrl = draftCourse.imageUrl;
  originalCourse.level = draftCourse.level;
  originalCourse.price = draftCourse.price;
  originalCourse.category = draftCourse.category;
  originalCourse.tags = draftCourse.tags;
  originalCourse.sections = newSections;
  originalCourse.totalDuration = draftCourse.totalDuration;
  originalCourse.updatedVersionId = null;

  try {
    await originalCourse.save();
  } catch (error) {
    console.error("Erreur lors de la mise à jour de originalCourse :", error);
    throw new Error(`Erreur lors de la fusion : ${error.message}`);
  }

  // Nettoyage : réinitialiser draftVersion et supprimer les copies modifiées
  for (const sectionId of newSections) {
    const sectionDoc = await Section.findById(sectionId).populate("lectures");
    if (sectionDoc.draftVersion) {
      if (modifiedSectionIds.has(sectionDoc.draftVersion.toString())) {
        // Supprimer la section copiée uniquement si elle a été modifiée
        const draftSection = await Section.findById(sectionDoc.draftVersion);
        if (draftSection) {
          // Supprimer la section brouillon sans supprimer ses leçons
          await Section.deleteOne({ _id: sectionDoc.draftVersion });
        }
      }
      sectionDoc.draftVersion = null; // Réinitialiser draftVersion
      await sectionDoc.save();
    }

    if (sectionDoc.lectures) {
      for (const lecture of sectionDoc.lectures) {
        const lectureDoc = await Lecture.findById(lecture);
        if (lectureDoc && lectureDoc.draftVersion) {
          if (modifiedLectureIds.has(lectureDoc.draftVersion.toString())) {
            // Supprimer la leçon copiée uniquement si elle a été modifiée
            await Lecture.deleteLectureWithCloudinary(lectureDoc.draftVersion);
          }
          lectureDoc.draftVersion = null; // Réinitialiser draftVersion
          await lectureDoc.save();
        }
      }
    }
  }

  // Supprimer le cours brouillon
  await this.deleteCourse(draftCourseId);

  return originalCourse;
};

// courseSchema.statics.mergeCourseUpdates = async function (draftCourseId) {
//   const draftCourse = await this.findById(draftCourseId).populate({
//     path: "sections",
//     populate: { path: "lectures" },
//   });
//   console.log(draftCourse);
//   console.log("===============================================");

//   if (!draftCourse) {
//     throw new Error("Copie brouillon non trouvée");
//   }
//   if (!draftCourse.parentCourseId) {
//     throw new Error("Ce cours n’est pas une copie brouillon");
//   }

//   const originalCourse = await this.findById(
//     draftCourse.parentCourseId
//   ).populate({
//     path: "sections",
//     populate: { path: "lectures" },
//   });
//   console.log(originalCourse);
//   console.log("===============================================");

//   if (!originalCourse) {
//     throw new Error("Cours original non trouvé");
//   }

//   // Créer des Maps pour les sections originales et leurs draftVersion
//   const originalSectionsMap = new Map(
//     originalCourse.sections.map((s) => [s._id.toString(), s])
//   );
//   console.log(originalSectionsMap);
//   console.log("===============================================");
//   const draftVersionMap = new Map(
//     originalCourse.sections
//       .filter((s) => s.draftVersion)
//       .map((s) => [s.draftVersion.toString(), s])
//   );
//   console.log(draftVersionMap);
//   console.log("===============================================");

//   // Garder une trace des sections et leçons modifiées pour le nettoyage
//   const modifiedSectionIds = new Set(); // IDs des sections copiées qui ont été modifiées
//   const modifiedLectureIds = new Set(); // IDs des leçons copiées qui ont été modifiées

//   const newSections = [];
//   for (const draftSection of draftCourse.sections) {
//     let originalSection = originalSectionsMap.get(draftSection._id.toString());

//     if (!originalSection) {
//       originalSection = draftVersionMap.get(draftSection._id.toString());
//     }
//     console.log("original section", originalSection);
//     console.log("===============================================");
//     if (originalSection) {
//       console.log("original existe");
//       if (originalSection.draftVersion) {
//         const draftSectionDoc = await Section.findById(
//           originalSection.draftVersion
//         ).populate("lectures");
//         console.log("draft sectiondoc", draftSectionDoc);
//         console.log("===============================================");
//         console.log("\n");
//         if (draftSectionDoc) {
//           // Marquer cette section comme modifiée
//           modifiedSectionIds.add(originalSection.draftVersion.toString());

//           // Mettre à jour le titre de la section originale
//           originalSection.title = draftSectionDoc.title;

//           // Mettre à jour ou ajouter des leçons
//           const newLectures = [];
//           for (const draftLecture of draftSectionDoc.lectures) {
//             const originalLecture = originalSection.lectures.find(
//               (l) =>
//                 l._id.toString() === draftLecture._id.toString() ||
//                 l.draftVersion?.toString() === draftLecture._id.toString()
//             );
//             console.log("orifinal lecture = ", originalLecture);

//             if (originalLecture && originalLecture.draftVersion) {
//               const draftLectureDoc = await Lecture.findById(
//                 originalLecture.draftVersion
//               );
//               // Marquer cette leçon comme modifiée
//               modifiedLectureIds.add(originalLecture.draftVersion.toString());

//               // Mettre à jour les champs de la leçon originale
//               originalLecture.title = draftLectureDoc.title;
//               originalLecture.url = draftLectureDoc.url;
//               originalLecture.type = draftLectureDoc.type;
//               originalLecture.duration = draftLectureDoc.duration;
//               originalLecture.questions = draftLectureDoc.questions;
//               await originalLecture.save();
//               newLectures.push(originalLecture._id); // a vérifier
//             } else {
//               // Si c'est une nouvelle leçon, l'ajouter telle quelle
//               newLectures.push(draftLecture._id);
//             }
//           }
//           originalSection.lectures = newLectures;
//           await originalSection.save();
//         }
//       }
//       newSections.push(originalSection._id);
//     } else {
//       console.log("original n'existe pas ");
//       // Si la section est nouvelle, l'ajouter telle quelle
//       newSections.push(draftSection._id);
//     }
//   }

//   // Mettre à jour originalCourse avec les autres attributs, sauf title et slug
//   originalCourse.description = draftCourse.description;
//   originalCourse.imageUrl = draftCourse.imageUrl;
//   originalCourse.level = draftCourse.level;
//   originalCourse.price = draftCourse.price;
//   originalCourse.category = draftCourse.category;
//   originalCourse.tags = draftCourse.tags;
//   originalCourse.sections = newSections;
//   originalCourse.totalDuration = draftCourse.totalDuration;
//   originalCourse.updatedVersionId = null;

//   try {
//     await originalCourse.save();
//   } catch (error) {
//     console.error("Erreur lors de la mise à jour de originalCourse :", error);
//     throw new Error(`Erreur lors de la fusion : ${error.message}`);
//   }

//   // Nettoyage : réinitialiser draftVersion et supprimer uniquement les copies modifiées
//   for (const section of originalCourse.sections) {
//     const sectionDoc = await Section.findById(section).populate("lectures");

//     if (sectionDoc.draftVersion) {
//       if (modifiedSectionIds.has(sectionDoc.draftVersion.toString())) {
//         // Supprimer la section copiée uniquement si elle a été modifiée
//         await Section.deleteSectionWithLecture(sectionDoc.draftVersion);
//       }
//       sectionDoc.draftVersion = null; // Toujours réinitialiser draftVersion
//       await sectionDoc.save();
//     }

//     for (const lecture of sectionDoc.lectures) {
//       const lectureDoc = await Lecture.findById(lecture);
//       if (lectureDoc && lectureDoc.draftVersion) {
//         if (modifiedLectureIds.has(lectureDoc.draftVersion.toString())) {
//           // Supprimer la leçon copiée uniquement si elle a été modifiée
//           await Lecture.deleteLectureWithCloudinary(lectureDoc.draftVersion);
//         }
//         lectureDoc.draftVersion = null; // Toujours réinitialiser draftVersion
//         await lectureDoc.save();
//       }
//     }
//   }

//   await this.deleteCourse(draftCourseId);

//   return originalCourse;
// };
courseSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "course",
});

module.exports = mongoose.model("Course", courseSchema);
