const Section = require("../models/section.models");
const Course = require("../models/course.models");
const mongoose = require("mongoose");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Lecture = require("../models/lecture.models");
const slugify = require("slugify");
// const {
//   uploadToCloudinary,
//   deleteResourceFromCloudinary,
//   handleCloudinaryFileUpdate,
// } = require("../utils/cloudinaryService");
const CloudinaryStorage = require("../services/cloudinaryStorage");
const cloudinary = require("../config/cloudinary");
const storage = new CloudinaryStorage(cloudinary);
exports.createLecture = catchAsync(async (req, res, next) => {
  const { course, section, user } = req;
  const { title, type, duration = 0, questions } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let url = "";

    // Upload video if lecture type is 'video'
    if (type === "video" && req.files && req.files.video) {
      const folder = `courses/${course.title}/${slugify(section.title, {
        lower: true,
        strict: true,
      })}`;
      const video = await storage.upload(req.files.video, folder);
      url = video.secure_url;
    }

    // Create lecture
    const lecture = await Lecture.create([{ ...req.body, url, duration }], {
      session,
    });

    // Update section and course
    section.lectures.push(lecture[0]._id);
    course.totalDuration += duration;

    await section.save({ session });
    await course.save({ session });

    await session.commitTransaction();

    res.status(201).json({ status: "success", data: lecture[0] });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
});

//mis à jour d'un lecon

exports.updateLecture = catchAsync(async (req, res, next) => {
  const { lectureId } = req.params;
  const { type } = req.body;
  const { course, section, lecture } = req;

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    if (type === "video" && req.files && req.files.video) {
      const folder = `courses/${course.title}/${section.title}`;

      const newVideoUrl = await storage.updateFile({
        file: req.files.video,
        existingUrl: lecture.url,
        assetFolder: folder,
        type: "video",
      });
      req.body.url = newVideoUrl;
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
  const { course, section, lecture } = req;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    section.lectures.pull(lecture._id);
    await section.save({ session });
    await Lecture.deleteLectureWithCloudinary(lecture._id);

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
