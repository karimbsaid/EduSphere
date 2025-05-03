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

//get all course

exports.getTopPopularCourses = (req, res, next) => {
  req.query.limit = "5";
  req.query.sort = "-totalStudent";
  req.query.fields = "title,totalStudent,instructor";
  next();
};

exports.getMyCourses = async (req, res) => {
  let userId;

  // Vérification si req.user existe
  if (req.user) {
    userId = req.user._id;
  }
  let totalDocuments;

  let courseFilter = { instructor: userId };

  totalDocuments = await Course.countDocuments(courseFilter);

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
};

exports.getAllCourses = async (req, res) => {
  let userId;

  // Vérification si req.user existe
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
    .populate({ path: "instructor" });
  // .populate({ path: "resources", select: isEditRoute ? "" : "-resourceUrl" })
  // .lean({ virtuals: true });

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

  const enrollmentCount = await Enrollment.countDocuments({ courseId });

  if (enrollmentCount > 0) {
    return next(
      new AppError("Cannot delete course: students are still enrolled.", 400)
    );
  }

  const folder = `courses/${course.slug}`;

  // await deleteFolderOnCloudinary(folder);

  await Course.deleteCourse(courseId);

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

exports.getCourseStats = catchAsync(async (req, res, next) => {
  let courses;
  const user = await User.findById(req.user._id);

  if (!user) {
    return next(new AppError("Utilisateur non trouvé", 404));
  }

  // Si l'utilisateur est admin, récupérer tous les cours
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
  }
  // Si c'est un instructeur, récupérer seulement ses cours
  else if (user.role === "instructor") {
    courses = await Course.find({ instructor: user._id }).populate({
      path: "sections",
      select: "title lectures",
    });
  }
  // Si c'est un étudiant, retourner une erreur
  else {
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
      "title tags instructor imageUrl level price totalStudent averageRating"
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

exports.accepteRejetCours = catchAsync(async (req, res, next) => {
  const { courseId } = req.params;
  const cours = await Course.findById(courseId).populate({
    path: "instructor",
    select: "email name",
  });
  const { instructor } = cours;
  const emailService = new EmailService(instructor);

  const { status, message } = req.body;
  let text = "";
  const updatedCourse = await Course.findByIdAndUpdate(
    courseId,
    { status },
    {
      new: true,
      runValidators: true,
    }
  );
  if (status === "pending") {
    text =
      "désole votre cour est refusé tu trouve ci desous tous les détails" +
      "\n";
    message;
    await emailService.sendRejetAcceptationEmail("refus", text);
  } else if (status === "published") {
    text = "votre cour est approuvé" + message;
    await emailService.sendRejetAcceptationEmail("success", text);
  }
  res.status(201).json({ status: "ok" });
});

exports.getStatistics = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur serveur", error });
  }
};

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
