const Section = require("../models/section.models");
const Course = require("../models/course.models");
const mongoose = require("mongoose");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

//créer un nouveau chapitre
exports.createSection = catchAsync(async (req, res, next) => {
  const { courseId } = req.params;
  const { title } = req.body;

  const course = req.course;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const section = await Section.create(
      [{ title, lectures: [], course: courseId }],
      { session }
    );
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
  const { title } = req.body;
  const section = req.section;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
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
  const { sectionId } = req.params;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const course = req.course;
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
