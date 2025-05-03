const Course = require("../models/course.models");
const Enrollment = require("../models/enrollment.model");
const Lecture = require("../models/lecture.models");
const Section = require("../models/section.models");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const cloudinary = require("../config/cloudinary");
const slugify = require("slugify");
const APIFeatures = require("../utils/apiFeatures");
const User = require("../models/user.models");
const { createInteraction } = require("../utils/interactionService");
const Resource = require("../models/resource.models");
const mongoose = require("mongoose");
const Role = require("../models/Role.model");
const {
  uploadToCloudinary,
  deleteResourceFromCloudinary,
} = require("../utils/cloudinaryService");
// Fonction pour télécharger un fichier sur Cloudinary
// const uploadToCloudinary = async (file, folder) => {
//   return await cloudinary.uploader.upload(file.tempFilePath, {
//     resource_type: "auto",
//     use_filename: true,
//     unique_filename: false,
//     filename_override: file.name,
//     folder,
//   });
// };

// const deleteResourceFromCloudinary = async (publicId, resource_type) => {
//   const result = await cloudinary.api.delete_resources([publicId], {
//     type: "upload",
//     resource_type: resource_type,
//   });
//   return result;
// };

// Fonction pour déplacer une ressource sur Cloudinary
// const moveResourceOnCloudinary = async (publicId, newFolder) => {
//   const newPublicId = `${newFolder}/${publicId.split("/").pop()}`;
//   await cloudinary.uploader.rename(publicId, newPublicId, {
//     overwrite: true,
//     invalidate: true,
//   });
//   return newPublicId;
// };

// // Fonction pour supprimer un dossier et son contenu sur Cloudinary
// const deleteFolderOnCloudinary = async (folderPath) => {
//   await cloudinary.api.delete_resources_by_prefix(folderPath);
//   await cloudinary.api.delete_folder(folderPath);
// };

// get all courses
exports.getTopPopularCourses = (req, res, next) => {
  req.query.limit = "5";
  req.query.sort = "-totalStudents"; // Ajusté pour totalStudents
  req.query.fields = "title,totalStudents,instructor"; // Ajusté
  next();
};

exports.getMyCourses = catchAsync(async (req, res) => {
  let userId;

  if (req.user) {
    userId = req.user._id;
  }

  let courseFilter = {
    $or: [
      { instructor: userId, parentCourseId: null }, // Cours originaux
      { instructor: userId, parentCourseId: { $ne: null } }, // Copies brouillon
    ],
  };

  const totalDocuments = await Course.countDocuments(courseFilter);

  const features = new APIFeatures(
    Course.find(courseFilter)
      .populate({
        path: "instructor",
        select: "name additionalDetails",
        populate: { path: "additionalDetails" },
      })
      .select("-sections -resources"),
    req.query
  )
    .filter()
    .search(["title", "description", "category", "tags"])
    .sort()
    .limitFields()
    .paginate();

  let courses = await features.query;

  res.status(200).json({
    status: "success",
    results: courses.length,
    totalDocuments,
    courses,
  });
});

exports.getAllCourses = catchAsync(async (req, res) => {
  let userId;
  if (req.user) {
    userId = req.user._id;
  }

  let totalDocuments;

  totalDocuments = await Course.countDocuments({});

  const features = new APIFeatures(
    Course.find()
      .populate({
        path: "instructor",
        select: "name additionalDetails",
        populate: { path: "additionalDetails" },
      })
      .select("-sections -resources"),
    req.query
  )
    .filter()
    .search(["title", "description", "category", "tags"])
    .sort()
    .limitFields()
    .paginate();

  let courses = await features.query;

  if (req.query.sort && req.query.sort.includes("revenu")) {
    const sortOrder = req.query.sort.startsWith("-") ? -1 : 1;
    courses = courses.sort((a, b) => (a.revenu - b.revenu) * sortOrder);
  }
  if (req.query.search && userId) {
    await createInteraction(userId, "search", req.query.search);
  }

  res.status(200).json({
    status: "success",
    results: courses.length,
    totalDocuments,
    courses,
  });
});

