const Course = require("../models/course.models");
const Enrollment = require("../models/enrollment.model");
const Lecture = require("../models/lecture.models");
const Section = require("../models/section.models");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const cloudinary = require("../config/cloudinary");
const slugify = require("slugify");
const APIFeatures = require("../utils/apiFeatures");
const Interaction = require("../models/interaction.model");
const User = require("../models/user.models");
const { createInteraction } = require("../utils/interactionService");
const EmailService = require("../utils/emailService");

// Fonction pour télécharger un fichier sur Cloudinary
const uploadToCloudinary = async (file, folder) => {
  return await cloudinary.uploader.upload(file.tempFilePath, {
    resource_type: "auto",
    use_filename: true,
    unique_filename: false,
    filename_override: file.name,
    folder,
  });
};

const deleteResourceFromCloudinary = async (publicId, resource_type) => {
  const result = await cloudinary.api.delete_resources([publicId], {
    type: "upload",
    resource_type: resource_type,
  });
  return result;
};

// Fonction pour déplacer une ressource sur Cloudinary
const moveResourceOnCloudinary = async (publicId, newFolder) => {
  const newPublicId = `${newFolder}/${publicId.split("/").pop()}`;
  await cloudinary.uploader.rename(publicId, newPublicId, {
    overwrite: true,
    invalidate: true,
  });
  return newPublicId;
};

// Fonction pour supprimer un dossier et son contenu sur Cloudinary
const deleteFolderOnCloudinary = async (folderPath) => {
  await cloudinary.api.delete_resources_by_prefix(folderPath);
  await cloudinary.api.delete_folder(folderPath);
};

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

  // Filtrer les cours où l'utilisateur est l'instructeur
  // Inclure à la fois les cours originaux et les copies brouillon
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
  console.log("get akk cours");
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
    return res
      .status(404)
      .json({ status: "fail", message: "Cours non trouvé" });
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

// Nouvelle fonction : Créer une copie brouillon pour un cours publié
// exports.createCourseUpdate = catchAsync(async (req, res, next) => {
//   const { courseId } = req.params;
//   console.log(courseId);
//   const user = req.user;

//   const originalCourse = await Course.findById(courseId).populate("sections");
//   if (!originalCourse) {
//     return next(new AppError("Cours non trouvé", 404));
//   }
//   if (originalCourse.instructor.toString() !== user._id.toString()) {
//     return next(
//       new AppError("Vous n’êtes pas autorisé à modifier ce cours", 403)
//     );
//   }
//   if (originalCourse.status !== "published") {
//     return next(new AppError("Ce cours n’est pas publié", 400));
//   }
//   if (originalCourse.updatedVersionId) {
//     return next(new AppError("Une mise à jour est déjà en cours", 400));
//   }

//   // Créer une copie du cours avec le statut draft
//   const draftCourse = new Course({
//     ...originalCourse.toObject(),
//     title: originalCourse.title + "(brouillon)",
//     slug: originalCourse.slug + "-brouillant",
//     _id: undefined, // Générer un nouvel ID
//     status: "draft",
//     parentCourseId: originalCourse._id,
//     totalStudents: 0, // Pas d’étudiants dans la copie brouillon
//     sections: [], // Les sections seront recréées
//   });

//   // Copier les sections et les leçons
//   const sectionMap = new Map();
//   for (const section of originalCourse.sections) {
//     const newSection = new Section({
//       ...section.toObject(),
//       _id: undefined,
//       lectures: [],
//     });
//     const savedSection = await newSection.save();
//     sectionMap.set(section._id.toString(), savedSection._id);
//     for (const lectureId of section.lectures) {
//       const lecture = await Lecture.findById(lectureId);
//       if (lecture) {
//         const newLecture = new Lecture({
//           ...lecture.toObject(),
//           _id: undefined,
//         });
//         const savedLecture = await newLecture.save();
//         savedSection.lectures.push(savedLecture._id);
//       }
//     }
//     console.log(
//       "Données de draftCourse avant save :",
//       JSON.stringify(draftCourse, null, 2)
//     );
//     await savedSection.save();
//     draftCourse.sections.push(savedSection._id);
//   }

