const Course = require("../models/course.models");
const Enrollment = require("../models/enrollment.model");
const Progress = require("../models/progress.models");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const axios = require("axios");
const isSectionCompleted = (lecture, completedLectures) => {
  const lectureId = lecture.map((obj) => obj._id);
  return lectureId.every((element) => completedLectures.includes(element));
};

const calculateDurationProgress = (course, completedLecturesIds) => {
  let totalDuration = 0;
  let completedDuration = 0;

  course.sections.forEach((section) => {
    section.lectures.forEach((lecture) => {
      totalDuration += lecture.duration;
      if (completedLecturesIds.includes(lecture._id.toString())) {
        completedDuration += lecture.duration;
      }
    });
  });

  const progressPercentage =
    totalDuration > 0
      ? Math.round((completedDuration / totalDuration) * 100)
      : 0;
  return progressPercentage;
};

const nextLecture = (course, sectionId, lectureId) => {
  const sections = course.sections;
  const currentSection = course.sections.find(
    (sec) => sec._id.toString() === sectionId
  );
  const lectures = currentSection.lectures;
  const currentLectureIndex = lectures.findIndex(
    (lecture) => lecture._id.toString() === lectureId
  );
  if (currentLectureIndex < lectures.length - 1) {
    return {
      nextSection: currentSection._id,
      nextLecture: lectures[currentLectureIndex + 1]._id,
    };
  }
  const currentSectionIndex = sections.findIndex(
    (sec) => sec._id.toString() === sectionId
  );
  if (currentSectionIndex < sections.length - 1) {
    const nextSection = sections[currentSectionIndex + 1];
    const nextSectionId = nextSection._id;
    const nextLectureId = nextSection.lectures[0]._id;

    return {
      nextSection: nextSectionId,
      nextLecture: nextLectureId,
    };
  }
  return {
    nextSection: sections[0]._id,
    nextLecture: sections[0].lectures[0]._id,
  };
};

exports.enroll = catchAsync(async (req, res, next) => {
  const { courseId } = req.params;
  const userId = req.user._id;
  const course = req.course;

  let enrollment = await Enrollment.findOne({
    courseId: courseId,
    studentId: userId,
  }).populate("progress");

  if (enrollment) {
    return res.status(200).json({
      status: "success",
      message: "Tu es déjà inscrit à ce cours.",
      enrollment,
    });
  }

  if (!course) {
    return next(new AppError("Aucun cours trouvé", 404));
  }

  if (course.price === 0) {
    const firstSection = course.sections[0]._id;
    const firstLecture = course.sections[0].lectures[0]._id;

    // Créer le progrès
    const progress = await Progress.create({
      currentSection: firstSection,
      currentLecture: firstLecture,
    });

    // Créer l'inscription
    enrollment = await Enrollment.create({
      courseId: courseId,
      studentId: userId,
      progress,
    });

    return res.status(201).json({
      status: "success",
      enrollment,
    });
  }
  res.status(200).json({
    status: "payment_required",
    message: "Paiement requis pour s'inscrire au cours",
    courseId,
    amount: course.price,
  });
});

exports.updateProgress = catchAsync(async (req, res, next) => {
  const { sectionId, lectureId } = req.params;
  const course = req.course;
  const enrollment = req.enrollment;
  const progress = enrollment.progress;
  if (!progress.completedLectures.includes(lectureId)) {
    progress.completedLectures.push(lectureId);
  }
  const completedLectureId = progress.completedLectures;
  const section = course.sections.find(
    (sec) => sec._id.toString() === sectionId
  );
  const sectionCompleted = isSectionCompleted(
    section.lectures,
    progress.completedLectures
  );
  if (sectionCompleted && !progress.completedSections.includes(section._id)) {
    progress.completedSections.push(section._id);
  }
  const { nextSection: nextSectionId, nextLecture: nextLectureId } =
    nextLecture(course, sectionId, lectureId);
  progress.currentSection = nextSectionId;
  progress.currentLecture = nextLectureId;
  progress.progressPercentage = calculateDurationProgress(
    course,
    completedLectureId
  );

  await progress.save();

  res.status(200).json({
    status: "success",
    progress,
  });
});

exports.getProgress = catchAsync(async (req, res, next) => {
  console.log("nrollement", req.enrollment);
  const { progress } = req.enrollment;
  res.status(200).json({
    status: "success",
    progress,
  });
});