// get course detail
exports.getCourseDetails = catchAsync(async (req, res) => {
  const { courseId } = req.params;
  const isEditRoute = req.originalUrl.includes("/edit");

  const course = await Course.findById(courseId)
    .populate({
      path: "sections",
      populate: {
        path: "lectures",
        select: isEditRoute ? "" : "-url -questions",
      },
    })
    .populate({ path: "instructor" })
    .populate({
      path: "resources",
      select: isEditRoute ? "" : "-resourceUrl",
    });

  if (!course) {
    return next(new AppError("Cours non trouvé", 404));
  }

  if (req.user && req.user._id && course?.tags?.length > 0 && !isEditRoute) {
    await Promise.all(
      course.tags.map((tag) => createInteraction(req.user._id, "view", tag))
    );
  }

  const numberOfStudents = await Enrollment.countDocuments({ courseId });

  course.totalStudents = course.totalStudents || numberOfStudents; // Ajusté

  res.status(200).json({ status: "success", course });
});

// Création d'un cours
exports.createCourse = catchAsync(async (req, res, next) => {
  const { title, tags } = req.body;
  const slug_title = slugify(title, { lower: true, strict: true });

  if (tags && typeof tags === "string") {
    try {
      req.body.tags = JSON.parse(tags);
    } catch (error) {
      return next(new AppError("Format des tags invalide", 400));
    }
  }
  const folder = `courses/${slug_title}`;
  let imageUrl = "";
  let assetFolder = "";

  if (req.files && req.files.coverImage) {
    const image = await uploadToCloudinary(req.files.coverImage, folder);
    imageUrl = image.secure_url;
    assetFolder = image.asset_folder;
  }

  const course = await Course.create({
    ...req.body,
    imageUrl,
    assetFolder,
    instructor: req.user._id,
  });

  res.status(201).json({ status: "success", data: course });
});

exports.createCourseUpdate = catchAsync(async (req, res, next) => {
  const { courseId } = req.params;
  const user = req.user;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const originalCourse = await Course.findById(courseId)
      .populate({
        path: "sections",
        populate: { path: "lectures" },
      })
      .populate("resources")
      .session(session);
    if (!originalCourse) {
      return next(new AppError("Cours non trouvé", 404));
    }

    if (originalCourse.instructor.toString() !== user._id.toString()) {
      return next(
        new AppError("Vous n’êtes pas autorisé à modifier ce cours", 403)
      );
    }
    if (originalCourse.status !== "published") {
      return next(new AppError("Ce cours n’est pas publié", 400));
    }
    if (originalCourse.updatedVersionId) {
      return next(new AppError("Une mise à jour est déjà en cours", 400));
    }

    // Créer de nouvelles leçons pour chaque section
    const newSections = [];
    for (const originalSection of originalCourse.sections) {
      const newLectures = [];
      for (const originalLecture of originalSection.lectures) {
        const newLecture = await Lecture.create(
          [
            {
              title: originalLecture.title,
              type: originalLecture.type,
              url: originalLecture.url,
              duration: originalLecture.duration,
              questions: originalLecture.questions,
            },
          ],
          { session }
        );
        originalLecture.draftVersion = newLecture[0]._id;
        await originalLecture.save({ session });
        newLectures.push(newLecture[0]._id);
      }

      const newSection = await Section.create(
        [{ title: originalSection.title, lectures: newLectures }],
        { session }
      );
      originalSection.draftVersion = newSection[0]._id;
      await originalSection.save({ session });
      newSections.push(newSection[0]._id);
    }

    const newResources = [];
    for (const originalResource of originalCourse.resources) {
      const newResource = await Resource.create(
        [
          {
            title: originalResource.title,
            resourceUrl: originalResource.resourceUrl,
          },
        ],
        { session }
      );
      newResources.push(newResource[0]._id);
    }

    // Créer le cours brouillon
    const draftCourseData = {
      title: `${originalCourse.title} (brouillon)`,
      description: originalCourse.description,
      imageUrl: originalCourse.imageUrl,
      status: "draft",
      level: originalCourse.level,
      price: originalCourse.price,
      category: originalCourse.category,
      tags: originalCourse.tags,
      instructor: originalCourse.instructor,
      totalStudents: 0,
      totalStudentComplete: 0,
      totalDuration: originalCourse.totalDuration,
      sections: newSections,
      resources: newResources,
      assetFolder: originalCourse.assetFolder,
      parentCourseId: originalCourse._id,
      slug: `${originalCourse.slug}-draft-${Date.now()}`,
    };

    const draftCourse = await Course.create([draftCourseData], { session });
    originalCourse.updatedVersionId = draftCourse[0]._id;
    await originalCourse.save({ session });

    await session.commitTransaction();
    res.status(201).json({ status: "success", data: draftCourse[0] });
  } catch (error) {
    await session.abortTransaction();
    return next(error);
  } finally {
    session.endSession();
  }
});