//   await draftCourse.save();
//   console.log("ok");

//   // Mettre à jour le cours original avec updatedVersionId
//   originalCourse.updatedVersionId = draftCourse._id;
//   await originalCourse.save();

//   res.status(201).json({ status: "success", data: draftCourse });
// });

exports.createCourseUpdate = catchAsync(async (req, res, next) => {
  const { courseId } = req.params;
  const user = req.user;

  const originalCourse = await Course.findById(courseId).populate("sections");
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
  if (!originalCourse.instructor) {
    return next(
      new AppError("Le cours original n’a pas d’instructeur défini", 400)
    );
  }

  const draftCourseData = {
    title: originalCourse.title + "(brouillon)",
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
    sections: originalCourse.sections.map((section) => section._id), // Référencer les mêmes sections
    assetFolder: originalCourse.assetFolder,
    parentCourseId: originalCourse._id,
  };

  const draftCourse = new Course(draftCourseData);

  draftCourse.slug = `${originalCourse.slug}-draft-${Date.now()}`;

  console.log(
    "Données de draftCourse avant save :",
    JSON.stringify(draftCourse, null, 2)
  );

  try {
    await draftCourse.save();
    console.log("draftCourse enregistré avec succès");
  } catch (error) {
    console.error("Erreur lors de l’enregistrement de draftCourse :", error);
    return next(
      new AppError(
        `Erreur lors de la création de la copie brouillon : ${error.message}`,
        500
      )
    );
  }

  originalCourse.updatedVersionId = draftCourse._id;
  await originalCourse.save();

  res.status(201).json({ status: "success", data: draftCourse });
});

// Nouvelle fonction : Soumettre un cours pour approbation
exports.submitCourseForApproval = catchAsync(async (req, res, next) => {
  const { courseId } = req.params;
  const user = req.user;

  const course = await Course.findById(courseId);
  if (!course) {
    return next(new AppError("Cours non trouvé", 404));
  }
  if (course.instructor.toString() !== user._id.toString()) {
    return next(
      new AppError("Vous n’êtes pas autorisé à soumettre ce cours", 403)
    );
  }
  if (course.status !== "draft") {
    return next(new AppError("Ce cours ne peut pas être soumis", 400));
  }

  course.status = "pending";
  await course.save();

  res.status(200).json({ status: "success", data: course });
});

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

// Création d'une section
// exports.createSection = catchAsync(async (req, res, next) => {
//   const { courseId } = req.params;
//   const { title } = req.body;

//   const course = await Course.findById(courseId).populate("sections");

//   if (!course) {
//     return next(new AppError("Course not found", 404));
//   }
//   if (course.instructor.toString() !== req.user._id.toString()) {
//     return next(
//       new AppError("Vous n’êtes pas autorisé à modifier ce cours", 403)
//     );
//   }
//   if (course.status === "pending") {
//     return next(
//       new AppError(
//         "Ce cours est en attente d’approbation et ne peut pas être modifié",
//         400
//       )
//     );
//   }

//   const section = await Section.create({ title });

//   course.sections.push(section._id);
//   await course.save();

//   res.status(201).json({ status: "success", data: section });
// });

exports.createSection = catchAsync(async (req, res, next) => {
  const { courseId } = req.params;
  const { title } = req.body;

  // Trouver le cours
  const course = await Course.findById(courseId);
  if (!course) {
    return next(new AppError("Course not found", 404));
  }

  // Vérifier les autorisations
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

  let targetCourse = course;

  // Si le cours est une version brouillon, utiliser le brouillon
  if (course.parentCourseId) {
    targetCourse = await Course.findById(course._id);
  }

  // Créer une nouvelle section
  const section = await Section.create({ title, lectures: [] });

  // Ajouter la section au cours cible
  targetCourse.sections.push(section._id);
  await targetCourse.save();

  res.status(201).json({ status: "success", data: section });
});

