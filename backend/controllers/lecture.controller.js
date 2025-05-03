const Section = require("../models/section.models");
const Course = require("../models/course.models");
const mongoose = require("mongoose");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Lecture = require("../models/lecture.models");
const slugify = require("slugify");
const {
  uploadToCloudinary,
  deleteResourceFromCloudinary,
} = require("../utils/cloudinaryService");
//créer une  nouvelle lecon
exports.createLecture = catchAsync(async (req, res, next) => {
  console.log("creation lecture");
  const { courseId, sectionId } = req.params;
  if (req.body.questions) {
    try {
      req.body.questions = JSON.parse(req.body.questions);
    } catch (error) {
      return next(new AppError("Format des questions invalide", 400));
    }
  }
  let session;

  try {
    session = await mongoose.startSession();
    console.log(session);
    session.startTransaction();
    const { title, type, duration = 0, questions } = req.body;
    const course = await Course.findById(courseId).session(session);
    const section = await Section.findById(sectionId).session(session);
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
    await session.commitTransaction();

    res.status(201).json({ status: "success", data: lecture });
  } catch (error) {
    await session.abortTransaction();
    return next(error);
  } finally {
    session.endSession();
  }
});
//mis à jour d'un lecon

exports.updateLecture = catchAsync(async (req, res, next) => {
  const { lectureId, courseId, sectionId } = req.params;
  const { title, type } = req.body;
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const course = await Course.findById(courseId).session(session);
    const section = await Section.findById(sectionId).session(session);
    const lecture = await Lecture.findById(lectureId).session(session);
    if (!course || !section || !lecture) {
      return next(new AppError("Course, Section, or Lecture not found", 404));
    }
    if (req.body.questions) {
      try {
        req.body.questions = JSON.parse(req.body.questions);
      } catch (error) {
        return next(new AppError("Format des questions invalide", 400));
      }
    }
    // Si la leçon est de type vidéo et qu'un nouveau fichier est fourni, remplacer l'ancienne vidéo
    if (type === "video" && req.files && req.files.video) {
      const folder = `courses/${course.title}/${section.title}`;

      // Supprimer l'ancienne vidéo de Cloudinary
      if (lecture.url) {
        const publicId = lecture.url
          .split("/")
          .slice(-2)
          .join("/")
          .split(".")[0];
        await cloudinary.uploader.destroy(publicId, { resource_type: "video" });
      }

      // Télécharger la nouvelle vidéo sur Cloudinary
      const video = await uploadToCloudinary(req.files.video, folder);
      req.body.url = video.secure_url;
    }

    // Mettre à jour la leçon
    const updatedLecture = await Lecture.findByIdAndUpdate(
      lectureId,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    await session.commitTransaction();

    res.status(200).json({ status: "success", data: updatedLecture });
  } catch (error) {
    await session.abortTransaction();
    return next(error);
  } finally {
    session.endSession();
  }
});

// Suppression d'une leçon
exports.deleteLecture = catchAsync(async (req, res, next) => {
  const { lectureId, courseId, sectionId } = req.params;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const course = await Course.findById(courseId).session(session);
    const section = await Section.findById(sectionId)
      .populate("lectures")
      .session(session);
    const lecture = await Lecture.findById(lectureId).session(session);

    if (!course || !section || !lecture) {
      next(new AppError("Cours, section ou leçon non trouvé", 404));
    }
    if (course.instructor.toString() !== req.user._id.toString()) {
      next(new AppError("Vous n’êtes pas autorisé à modifier ce cours", 403));
    }
    if (course.status === "pending") {
      next(new AppError("Ce cours est en attente d’approbation", 400));
    }

    section.lectures.pull(lectureId);
    await section.save({ session });
    await Lecture.findByIdAndDelete(lectureId, { session });

    await session.commitTransaction();
    res.status(204).json({ status: "success", message: "Leçon supprimée" });
  } catch (error) {
    await session.abortTransaction();
    return next(error);
  } finally {
    session.endSession();
  }
});

// get lecture
exports.getLecture = catchAsync(async (req, res, next) => {
  const { courseId, sectionId, lectureId } = req.params;

  const course = await Course.findById(courseId).populate("sections").exec();

  if (!course) {
    return next(new AppError("Course not found", 404));
  }

  const section = course.sections.find(
    (section) => section._id.toString() === sectionId
  );

  if (!section) {
    return next(new AppError("Section not found", 404));
  }

  const lecture = await Lecture.findById(lectureId).exec();

  if (!lecture) {
    return next(new AppError("Lecture not found", 404));
  }

  return res.status(200).json(lecture);
});
