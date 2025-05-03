const Section = require("../models/section.models");
const Course = require("../models/course.models");
const mongoose = require("mongoose");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

//créer un nouveau chapitre
exports.createSection = catchAsync(async (req, res, next) => {
  const { courseId } = req.params;
  const { title } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const course = await Course.findById(courseId).session(session);
    if (!course) {
      return next(new AppError("Cours non trouvé", 404));
    }

    if (course.instructor.toString() !== req.user._id.toString()) {
      return next(
        new AppError("Vous n’êtes pas autorisé à modifier ce cours", 403)
      );
    }
    if (course.status === "pending") {
      return next(new AppError("Ce cours est en attente d’approbation", 400));
    }

    const section = await Section.create([{ title, lectures: [] }], {
      session,
    });
    course.sections.push(section[0]._id);
    await course.save({ session });

    await session.commitTransaction();
    res.status(201).json({ status: "success", data: section[0] });
  } catch (error) {
    await session.abortTransaction();
    return next(error);
  } finally {
    session.endSession();
  }
});

//mis à jour un chapitre
exports.updateSection = catchAsync(async (req, res, next) => {
  const { sectionId, courseId } = req.params;
  const { title } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const course = await Course.findById(courseId)
      .populate("sections")
      .session(session);
    const section = await Section.findById(sectionId).session(session);
    if (
      !section ||
      !course ||
      !course.sections.some((s) => s._id.toString() === sectionId)
    ) {
      return next(new AppError("Section ou cours non trouvé", 404));
    }

    if (course.instructor.toString() !== req.user._id.toString()) {
      return next(
        new AppError("Vous n’êtes pas autorisé à modifier ce cours", 403)
      );
    }
    if (course.status === "pending") {
      return next(new AppError("Ce cours est en attente d’approbation", 400));
    }

    section.title = title;
    await section.save({ session });

    await session.commitTransaction();
    res.status(200).json({ status: "success", data: section });
  } catch (error) {
    await session.abortTransaction();
    return next(error);
  } finally {
    session.endSession();
  }
});

//delete section
exports.deleteSection = catchAsync(async (req, res, next) => {
  const { sectionId, courseId } = req.params;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const course = await Course.findById(courseId)
      .populate("sections")
      .session(session);
    const section = await Section.findById(sectionId).session(session);
    if (
      !course ||
      !section ||
      !course.sections.some((s) => s._id.toString() === sectionId)
    ) {
      return next(new AppError("Cours ou section non trouvé", 404));
    }
    if (course.instructor.toString() !== req.user._id.toString()) {
      return next(
        new AppError("Vous n’êtes pas autorisé à modifier ce cours", 403)
      );
    }
    if (course.status === "pending") {
      return next(new AppError("Ce cours est en attente d’approbation", 400));
    }

    course.sections.pull(sectionId);
    await course.save({ session });
    await Section.findByIdAndDelete(sectionId, { session });

    await session.commitTransaction();
    res.status(204).json({ status: "success", message: "Section supprimée" });
  } catch (error) {
    await session.abortTransaction();
    return next(error);
  } finally {
    session.endSession();
  }
});
