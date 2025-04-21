const Course = require("../models/course.models");
const Lecture = require("../models/lecture.models");
const Section = require("../models/section.models");
const Enrollment = require("../models/enrollment.model");
const Progress = require("../models/progress.models");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const mongoose = require("mongoose");
const Interaction = require("../models/interaction.model");
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
    // Récupérer la section suivante avec ses lectures

    return {
      nextSection: nextSectionId,
      nextLecture: nextLectureId,
    };
  }
  return {
    nextSection: null,
    nextLecture: null,
  };
};

exports.isEnrolled = catchAsync(async (req, res, next) => {
  const { courseId } = req.params;
  const userId = req.user._id;

  const course = await Course.findById(courseId)
    .populate({
      path: "sections",
      populate: { path: "lectures" },
    })
    .select("sections")
    .lean();

  if (!course) {
    return next(new AppError("Aucun cours trouvé", 200));
  }

  const enrollment = await Enrollment.findOne({
    courseId: courseId,
    studentId: userId,
  }).populate("progress");

  if (!enrollment) {
    // Si l'utilisateur n'est PAS inscrit, bloquer l'accès
    return next(new AppError("Tu n'es pas inscrit à ce cours", 200));
  }

  // Si l'utilisateur est inscrit, passer à la suite
  req.enrollment = enrollment;
  req.course = course;
  next();
});

exports.enroll = catchAsync(async (req, res, next) => {
  const { courseId } = req.params;
  const userId = req.user._id;

  // Vérifier si l'utilisateur est déjà inscrit
  let enrollment = await Enrollment.findOne({
    courseId: courseId,
    studentId: userId,
  }).populate("progress");

  if (enrollment) {
    // Si déjà inscrit, renvoyer son inscription existante
    return res.status(200).json({
      status: "success",
      message: "Tu es déjà inscrit à ce cours.",
      enrollment,
    });
  }

  // Vérifier si le cours a des sections
  const course = await Course.findById(courseId)
    .populate({
      path: "sections",
      populate: { path: "lectures" },
    })
    .select("sections price")
    .lean();

  if (!course) {
    return next(new AppError("Aucun cours trouvé", 404));
  }

  if (!course.sections.length) {
    return next(new AppError("Ce cours n'a pas de sections", 400));
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
  const { courseId, sectionId, lectureId } = req.params;
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
  const enrollment = req.enrollment;
  res.status(200).json({
    status: "success",
    progress: enrollment.progress,
  });
});

exports.pay = catchAsync(async (req, res, next) => {
  const url = "https://developers.flouci.com/api/generate_payment";
  const { amount } = req.body;
  const payload = {
    app_token: process.env.APP_TOKEN,
    app_secret: process.env.APP_SECRET,
    amount: amount,
    accept_card: "true",
    session_timeout_secs: 1200,
    success_link: "http://localhost:8080/api/v1/success",
    fail_link: "http://localhost:8080/api/v1/fail",
    developer_tracking_id: "dfee00a7-1605-4367-88ed-fcd045306c61",
  };
  await axios
    .post(url, payload)
    .then((result) => res.send(result.data).catch((err) => console.error(err)));
});

exports.verify = catchAsync(async (req, res, next) => {
  const { payment_id } = req.params;
  const url = `https://developers.flouci.com/api/verify_payment/${payment_id}`;
  await axios
    .get(
      url,
      (headers = {
        apppublic: process.env.APP_TOKEN,
        appsecret: process.env.APP_SECRET,
      })
    )
    .then((result) => res.send(result))
    .catch((err) => console.error(err));
});

// exports.getMyEnrolledCourse = catchAsync(async (req, res, next) => {
//   const studentId = req.user._id;

//   const enrollments = await Enrollment.find({ studentId })
//     .populate({
//       path: "courseId",
//       populate: {
//         path: "sections",
//       },
//     })
//     .populate({
//       path: "progress",
//     });

//   res.status(200).json({ enrollments });
// });

// exports.getStatistique = catchAsync(async (req, res, next) => {
//   const studentId = req.user._id;

//   const stats = await Enrollment.aggregate([
//     { $match: { studentId: new mongoose.Types.ObjectId(studentId) } }, // Filtrer par étudiant
//     {
//       $lookup: {
//         from: "progresses",
//         localField: "progress",
//         foreignField: "_id",
//         as: "progressData",
//       },
//     },
//     { $unwind: "$progressData" }, // Dérouler l'objet progress
//     {
//       $group: {
//         _id: null,
//         completedCourses: {
//           $sum: {
//             $cond: [{ $eq: ["$progressData.progressPercentage", 100] }, 1, 0],
//           },
//         },
//         inProgressCourses: {
//           $sum: {
//             $cond: [{ $lt: ["$progressData.progressPercentage", 100] }, 1, 0],
//           },
//         },
//       },
//     },
//   ]);

//   res.status(200).json({
//     status: "success",
//     data: stats[0] || { completedCourses: 0, inProgressCourses: 0 },
//   });
// });

// exports.createInteraction = catchAsync(async (req, res, next) => {
//   const { courseId } = req.params;
//   const studentId = req.user._id;
//   const { interactionType } = req.body;
//   const newInteraction = Interaction.create({
//     course: courseId,
//     student: studentId,
//     interactionType,
//   });
//   await newInteraction.save();
// });