// Nouvelle fonction : Soumettre un cours pour approbation

// Mise à jour d'un cours
exports.updateCourse = catchAsync(async (req, res, next) => {
  const { courseId } = req.params;
  const { title, tags, category = "Programming" } = req.body;

  const course = await Course.findById(courseId).select("+assetFolder");
  if (!course) {
    return next(new AppError("Course not found", 404));
  }
  if (course.instructor.toString() !== req.user._id.toString()) {
    return next(
      new AppError("Vous n’êtes pas autorisé à modifier ce cours", 403)
    );
  }
  if (course.status === "pending") {
    return next(
      new AppError(
        "Ce cours est en attente d’approbation et ne peut pas être modifié",
        400
      )
    );
  }

  if (tags && typeof tags === "string") {
    try {
      req.body.tags = JSON.parse(tags);
    } catch (error) {
      return next(new AppError("Format des tags invalide", 400));
    }
  }

  if (req.body.tags && !Array.isArray(req.body.tags)) {
    return next(new AppError("Les tags doivent être un tableau", 400));
  }

  if (req.files && req.files.coverImage) {
    const asset_folder = course.assetFolder;
    const decodedImageUrl = decodeURIComponent(course.imageUrl);
    const imageName = decodedImageUrl.split("/").pop().split(".")[0];
    const publicId = asset_folder + "/" + imageName;

    await deleteResourceFromCloudinary(publicId, "image");
    const image = await uploadToCloudinary(req.files.coverImage, asset_folder);
    const imageUrl = image.secure_url;

    req.body.imageUrl = imageUrl;
  }

  const updatedCourse = await Course.findByIdAndUpdate(courseId, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ status: "success", data: updatedCourse });
});

// Suppression d'un cours
exports.deleteCourse = catchAsync(async (req, res, next) => {
  const { courseId } = req.params;
  const course = await Course.findById(courseId);

  if (!course) {
    return next(new AppError("Course not found", 404));
  }
  if (course.instructor.toString() !== req.user._id.toString()) {
    return next(
      new AppError("Vous n’êtes pas autorisé à supprimer ce cours", 403)
    );
  }
  if (course.status === "pending") {
    return next(
      new AppError(
        "Ce cours est en attente d’approbation et ne peut pas être supprimé",
        400
      )
    );
  }

  const enrollmentCount = await Enrollment.countDocuments({ courseId });

  if (enrollmentCount > 0) {
    return next(
      new AppError("Cannot delete course: students are still enrolled.", 400)
    );
  }

  // Si c’est une copie brouillon, mettre à jour le cours original
  if (course.parentCourseId) {
    const originalCourse = await Course.findById(course.parentCourseId);
    if (originalCourse) {
      originalCourse.updatedVersionId = null;
      await originalCourse.save();
    }
  }

  const folder = `courses/${course.slug}`;
  // await deleteFolderOnCloudinary(folder);

  await Course.deleteCourse(courseId);

  res.status(204).json({ status: "success", message: "Course deleted" });
});

