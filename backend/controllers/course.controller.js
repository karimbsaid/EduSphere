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

//get all course

exports.getAllCourses = async (req, res) => {
  const features = new APIFeatures(
    Course.find()
      .populate({
        path: "instructor",
        select: "name additionalDetails",
        populate: { path: "additionalDetails" },
      })
      .select("-sections -resources ")
      .lean({ virtuals: false }),
    req.query
  )
    .filter()
    .search(["title", "description", "category", "tags"])
    .sort()
    .limitFields()
    .paginate();

  const courses = await features.query;

  if (req.query.search && req.user._id) {
    await Interaction.findOneAndUpdate(
      { student: req.user._id, feature: req.query.search }, // Correction ici
      { interactionType: "search", updatedAt: new Date() },
      { upsert: true, new: true }
    );
  }

  res.status(200).json({
    status: "success",
    results: courses.length,
    courses,
  });
};

//get course detail

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
    .populate("instructor", "name ")
    .populate({ path: "resources", select: isEditRoute ? "" : "-resourceUrl" })
    .lean();

  if (!course) {
    return res
      .status(404)
      .json({ status: "fail", message: "Cours non trouvé" });
  }

  if (req.user && req.user._id && course?.tags?.length > 0 && !isEditRoute) {
    await Promise.all(
      course.tags.map((tag) =>
        Interaction.findOneAndUpdate(
          { student: req.user._id, feature: tag },
          { interactionType: "view", updatedAt: new Date() },
          { upsert: true, new: true }
        )
      )
    );
  }

  const numberOfStudent = await Enrollment.countDocuments({ courseId });

  course.totalStudent = course.totalStudent || numberOfStudent;

  res.status(200).json({ status: "success", course });
});

/*** Création d'un cours ***/
exports.createCourse = catchAsync(async (req, res, next) => {
  try {
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
  } catch (err) {
    console.log(err);
  }
});

