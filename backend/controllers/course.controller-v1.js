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
    folder,
  });
};
const deleteResourceFromCloudinary = async (publicId) => {
  const result = await cloudinary.api.delete_resources([publicId], {
    type: "upload",
    resource_type: "image",
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
  console.log(req.query);
  const features = new APIFeatures(
    Course.find().populate({
      path: "instructor",
      select: "name additionalDetails",
      populate: { path: "additionalDetails" },
    }),
    req.query
  )
    .filter()
    .search(["title", "description", "category", "tags"])
    .sort()
    .limitFields()
    .paginate();

  const courses = await features.query;

  res.status(200).json({
    status: "success",
    results: courses.length,
    courses,
  });
};

//get course detail

exports.getCourseDetails = catchAsync(async (req, res) => {
  const { courseId } = req.params;
  const isEditRoute = req.originalUrl.includes("/edit"); // Détermine le contexte

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
    .lean(); // Charge l'instructeur avec son nom et email

  const numberOfStudent = await Enrollment.countDocuments({ courseId });

  // Vérification si le cours existe
  if (!course) {
    return res
      .status(404)
      .json({ status: "fail", message: "Cours non trouvé" });
  }
  course.numberOfStudent = numberOfStudent || 0;

  res.status(200).json({ status: "success", data: course });
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

    if (req.files && req.files.coverImage) {
      const image = await uploadToCloudinary(req.files.coverImage, folder);
      imageUrl = image.secure_url;
    }

    const course = await Course.create({
      ...req.body,
      imageUrl,
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

  const course = await Course.findById(courseId);
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

  // Vérification du type après conversion
  if (req.body.tags && !Array.isArray(req.body.tags)) {
    return next(new AppError("Les tags doivent être un tableau", 400));
  }

  if (req.files && req.files.coverImage) {
    const decodedImageUrl = decodeURIComponent(course.imageUrl);
    const extractedPath = decodedImageUrl.split("/upload/")[1];
    const publicId = extractedPath.substring(extractedPath.indexOf("/") + 1);
    const pathParts = publicId.split("/");
    pathParts.pop(); // Retire le fichier final
    const directoryPath = pathParts.join("/") + "/";

    const res = await deleteResourceFromCloudinary(publicId);

    // Télécharger la nouvelle image sur Cloudinary
    const image = await uploadToCloudinary(req.files.coverImage, directoryPath);
    const imageUrl = image.secure_url;

    // Mettre à jour l'URL de l'image dans le corps de la requête
    req.body.imageUrl = imageUrl;
  }

  // Mettre à jour les autres champs du cours
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

  // Supprimer le dossier du cours sur Cloudinary
  await deleteFolderOnCloudinary(folder);

  // Supprimer le cours de la base de données
  await course.deleteOne();

  res.status(204).json({ status: "success", message: "Course deleted" });
});

/*** Création d'une section ***/
exports.createSection = catchAsync(async (req, res, next) => {
  const { courseId } = req.params;
  const { title } = req.body;

  const course = await Course.findById(courseId);

  if (!course) {
    return next(new AppError("Course not found", 404));
  }

  const section = await Section.create({ title });

  // Ajouter la section au cours
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

  // Vérifier si le titre de la section a changé
  if (title && title !== section.title) {
    const oldFolder = `courses/${course.title}/${section.title}`;
    const newFolder = `courses/${course.title}/${title}`;

    // Récupérer toutes les ressources du dossier actuel
    const resources = await cloudinary.api.resources({
      type: "upload",
      prefix: oldFolder,
    });

    // Déplacer chaque ressource vers le nouveau dossier
    for (const resource of resources.resources) {
      await moveResourceOnCloudinary(resource.public_id, newFolder);
    }

    // Supprimer l'ancien dossier
    await deleteFolderOnCloudinary(oldFolder);
  }

  // Mettre à jour le titre de la section
  section.title = title;
  await section.save();

  res.status(200).json({ status: "success", data: section });
});

/*** Suppression d'une section ***/
exports.deleteSection = catchAsync(async (req, res, next) => {
  const { sectionId, courseId } = req.params;

  const section = await Section.findById(sectionId);
  const course = await Course.findById(courseId);

  if (!section || !course) {
    return next(new AppError("Section or Course not found", 404));
  }

  const folder = `courses/${course.title}/${section.title}`;

  // Supprimer le dossier de la section sur Cloudinary
  await deleteFolderOnCloudinary(folder);

  // Supprimer la section du cours
  course.sections.pull(sectionId);
  await course.save();

  // Supprimer la section de la base de données
  await section.deleteOne();

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
  const course = await Course.findById(courseId);
  const section = await Section.findById(sectionId);
  if (!course || !section) {
    return next(new AppError("Course or Section not found", 404));
  }

  let url = "";
  const slug_title = slugify(section.title, { lower: true, strict: true });

  // Si la leçon est de type vidéo, télécharger la vidéo sur Cloudinary
  if (type === "video" && req.files && req.files.video) {
    const folder = `courses/${course.title}/${slug_title}`;
    const video = await uploadToCloudinary(req.files.video, folder);
    url = video.secure_url;
  }

  // Créer la leçon
  const lecture = await Lecture.create({ ...req.body, url, duration });

  // Ajouter la leçon à la section
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
  // Si la leçon est de type vidéo et qu'un nouveau fichier est fourni, remplacer l'ancienne vidéo
  if (type === "video" && req.files && req.files.video) {
    const folder = `courses/${course.title}/${section.title}`;

    // Supprimer l'ancienne vidéo de Cloudinary
    if (lecture.url) {
      const publicId = lecture.url.split("/").slice(-2).join("/").split(".")[0];
      await cloudinary.uploader.destroy(publicId, { resource_type: "video" });
    }

    // Télécharger la nouvelle vidéo sur Cloudinary
    const video = await uploadToCloudinary(req.files.video, folder);
    req.body.url = video.secure_url;
  }

  // Mettre à jour la leçon
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

  // Si la leçon est de type vidéo, supprimer la vidéo de Cloudinary
  if (lecture.type === "video" && lecture.url) {
    const publicId = lecture.url.split("/").slice(-2).join("/").split(".")[0];
    await cloudinary.uploader.destroy(publicId, { resource_type: "video" });
  }

  // Supprimer la leçon de la section
  section.lectures.pull(lectureId);
  await section.save();

  // Supprimer la leçon de la base de données
  await lecture.deleteOne();

  res.status(204).json({ status: "success", message: "Lecture deleted" });
});

/**get lecture */

exports.getLecture = catchAsync(async (req, res) => {
  const { courseId, sectionId, lectureId } = req.params;
  console.log("here", courseId, sectionId, lectureId);

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
  const stats = await Course.aggregate([
    // 1️⃣ Filtrer les cours de l'instructeur
    {
      $match: { instructor: req.user._id },
    },

    // 2️⃣ Jointure avec `Enrollment`
    {
      $lookup: {
        from: "enrollments",
        localField: "_id",
        foreignField: "courseId",
        as: "enrollments",
      },
    },

    { $unwind: { path: "$enrollments", preserveNullAndEmptyArrays: true } },

    // 3️⃣ Jointure avec `Progress`
    {
      $lookup: {
        from: "progresses",
        localField: "enrollments.progress",
        foreignField: "_id",
        as: "progressDetails",
      },
    },

    { $unwind: { path: "$progressDetails", preserveNullAndEmptyArrays: true } },

    // 4️⃣ Jointure avec `sections`
    {
      $lookup: {
        from: "sections",
        localField: "sections",
        foreignField: "_id",
        as: "sectionsDetails",
      },
    },

    // Ajouter le champ `firstSectionId` (au lieu de toute la section)
    {
      $addFields: {
        firstSectionId: { $arrayElemAt: ["$sectionsDetails._id", 0] },
      },
    },

    { $unwind: { path: "$sectionsDetails", preserveNullAndEmptyArrays: true } },

    // 5️⃣ Jointure avec `lectures`
    {
      $lookup: {
        from: "lectures",
        localField: "sectionsDetails.lectures",
        foreignField: "_id",
        as: "lecturesDetails",
      },
    },

    // Ajouter le champ `firstLecture`
    {
      $addFields: {
        firstLecture: { $arrayElemAt: ["$sectionsDetails.lectures", 0] },
      },
    },

    { $unwind: { path: "$lecturesDetails", preserveNullAndEmptyArrays: true } },

    // 6️⃣ Grouper par cours et calculer les stats
    {
      $group: {
        _id: "$_id",
        title: { $first: "$title" },
        level: { $first: "$level" },
        category: { $first: "$category" },
        imageUrl: { $first: "$imageUrl" },
        status: { $first: "$status" },
        price: { $first: "$price" },
        totalStudents: { $sum: 1 }, // Nombre total d'inscriptions
        completedStudents: {
          $sum: {
            $cond: [
              { $gte: ["$progressDetails.progressPercentage", 100] },
              1,
              0,
            ],
          },
        },
        revenue: { $sum: "$price" }, // Calcul du revenu
        totalDuration: { $sum: "$lecturesDetails.duration" }, // Durée totale
        firstSection: { $first: "$firstSectionId" }, // 🔹 Premier section _id uniquement
        firstLecture: { $first: "$firstLecture" }, // 🔹 Premier vidéo _id uniquement
      },
    },

    // 7️⃣ Trier par revenu décroissant
    { $sort: { revenue: -1 } },
  ]);

  res.json(stats);
});

exports.recommend = catchAsync(async (req, res, next) => {
  const studentId = req.user._id;

  // 🔹 Récupérer les interactions de l'utilisateur
  const interactions = await Interaction.find({ student: studentId });

  // 🔹 Extraire les tags des cours consultés
  let tags = [];
  interactions.forEach(({ course }) => {
    if (course.tags) {
      tags = tags.concat(course.tags);
    }
  });

  // Supprimer les doublons
  tags = [...new Set(tags)];

  const viewedCourses = interactions.map(({ course }) => course._id);
  const recommendations = await Course.find({
    tags: { $in: tags },
    _id: { $nin: viewedCourses },
    status: "published",
  }).limit(10);

  res.json({ recommendations });
});