exports.getCourseStats = catchAsync(async (req, res, next) => {
  let courses;
  const user = await User.findById(req.user._id);

  if (!user) {
    return next(new AppError("Utilisateur non trouvé", 404));
  }

  if (user.role === "admin") {
    courses = await Course.find()
      .populate({
        path: "instructor",
        select: "name email",
      })
      .populate({
        path: "sections",
        select: "title lectures",
      });
  } else if (user.role === "instructor") {
    courses = await Course.find({ instructor: user._id }).populate({
      path: "sections",
      select: "title lectures",
    });
  } else {
    return next(new AppError("Vous n'avez pas accès à cette ressource", 403));
  }

  const coursesWithFirstInfo = await Promise.all(
    courses.map(async (course) => {
      const { firstSectionId, firstLectureId } =
        await course.getFirstSectionAndLecture();
      return {
        ...course.toObject(),
        firstSectionId,
        firstLectureId,
      };
    })
  );

  res.status(200).json({
    status: "success",
    results: coursesWithFirstInfo.length,
    data: {
      courses: coursesWithFirstInfo,
    },
  });
});

// Mise à jour de la fonction pour accepter ou rejeter un cours

exports.getStatistics = catchAsync(async (req, res) => {
  const totalCourses = await Course.countDocuments();

  const coursesByCategory = await Course.aggregate([
    {
      $group: {
        _id: "$category",
        totalCourses: { $sum: 1 },
      },
    },
  ]);

  // Récupérer les IDs des rôles
  const instructorRole = await Role.findOne({ name: "Instructor" });
  const studentRole = await Role.findOne({ name: "student" });

  const totalInstructors = instructorRole
    ? await User.countDocuments({ role: instructorRole._id })
    : 0;

  const totalStudents = studentRole
    ? await User.countDocuments({ role: studentRole._id })
    : 0;

  res.status(200).json({
    status: "success",
    data: {
      totalCourses,
      coursesByCategory,
      totalInstructors,
      totalStudents,
    },
  });
});

// const mergeCourseUpdates = async (draftCourseId, originalCourseId, session) => {
//   const originalCourse = await Course.findById(originalCourseId)
//     .populate({
//       path: "sections",
//       populate: { path: "lectures" },
//     })
//     .populate("resources")
//     .session(session);
//   const draftCourse = await Course.findById(draftCourseId)
//     .populate({
//       path: "sections",
//       populate: { path: "lectures" },
//     })
//     .populate("resources")
//     .session(session);

//   if (!originalCourse || !draftCourse) {
//     throw new Error("Cours original ou brouillon non trouvé");
//   }

//   // Étape 1 : Construire la nouvelle liste de sections
//   const newSections = [];

//   // Traiter les sections originales
//   for (const originalSection of originalCourse.sections) {
//     if (originalSection.draftVersion) {
//       const draftSection = draftCourse.sections.find(
//         (s) => s._id.toString() === originalSection.draftVersion.toString()
//       );
//       if (draftSection) {
//         // Scénario 1 : Mettre à jour la section
//         originalSection.title = draftSection.title;

//         // Traiter les leçons
//         const newLectures = [];
//         for (const originalLecture of originalSection.lectures) {
//           if (originalLecture.draftVersion) {
//             const draftLecture = draftSection.lectures.find(
//               (l) =>
//                 l._id.toString() === originalLecture.draftVersion.toString()
//             );
//             if (draftLecture) {
//               if (
//                 originalLecture.type === "video" &&
//                 originalLecture.url &&
//                 originalLecture.url !== draftLecture.url
//               ) {
//                 const publicId = getPublicId(originalLecture.url);
//                 await deleteResourceFromCloudinary(publicId, "video");
//               }
//               // Scénario 2 : Mettre à jour la leçon
//               originalLecture.title = draftLecture.title;
//               originalLecture.type = draftLecture.type;
//               originalLecture.url = draftLecture.url;
//               originalLecture.duration = draftLecture.duration;
//               originalLecture.questions = draftLecture.questions;
//               originalLecture.draftVersion = null;
//               await originalLecture.save({ session });
//               newLectures.push(originalLecture._id);
//               draftSection.lectures = draftSection.lectures.filter(
//                 (l) => l._id.toString() !== draftLecture._id.toString()
//               );
//               await draftSection.save({ session });
//               await Lecture.findByIdAndDelete(draftLecture._id, { session });
//             } else {
//               // Scénario 5 : Supprimer la leçon
//               await Lecture.deleteLectureWithCloudinary(
//                 originalLecture._id,
//                 session
//               );