/*** Mise à jour d'un cours ***/
exports.updateCourse = catchAsync(async (req, res, next) => {
  const { courseId } = req.params;
  const { title, tags, category = "Programming" } = req.body;

  const course = await Course.findById(courseId).select("+assetFolder");
  if (!course) {
    return next(new AppError("Course not found", 404));
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

/*** Suppression d'un cours ***/
exports.deleteCourse = catchAsync(async (req, res, next) => {
  const { courseId } = req.params;
  const course = await Course.findById(courseId);

  if (!course) {
    return next(new AppError("Course not found", 404));
  }

  const folder = `courses/${course.title}`;

  await deleteFolderOnCloudinary(folder);

  await course.deleteOne();

  res.status(204).json({ status: "success", message: "Course deleted" });
});

/*** Création d'une section ***/
exports.createSection = catchAsync(async (req, res, next) => {
  const { courseId } = req.params;
  const { title } = req.body;

  const course = await Course.findById(courseId).populate("sections");

  if (!course) {
    return next(new AppError("Course not found", 404));
  }

  const section = await Section.create({ title });

  course.sections.push(section._id);
  await course.save();

  res.status(201).json({ status: "success", data: section });
});

/*** Mise à jour d'une section ***/
exports.updateSection = catchAsync(async (req, res, next) => {
  const { sectionId, courseId } = req.params;
  const { title } = req.body;
  const section = await Section.findById(sectionId);
  const course = await Course.findById(courseId);
  if (!section || !course) {
    return next(new AppError("Section or Course not found", 404));
  }
  section.title = title;
  await section.save();

  res.status(200).json({ status: "success", data: section });
});

/*** Suppression d'une section ***/
exports.deleteSection = catchAsync(async (req, res, next) => {
  const { sectionId, courseId } = req.params;

  const section = await Section.findById(sectionId);
  const course = await Course.findById(courseId).populate("sections");

  if (!section || !course) {
    return next(new AppError("Section or Course not found", 404));
  }
  await Section.deleteSectionWithLecture(sectionId);

  course.sections.pull(sectionId);

  await course.save();

  res.status(204).json({ status: "success", message: "Section deleted" });
});

/*** Création d'une leçon ***/
exports.createLecture = catchAsync(async (req, res, next) => {
  const { courseId, sectionId } = req.params;
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
  const course = await Course.findById(courseId).populate("assetFolder");

  const section = await Section.findById(sectionId);
  if (!course || !section) {
    return next(new AppError("Course or Section not found", 404));
  }

  let url = "";

  if (type === "video" && req.files && req.files.video) {
    const folder = course.assetFolder;
    const video = await uploadToCloudinary(req.files.video, folder);
    url = video.secure_url;
  }

  // Créer la leçon
  const lecture = await Lecture.create({ ...req.body, url, duration });

  section.lectures.push(lecture._id);
  course.totalDuration = course.totalDuration + duration;
  await section.save();
  await course.save();

  res.status(201).json({ status: "success", data: lecture });
});

/*** Mise à jour d'une leçon ***/
exports.updateLecture = catchAsync(async (req, res, next) => {
  const { lectureId, courseId, sectionId } = req.params;
  const { title, type } = req.body;

  const course = await Course.findById(courseId);
  const section = await Section.findById(sectionId);
  const lecture = await Lecture.findById(lectureId);

  if (!course || !section || !lecture) {
    return next(new AppError("Course, Section, or Lecture not found", 404));
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

/*** Suppression d'une leçon ***/
exports.deleteLecture = catchAsync(async (req, res, next) => {
  const { lectureId, courseId, sectionId } = req.params;

  const course = await Course.findById(courseId);
  const section = await Section.findById(sectionId);
  const lecture = await Lecture.findById(lectureId);

  if (!course || !section || !lecture) {
    return next(new AppError("Course, Section, or Lecture not found", 404));
  }

  await Lecture.deleteLectureWithCloudinary(lecture._id);

  section.lectures.pull(lectureId);
  await section.save();

  res.status(204).json({ status: "success", message: "Lecture deleted" });
});

/**get lecture */

exports.getLecture = catchAsync(async (req, res) => {
  const { courseId, sectionId, lectureId } = req.params;

  const course = await Course.findById(courseId)
    .populate("sections") // Remplir les sections du cours
    .exec();

  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }

  // 2. Trouver la section par son ID
  const section = course.sections.find(
    (section) => section._id.toString() === sectionId
  );

  if (!section) {
    return res.status(404).json({ message: "Section not found" });
  }

  // 3. Trouver la lecture dans la section par son ID
  const lecture = await Lecture.findById(lectureId).exec();

  if (!lecture) {
    return res.status(404).json({ message: "Lecture not found" });
  }

  // 4. Retourner la lecture
  return res.status(200).json(lecture);
});

exports.getMyCourses = catchAsync(async (req, res) => {
  res.json(stats);
});

exports.recommend = catchAsync(async (req, res, next) => {
  const studentId = req.user._id;

  // 🔹 Récupérer les interactions des 7 derniers jours
  const interactions = await Interaction.find({
    student: studentId,
    updatedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
  });

  // 🔹 Extraire les tags enregistrés (des recherches et vues)
  const tags = [...new Set(interactions.map(({ feature }) => feature))];

  if (tags.length === 0) {
    return res.json({ recommendations: [] }); // Pas de recommandations si aucun tag n'a été enregistré
  }

  // 🔹 Trouver les cours correspondant aux tags
  const recommendations = await Course.find({
    tags: { $in: tags },
    status: "published",
  })
    .sort({ createdAt: -1 }) // Trier par date de création pour recommander les plus récents
    .limit(10);

  res.json({ recommendations });
});

// exports.getMyCourses = catchAsync(async (req, res) => {
//   const stats = await Course.aggregate([
//     // 1️⃣ Filtrer les cours de l'instructeur
//     {
//       $match: { instructor: req.user._id },
//     },

//     // 2️⃣ Jointure avec `Enrollment`
//     {
//       $lookup: {
//         from: "enrollments",
//         localField: "_id",
//         foreignField: "courseId",
//         as: "enrollments",
//       },
//     },

//     { $unwind: { path: "$enrollments", preserveNullAndEmptyArrays: true } },

//     // 3️⃣ Jointure avec `Progress`
//     {
//       $lookup: {
//         from: "progresses",
//         localField: "enrollments.progress",
//         foreignField: "_id",
//         as: "progressDetails",
//       },
//     },

//     { $unwind: { path: "$progressDetails", preserveNullAndEmptyArrays: true } },

//     // 4️⃣ Jointure avec `sections`
//     {
//       $lookup: {
//         from: "sections",
//         localField: "sections",
//         foreignField: "_id",
//         as: "sectionsDetails",
//       },
//     },

//     // Ajouter le champ `firstSectionId` (au lieu de toute la section)
//     {
//       $addFields: {
//         firstSectionId: { $arrayElemAt: ["$sectionsDetails._id", 0] },
//       },
//     },

//     { $unwind: { path: "$sectionsDetails", preserveNullAndEmptyArrays: true } },

//     // 5️⃣ Jointure avec `lectures`
//     {
//       $lookup: {
//         from: "lectures",
//         localField: "sectionsDetails.lectures",
//         foreignField: "_id",
//         as: "lecturesDetails",
//       },
//     },

//     // Ajouter le champ `firstLecture`
//     {
//       $addFields: {
//         firstLecture: { $arrayElemAt: ["$sectionsDetails.lectures", 0] },
//       },
//     },

//     { $unwind: { path: "$lecturesDetails", preserveNullAndEmptyArrays: true } },

//     // 6️⃣ Grouper par cours et calculer les stats
//     {
//       $group: {
//         _id: "$_id",
//         title: { $first: "$title" },
//         level: { $first: "$level" },
//         category: { $first: "$category" },
//         imageUrl: { $first: "$imageUrl" },
//         status: { $first: "$status" },
//         price: { $first: "$price" },
//         totalStudents: { $sum: 1 }, // Nombre total d'inscriptions
//         completedStudents: {
//           $sum: {
//             $cond: [
//               { $gte: ["$progressDetails.progressPercentage", 100] },
//               1,
//               0,
//             ],
//           },
//         },
//         revenue: { $sum: "$price" }, // Calcul du revenu
//         totalDuration: { $sum: "$lecturesDetails.duration" }, // Durée totale
//         firstSection: { $first: "$firstSectionId" }, // 🔹 Premier section _id uniquement
//         firstLecture: { $first: "$firstLecture" }, // 🔹 Premier vidéo _id uniquement
//       },
//     },

//     // 7️⃣ Trier par revenu décroissant
//     { $sort: { revenue: -1 } },
//   ]);

//   res.json(stats);
// });