// Mise à jour d'une section
// exports.updateSection = catchAsync(async (req, res, next) => {
//   const { sectionId, courseId } = req.params;
//   const { title } = req.body;
//   const section = await Section.findById(sectionId);
//   const course = await Course.findById(courseId);
//   if (!section || !course) {
//     return next(new AppError("Section or Course not found", 404));
//   }
//   if (course.instructor.toString() !== req.user._id.toString()) {
//     return next(
//       new AppError("Vous n’êtes pas autorisé à modifier ce cours", 403)
//     );
//   }
//   if (course.status === "pending") {
//     return next(
//       new AppError(
//         "Ce cours est en attente d’approbation et ne peut pas être modifié",
//         400
//       )
//     );
//   }

//   section.title = title;
//   await section.save();

//   res.status(200).json({ status: "success", data: section });
// });

exports.updateSection = catchAsync(async (req, res, next) => {
  const { sectionId, courseId } = req.params;
  const { title } = req.body;

  const course = await Course.findById(courseId);
  const section = await Section.findById(sectionId);
  if (!section || !course) {
    return next(new AppError("Section or Course not found", 404));
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

  if (course.parentCourseId) {
    let draftSection = section.draftVersion
      ? await Section.findById(section.draftVersion)
      : null;

    if (!draftSection) {
      draftSection = new Section({
        title: title,
        lectures: section.lectures,
      });
      await draftSection.save();
      section.draftVersion = draftSection._id;
      await section.save();
    } else {
      draftSection.title = title;
      await draftSection.save();
    }

    const sectionIndex = course.sections.findIndex(
      (s) => s._id.toString() === sectionId
    );
    if (sectionIndex !== -1) {
      course.sections[sectionIndex] = draftSection._id;
      await course.save();
    }

    return res.status(200).json({ status: "success", data: draftSection });
  }

  section.title = title;
  await section.save();

  res.status(200).json({ status: "success", data: section });
});

// Suppression d'une section
exports.deleteSection = catchAsync(async (req, res, next) => {
  const { sectionId, courseId } = req.params;

  const section = await Section.findById(sectionId);
  const course = await Course.findById(courseId).populate("sections");

  if (!section || !course) {
    return next(new AppError("Section or Course not found", 404));
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

  await Section.deleteSectionWithLecture(sectionId);

  course.sections.pull(sectionId);
  await course.save();

  res.status(204).json({ status: "success", message: "Section deleted" });
});

// Création d'une leçon
// exports.createLecture = catchAsync(async (req, res, next) => {
//   const { courseId, sectionId } = req.params;
//   console.log(req.body.questions);
//   if (req.body.questions) {
//     try {
//       console.log(JSON.parse(req.body.questions));
//       req.body.questions = JSON.parse(req.body.questions);
//       console.log(req.body.questions);
//     } catch (error) {
//       console.log(error);
//       return res.status(400).json({
//         status: "fail",
//         message: "Format des questions invalide",
//       });
//     }
//   }

//   const { title, type, duration = 0, questions } = req.body;
//   const course = await Course.findById(courseId).populate("assetFolder");
//   const section = await Section.findById(sectionId);
//   if (!course || !section) {
//     return next(new AppError("Course or Section not found", 404));
//   }
//   if (course.instructor.toString() !== req.user._id.toString()) {
//     return next(
//       new AppError("Vous n’êtes pas autorisé à modifier ce cours", 403)
//     );
//   }
//   if (course.status === "pending") {
//     return next(
//       new AppError(
//         "Ce cours est en attente d’approbation et ne peut pas être modifié",
//         400
//       )
//     );
//   }

//   let url = "";

//   if (type === "video" && req.files && req.files.video) {
//     const folder = course.assetFolder;
//     const video = await uploadToCloudinary(req.files.video, folder);
//     url = video.secure_url;
//   }

//   const lecture = await Lecture.create({ ...req.body, url, duration });

//   section.lectures.push(lecture._id);
//   course.totalDuration = course.totalDuration + duration;
//   await section.save();
//   await course.save();

//   res.status(201).json({ status: "success", data: lecture });
// });

// exports.createLecture = catchAsync(async (req, res, next) => {
//   const { courseId, sectionId } = req.params;

//   // Parser les questions si elles sont fournies
//   if (req.body.questions) {
//     try {
//       req.body.questions = JSON.parse(req.body.questions);
//     } catch (error) {
//       return res.status(400).json({
//         status: "fail",
//         message: "Format des questions invalide",
//       });
//     }
//   }

//   const { title, type, duration = 0, questions } = req.body;

//   // Charger le cours et la section
//   const course = await Course.findById(courseId).populate("assetFolder");
//   const section = await Section.findById(sectionId).populate("lectures");
//   if (!course || !section) {
//     return next(new AppError("Course or Section not found", 404));
//   }

//   // Vérifier les autorisations
//   if (course.instructor.toString() !== req.user._id.toString()) {
//     return next(
//       new AppError("Vous n’êtes pas autorisé à modifier ce cours", 403)
//     );
//   }

//   // Vérifier le statut du cours
//   if (course.status === "pending") {
//     return next(
//       new AppError(
//         "Ce cours est en attente d’approbation et ne peut pas être modifié",
//         400
//       )
//     );
//   }

//   let url = "";

//   // Gérer l'upload de la vidéo si fourni
//   if (type === "video" && req.files && req.files.video) {
//     const folder = course.assetFolder;
//     const video = await uploadToCloudinary(req.files.video, folder);
//     url = video.secure_url;
//   }

//   let lecture;
//   console.log(course);
//   console.log(course.parentCourseId);
//   if (course.parentCourseId) {
//     // Cas d'un cours brouillon
//     let draftSection = section.draftVersion
//       ? await Section.findById(section.draftVersion).populate("lectures")
//       : null;
//     console.log(draftSection);

//     if (!draftSection) {
//       console.log("creer un nouveau section draft");
//       // Créer une nouvelle section brouillon avec le contenu de la section originale
//       draftSection = new Section({
//         title: section.title,
//         lectures: section.lectures, // Copier les leçons existantes
//       });
//       await draftSection.save();

//       // Assigner l'ID de la section brouillon à section.draftVersion
//       section.draftVersion = draftSection._id;
//       await section.save();

//       // Remplacer la section originale par la section brouillon dans le cours
//       const sectionIndex = course.sections.findIndex(
//         (s) => s._id.toString() === sectionId
//       );
//       if (sectionIndex !== -1) {
//         course.sections[sectionIndex] = draftSection._id;
//         await course.save();
//       } else {
//         return next(new AppError("Section non trouvée dans le cours", 404));
//       }
//     }

//     // Créer la nouvelle leçon brouillon
//     const draftLecture = await Lecture.create({
//       title,
//       type,
//       url,
//       duration,
//       questions,
//     });

//     // Ajouter la nouvelle leçon à la section brouillon
//     draftSection.lectures.push(draftLecture._id);
//     await draftSection.save();

//     lecture = draftLecture;
//   } else {
//     lecture = await Lecture.create({ title, type, url, duration, questions });
//     section.lectures.push(lecture._id);
//     course.totalDuration = course.totalDuration + duration;
//     await section.save();
//     await course.save();
//   }

//   res.status(201).json({ status: "success", data: lecture });
// });

exports.createLecture = catchAsync(async (req, res, next) => {
  const { courseId, sectionId } = req.params;

  // Parser les questions si elles sont fournies
  if (req.body.questions) {
    try {
      req.body.questions = JSON.parse(req.body.questions);
    } catch (error) {
      return res.status(400).json({
        status: "fail",
        message: "Format des questions invalide",
      });
    }
  }

  const { title, type, duration = 0, questions } = req.body;

  // Charger le cours et la section
  const course = await Course.findById(courseId).populate("assetFolder");
  const section = await Section.findById(sectionId).populate("lectures");
  if (!course || !section) {
    return next(new AppError("Course or Section not found", 404));
  }

  // Vérifier les autorisations
  if (course.instructor.toString() !== req.user._id.toString()) {
    return next(
      new AppError("Vous n’êtes pas autorisé à modifier ce cours", 403)
    );
  }

  // Vérifier le statut du cours
  if (course.status === "pending") {
    return next(
      new AppError(
        "Ce cours est en attente d’approbation et ne peut pas être modifié",
        400
      )
    );
  }

  let url = "";

  // Gérer l'upload de la vidéo si fourni
  if (type === "video" && req.files && req.files.video) {
    const folder = course.assetFolder;
    const video = await uploadToCloudinary(req.files.video, folder);
    url = video.secure_url;
  }

  let lecture;
  if (course.parentCourseId) {
    // Cas d'un cours brouillon
    let draftSection = section.draftVersion
      ? await Section.findById(section.draftVersion).populate("lectures")
      : null;

    if (!draftSection) {
      console.log("Créer une nouvelle section brouillon");
      // Créer des copies brouillon des leçons originales
      const draftLectures = [];
      for (const originalLecture of section.lectures) {
        const draftLecture = new Lecture({
          title: originalLecture.title,
          type: originalLecture.type,
          url: originalLecture.url,
          duration: originalLecture.duration,
          questions: originalLecture.questions,
        });
        await draftLecture.save();
        // Lier la leçon originale à sa copie brouillon
        originalLecture.draftVersion = draftLecture._id;
        await originalLecture.save();
        draftLectures.push(draftLecture._id);
      }

      // Créer une nouvelle section brouillon avec les copies des leçons
      draftSection = new Section({
        title: section.title,
        lectures: draftLectures, // Référencer les copies brouillon
      });
      await draftSection.save();

      // Assigner l'ID de la section brouillon à section.draftVersion
      section.draftVersion = draftSection._id;
      await section.save();

      // Remplacer la section originale par la section brouillon dans le cours
      const sectionIndex = course.sections.findIndex(
        (s) => s._id.toString() === sectionId
      );
      if (sectionIndex === -1) {
        return next(new AppError("Section non trouvée dans le cours", 404));
      }
      course.sections[sectionIndex] = draftSection._id;
      await course.save();
    }

    // Créer la nouvelle leçon brouillon
    const draftLecture = await Lecture.create({
      title,
      type,
      url,
      duration,
      questions,
    });

    // Ajouter la nouvelle leçon à la section brouillon
    draftSection.lectures.push(draftLecture._id);
    await draftSection.save();

    // Mettre à jour la durée totale du cours brouillon
    course.totalDuration = (course.totalDuration || 0) + duration;
    await course.save();

    lecture = draftLecture;
  } else {
    // Cas normal : création directe dans le cours original
    lecture = await Lecture.create({ title, type, url, duration, questions });
    section.lectures.push(lecture._id);
    course.totalDuration = (course.totalDuration || 0) + duration;
    await section.save();
    await course.save();
  }

  res.status(201).json({ status: "success", data: lecture });
});

// exports.createLecture = catchAsync(async (req, res, next) => {
//   const { courseId, sectionId } = req.params;

//   if (req.body.questions) {
//     try {
//       req.body.questions = JSON.parse(req.body.questions);
//     } catch (error) {
//       return res.status(400).json({
//         status: "fail",
//         message: "Format des questions invalide",
//       });
//     }
//   }

//   const { title, type, duration = 0, questions } = req.body;
//   const course = await Course.findById(courseId).populate("assetFolder");
//   const section = await Section.findById(sectionId).populate("lectures");
//   if (!course || !section) {
//     return next(new AppError("Course or Section not found", 404));
//   }
//   if (course.instructor.toString() !== req.user._id.toString()) {
//     return next(
//       new AppError("Vous n’êtes pas autorisé à modifier ce cours", 403)
//     );
//   }
//   if (course.status === "pending") {
//     return next(
//       new AppError(
//         "Ce cours est en attente d’approbation et ne peut pas être modifié",
//         400
//       )
//     );
//   }

//   let url = "";

//   if (type === "video" && req.files && req.files.video) {
//     const folder = course.assetFolder;
//     const video = await uploadToCloudinary(req.files.video, folder);
//     url = video.secure_url;
//   }

//   let lecture;
//   if (course.parentCourseId) {
//     // Vérifier si une section brouillon existe
//     let draftSection = section.draftVersion
//       ? await Section.findById(section.draftVersion).populate("lectures")
//       : null;

//     if (!draftSection) {
//       // Créer une nouvelle section brouillon avec le contenu de la section originale
//       draftSection = new Section({
//         title: section.title,
//         lectures: section.lectures.map((lecture) => lecture._id), // Copier les lectures existantes
//       });
//       await draftSection.save();
//       section.draftVersion = draftSection._id;
//       await section.save();
//     }

//     // Créer la nouvelle leçon brouillon
//     const draftLecture = await Lecture.create({
//       title,
//       type,
//       url,
//       duration,
//       questions,
//     });

//     // Ajouter la nouvelle leçon à la section brouillon
//     draftSection.lectures.push(draftLecture._id);
//     await draftSection.save();

//     lecture = draftLecture;
//   } else {
//     // Cas normal : création directe dans le cours original
//     lecture = await Lecture.create({ title, type, url, duration, questions });

//     section.lectures.push(lecture._id);
//     course.totalDuration = course.totalDuration + duration;
//     await section.save();
//     await course.save();
//   }

//   res.status(201).json({ status: "success", data: lecture });
// });
// Mise à jour d'une leçon
// exports.updateLecture = catchAsync(async (req, res, next) => {
//   const { lectureId, courseId, sectionId } = req.params;
//   const { title, type } = req.body;

//   const course = await Course.findById(courseId);
//   const section = await Section.findById(sectionId);
//   const lecture = await Lecture.findById(lectureId);

//   if (!course || !section || !lecture) {
//     return next(new AppError("Course, Section, or Lecture not found", 404));
//   }
//   if (course.instructor.toString() !== req.user._id.toString()) {
//     return next(
//       new AppError("Vous n’êtes pas autorisé à modifier ce cours", 403)
//     );
//   }
//   if (course.status === "pending") {
//     return next(
//       new AppError(
//         "Ce cours est en attente d’approbation et ne peut pas être modifié",
//         400
//       )
//     );
//   }

//   if (req.body.questions) {
//     try {
//       req.body.questions = JSON.parse(req.body.questions);
//     } catch (error) {
//       return res.status(400).json({
//         status: "fail",
//         message: "Format des questions invalide",
//       });
//     }
//   }
//   if (type === "video" && req.files && req.files.video) {
//     const asset_folder = course.assetFolder;
//     if (lecture.url) {
//       const decodedImageUrl = decodeURIComponent(lecture.url);
//       const imageName = decodedImageUrl.split("/").pop().split(".")[0];
//       const publicId = asset_folder + "/" + imageName;
//       await deleteResourceFromCloudinary(publicId, "video");
//     }

//     const video = await uploadToCloudinary(req.files.video, asset_folder);
//     req.body.url = video.secure_url;
//   }

//   const updatedLecture = await Lecture.findByIdAndUpdate(lectureId, req.body, {
//     new: true,
//     runValidators: true,
//   });

//   res.status(200).json({ status: "success", data: updatedLecture });
// });

exports.updateLecture = catchAsync(async (req, res, next) => {
  const { lectureId, courseId, sectionId } = req.params;
  const { title, type } = req.body;

  const course = await Course.findById(courseId).populate("assetFolder");
  const section = await Section.findById(sectionId);
  const lecture = await Lecture.findById(lectureId);

  if (!course || !section || !lecture) {
    return next(new AppError("Course, Section, or Lecture not found", 404));
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

  if (req.body.questions) {
    try {
      req.body.questions = JSON.parse(req.body.questions);
    } catch (error) {
      return res.status(400).json({
        status: "fail",
        message: "Format des questions invalide",
      });
    }
  }

  // Si le cours est une copie brouillon, créer une copie de la leçon
  if (course.parentCourseId) {
    // Vérifier si une copie existe déjà
    let draftLecture = lecture.draftVersion
      ? await Lecture.findById(lecture.draftVersion)
      : null;

    if (!draftLecture) {
      let url = lecture.url;
      if (type === "video" && req.files && req.files.video) {
        const asset_folder = course.assetFolder;
        if (lecture.url) {
          const decodedImageUrl = decodeURIComponent(lecture.url);
          const imageName = decodedImageUrl.split("/").pop().split(".")[0];
          const publicId = asset_folder + "/" + imageName;
          await deleteResourceFromCloudinary(publicId, "video");
        }

        const video = await uploadToCloudinary(req.files.video, asset_folder);
        url = video.secure_url;
      }

      draftLecture = new Lecture({
        title: title || lecture.title,
        type: type || lecture.type,
        url: url,
        duration: req.body.duration || lecture.duration,
        questions: req.body.questions || lecture.questions,
      });
      await draftLecture.save();

      // Mettre à jour la référence draftVersion dans la leçon originale
      lecture.draftVersion = draftLecture._id;
      await lecture.save();
    } else {
      // Mettre à jour la copie existante
      let url = draftLecture.url;
      if (type === "video" && req.files && req.files.video) {
        const asset_folder = course.assetFolder;
        if (draftLecture.url) {
          const decodedImageUrl = decodeURIComponent(draftLecture.url);
          const imageName = decodedImageUrl.split("/").pop().split(".")[0];
          const publicId = asset_folder + "/" + imageName;
          await deleteResourceFromCloudinary(publicId, "video");
        }

        const video = await uploadToCloudinary(req.files.video, asset_folder);
        url = video.secure_url;
      }

      draftLecture.title = title || draftLecture.title;
      draftLecture.type = type || draftLecture.type;
      draftLecture.url = url;
      draftLecture.duration = req.body.duration || draftLecture.duration;
      draftLecture.questions = req.body.questions || draftLecture.questions;
      await draftLecture.save();
    }

    // Remplacer la leçon dans la section
    const lectureIndex = section.lectures.findIndex(
      (l) => l.toString() === lectureId
    );
    if (lectureIndex !== -1) {
      section.lectures[lectureIndex] = draftLecture._id;
      await section.save();
    }

    return res.status(200).json({ status: "success", data: draftLecture });
  }

  // Sinon, mettre à jour la leçon directement
  if (type === "video" && req.files && req.files.video) {
    const asset_folder = course.assetFolder;
    if (lecture.url) {
      const decodedImageUrl = decodeURIComponent(lecture.url);
      const imageName = decodedImageUrl.split("/").pop().split(".")[0];
      const publicId = asset_folder + "/" + imageName;
      await deleteResourceFromCloudinary(publicId, "video");
    }

    const video = await uploadToCloudinary(req.files.video, asset_folder);
    req.body.url = video.secure_url;
  }

  const updatedLecture = await Lecture.findByIdAndUpdate(lectureId, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ status: "success", data: updatedLecture });
});

// Suppression d'une leçon
exports.deleteLecture = catchAsync(async (req, res, next) => {
  const { lectureId, courseId, sectionId } = req.params;

  const course = await Course.findById(courseId);
  const section = await Section.findById(sectionId);
  const lecture = await Lecture.findById(lectureId);
  console.log(course, section, lecture);

  if (!course || !section || !lecture) {
    return next(new AppError("Course, Section, or Lecture not found", 404));
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

  await Lecture.deleteLectureWithCloudinary(lecture._id);

  section.lectures.pull(lectureId);
  await section.save();

  res.status(204).json({ status: "success", message: "Lecture deleted" });
});

// get lecture
exports.getLecture = catchAsync(async (req, res) => {
  const { courseId, sectionId, lectureId } = req.params;

  const course = await Course.findById(courseId).populate("sections").exec();

  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }

  const section = course.sections.find(
    (section) => section._id.toString() === sectionId
  );

  if (!section) {
    return res.status(404).json({ message: "Section not found" });
  }

  const lecture = await Lecture.findById(lectureId).exec();

  if (!lecture) {
    return res.status(404).json({ message: "Lecture not found" });
  }

  return res.status(200).json(lecture);
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

exports.recommend = catchAsync(async (req, res, next) => {
  const userId = req.user._id;

  const interactions = await Interaction.find({ student: userId });

  if (!interactions || interactions.length === 0) {
    return res.status(404).json({
      status: "fail",
      message: "Aucune interaction trouvée pour cet utilisateur",
    });
  }

  const tagScores = interactions.reduce((scores, interaction) => {
    const { feature: tag, weight } = interaction;

    if (scores[tag]) {
      scores[tag] += weight;
    } else {
      scores[tag] = weight;
    }

    return scores;
  }, {});

  const popularTags = Object.keys(tagScores).sort(
    (a, b) => tagScores[b] - tagScores[a]
  );

  const recommendedCourses = await Course.find({
    tags: { $in: popularTags },
  })
    .populate("instructor", "name")
    .select(
      "title tags instructor imageUrl level price totalStudents averageRating"
    );

  recommendedCourses.sort((a, b) => {
    const scoreA = a.tags.reduce((sum, tag) => sum + (tagScores[tag] || 0), 0);
    const scoreB = b.tags.reduce((sum, tag) => sum + (tagScores[tag] || 0), 0);
    return scoreB - scoreA;
  });

  res.status(200).json({
    status: "success",
    results: recommendedCourses.length,
    courses: recommendedCourses,
  });
});

// Mise à jour de la fonction pour accepter ou rejeter un cours
exports.accepteRejetCours = catchAsync(async (req, res, next) => {
  const { courseId } = req.params;
  const course = await Course.findById(courseId).populate({
    path: "instructor",
    select: "email name",
  });
  if (!course) {
    return next(new AppError("Cours non trouvé", 404));
  }
  if (course.status !== "pending") {
    return next(
      new AppError("Ce cours n’est pas en attente d’approbation", 400)
    );
  }

  const { instructor } = course;
  const emailService = new EmailService(instructor);

  const { status, message } = req.body;
  let text = "";

  if (status === "rejected") {
    course.status = "rejected";
    course.rejectionReason = message || "Raison non spécifiée";
    await course.save();

    text = `Désolé, votre cours "${
      course.title
    }" a été refusé. Voici les détails :\n${
      message || "Aucune raison spécifiée"
    }`;
    await emailService.sendRejetAcceptationEmail("refus", text);
  } else if (status === "published") {
    if (course.parentCourseId) {
      // Si c’est une copie brouillon, fusionner avec le cours original
      const updatedCourse = await Course.mergeCourseUpdates(courseId);
      console.log("yes");
      text = `La mise à jour de votre cours "${
        updatedCourse.title
      }" a été approuvée.\n${message || ""}`;
      await emailService.sendRejetAcceptationEmail("success", text);
    } else {
      // Si c’est un nouveau cours
      course.status = "published";
      await course.save();

      text = `Votre cours "${course.title}" a été approuvé.\n${message || ""}`;
      await emailService.sendRejetAcceptationEmail("success", text);
    }
  } else {
    return next(new AppError("Statut invalide", 400));
  }

  res.status(200).json({ status: "success" });
});

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

  const totalInstructors = await User.countDocuments({ role: "instructor" });

  const totalStudents = await User.countDocuments({ role: "student" });

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