//               // Retirer la leçon originale de originalSection.lectures
//               originalSection.lectures = originalSection.lectures.filter(
//                 (l) => l._id.toString() !== originalLecture._id.toString()
//               );
//               await originalSection.save({ session });
//             }
//           }
//         }

//         // Scénario 3 : Ajouter les nouvelles leçons
//         const newDraftLectures = draftSection.lectures.filter(
//           (l) =>
//             !originalSection.lectures.some(
//               (ol) => ol.draftVersion?.toString() === l._id.toString()
//             )
//         );
//         newLectures.push(...newDraftLectures.map((l) => l._id));

//         originalSection.lectures = newLectures;
//         originalSection.draftVersion = null;
//         await originalSection.save({ session });
//         await Section.findByIdAndDelete(draftSection._id, { session });
//         newSections.push(originalSection._id);
//       } else {
//         // Scénario 6 : Supprimer la section
//         await Section.deleteSectionWithLecture(originalSection._id, session);

//         // Retirer la section originale de originalCourse.sections
//         originalCourse.sections = originalCourse.sections.filter(
//           (s) => s._id.toString() !== originalSection._id.toString()
//         );
//         await originalCourse.save({ session });
//       }
//     }
//   }

//   // Scénario 4 : Ajouter les nouvelles sections
//   const newDraftSections = draftCourse.sections.filter(
//     (s) =>
//       !originalCourse.sections.some(
//         (os) => os.draftVersion?.toString() === s._id.toString()
//       )
//   );
//   newSections.push(...newDraftSections.map((s) => s._id));
//   const updatedResources = [];
//   for (const draftResource of draftCourse.resources) {
//     const existingResource = originalCourse.resources.find(
//       (r) => r._id.toString() === draftResource._id.toString()
//     );
//     console.log(draftResource);
//     if (existingResource) {
//       // Mettre à jour la ressource existante
//       existingResource.title = draftResource.title;
//       existingResource.resourceUrl = draftResource.resourceUrl;
//       await existingResource.save({ session });
//       updatedResources.push(existingResource._id);
//     } else {
//       // Créer une nouvelle ressource avec un nouvel _id
//       const newResource = await Resource.create(
//         [
//           {
//             title: draftResource.title,
//             resourceUrl: draftResource.resourceUrl,
//           },
//         ],
//         { session }
//       );
//       updatedResources.push(newResource[0]._id);
//     }
//     // Supprimer la ressource brouillon
//     await Resource.deleteResource(draftResource._id, session);
//   }
//   originalCourse.resources = updatedResources;

//   // Étape 2 : Mettre à jour le cours original
//   originalCourse.sections = newSections;
//   // originalCourse.title = draftCourse.title;
//   originalCourse.description = draftCourse.description;
//   originalCourse.imageUrl = draftCourse.imageUrl;
//   originalCourse.level = draftCourse.level;
//   originalCourse.price = draftCourse.price;
//   originalCourse.category = draftCourse.category;
//   originalCourse.tags = draftCourse.tags;
//   originalCourse.totalDuration = draftCourse.totalDuration;
//   originalCourse.status = "published";
//   originalCourse.updatedVersionId = null;
//   await originalCourse.save({ session });

//   // Étape 3 : Supprimer le cours brouillon
//   await Course.findByIdAndDelete(draftCourseId, { session });

//   return originalCourse;
// };
