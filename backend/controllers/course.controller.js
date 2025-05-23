const Course = require("../models/course.models");
const Enrollment = require("../models/enrollment.model");
const Lecture = require("../models/lecture.models");
const Section = require("../models/section.models");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const slugify = require("slugify");
const APIFeatures = require("../utils/apiFeatures");
const User = require("../models/user.models");
const { createInteraction } = require("../utils/interactionService");
const Resource = require("../models/resource.models");
const mongoose = require("mongoose");
const Role = require("../models/Role.model");
const {
  uploadToCloudinary,
  handleCloudinaryFileUpdate,
} = require("../utils/cloudinaryService");
const courseService = require("../services/courseService");

const factory = require("./HandleFactory");
const CloudinaryStorage = require("../services/cloudinaryStorage");
const cloudinary = require("../config/cloudinary");
const storage = new CloudinaryStorage(cloudinary);

// get populaire courses for guest page
exports.getTopPopularCourses = (req, res, next) => {
  req.query.limit = "5";
  req.query.sort = "-totalStudents";
  next();
};

//get managed cours pour cour sachbord for admin and instructor
exports.getManagedCours = (req, res, next) => {
  const userId = req.user._id;
  const userRole = req.user.role.name;

  let courseFilter = {};

  if (userRole === "Instructor") {
    courseFilter = {
      $or: [
        { instructor: userId, parentCourseId: null },
        { instructor: userId, parentCourseId: { $ne: null } },
      ],
    };
  }

  return factory.getAll(
    Course,
    courseFilter,
    {
      path: "instructor",
      select: "name additionalDetails",
    },
    ["title", "description", "category", "tags"]
  )(req, res, next);
};
exports.getManagedCoursDetail = factory.getOne(Course, "courseId", [
  {
    path: "sections",
    populate: {
      path: "lectures",
    },
  },
  { path: "instructor" },
  {
    path: "resources",
  },
]);
exports.getAllCourses = catchAsync(async (req, res, next) => {
  const userId = req.user?._id;

  if (req.query.search && userId) {
    await createInteraction(userId, "search", req.query.search);
  }

  return factory.getAll(
    Course,
    {},
    {
      path: "instructor",
      select: "name additionalDetails",
    },
    ["title", "description", "category", "tags"]
  )(req, res, next);
});

//get course details by id
exports.getCourseDetails = catchAsync(async (req, res, next) => {
  const { courseId } = req.params;

  const popOptions = [
    {
      path: "sections",
      populate: {
        path: "lectures",
        select: "-url -questions",
      },
    },
    { path: "instructor" },
    {
      path: "resources",
      select: "-resourceUrl",
    },
  ];

  const course = await factory.getOneDoc(Course, courseId, popOptions);

  if (!course) return;

  if (req.user && req.user._id && course.tags?.length > 0) {
    await Promise.all(
      course.tags.map((tag) => createInteraction(req.user._id, "view", tag))
    );
  }

  res.status(200).json({ status: "success", course });
});

// Création d'un cours

exports.createCourse = catchAsync(async (req, res, next) => {
  let imageUrl = "";
  let assetFolder = "";

  if (req.files?.coverImage) {
    // const uploadedImage = await uploadToCloudinary(
    //   req.files.coverImage,
    //   `courses/${req.body.slug}`
    // );
    const uploadedImage = await storage.upload(
      req.files.coverImage,
      `courses/${req.body.slug}`
    );
    imageUrl = uploadedImage.secure_url;
    assetFolder = uploadedImage.asset_folder;
  }

  const course = await Course.create({
    ...req.body,
    imageUrl,
    assetFolder,
    instructor: req.user._id,
  });

  res.status(201).json({
    status: "success",
    data: course,
  });
});

// exports.createCourseUpdate = catchAsync(async (req, res, next) => {
//   const { courseId } = req.params;
//   const user = req.user;

//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const originalCourse = await Course.findById(courseId)
//       .populate({
//         path: "sections",
//         populate: { path: "lectures" },
//       })
//       .populate("resources")
//       .session(session);
//     if (!originalCourse) {
//       return next(new AppError("Cours non trouvé", 404));
//     }

//     if (originalCourse.instructor.toString() !== user._id.toString()) {
//       return next(
//         new AppError("Vous n’êtes pas autorisé à modifier ce cours", 403)
//       );
//     }
//     if (originalCourse.status !== "published") {
//       return next(new AppError("Ce cours n’est pas publié", 400));
//     }
//     if (originalCourse.updatedVersionId) {
//       return next(new AppError("Une mise à jour est déjà en cours", 400));
//     }

//     // Créer de nouvelles leçons pour chaque section
//     const newSections = [];
//     for (const originalSection of originalCourse.sections) {
//       const newLectures = [];
//       for (const originalLecture of originalSection.lectures) {
//         const newLecture = await Lecture.create(
//           [
//             {
//               title: originalLecture.title,
//               type: originalLecture.type,
//               url: originalLecture.url,
//               duration: originalLecture.duration,
//               questions: originalLecture.questions,
//             },
//           ],
//           { session }
//         );
//         originalLecture.draftVersion = newLecture[0]._id;
//         await originalLecture.save({ session });
//         newLectures.push(newLecture[0]._id);
//       }

//       const newSection = await Section.create(
//         [{ title: originalSection.title, lectures: newLectures }],
//         { session }
//       );
//       originalSection.draftVersion = newSection[0]._id;
//       await originalSection.save({ session });
//       newSections.push(newSection[0]._id);
//     }

//     const newResources = [];
//     for (const originalResource of originalCourse.resources) {
//       const newResource = await Resource.create(
//         [
//           {
//             title: originalResource.title,
//             resourceUrl: originalResource.resourceUrl,
//           },
//         ],
//         { session }
//       );
//       newResources.push(newResource[0]._id);
//     }

//     // Créer le cours brouillon
//     const draftCourseData = {
//       title: `${originalCourse.title} (brouillon)`,
//       description: originalCourse.description,
//       imageUrl: originalCourse.imageUrl,
//       status: "draft",
//       level: originalCourse.level,
//       price: originalCourse.price,
//       category: originalCourse.category,
//       tags: originalCourse.tags,
//       instructor: originalCourse.instructor,
//       totalStudents: 0,
//       totalStudentComplete: 0,
//       totalDuration: originalCourse.totalDuration,
//       sections: newSections,
//       resources: newResources,
//       assetFolder: originalCourse.assetFolder,
//       parentCourseId: originalCourse._id,
//       slug: `${originalCourse.slug}-draft-${Date.now()}`,
//     };

//     const draftCourse = await Course.create([draftCourseData], { session });
//     originalCourse.updatedVersionId = draftCourse[0]._id;
//     await originalCourse.save({ session });

//     await session.commitTransaction();
//     res.status(201).json({ status: "success", data: draftCourse[0] });
//   } catch (error) {
//     await session.abortTransaction();
//     return next(error);
//   } finally {
//     session.endSession();
//   }
// });

//creer un cour brouillon
exports.createCourseUpdate = catchAsync(async (req, res, next) => {
  const { courseId } = req.params;
  const userId = req.user._id;
  console.log("hello");
  const draftCourse = await courseService.createCourseUpdate(courseId, userId);
  console.log("draftCourse", draftCourse);

  res.status(201).json({ status: "success", data: draftCourse });
});

// Mise à jour d'un cours
exports.updateCourse = catchAsync(async (req, res, next) => {
  const { courseId } = req.params;
  const course = req.course;
  if (req.files && req.files.coverImage) {
    // const imageUrl = await handleCloudinaryFileUpdate({
    //   file: req.files.coverImage,
    //   existingUrl: course.imageUrl,
    //   assetFolder: course.assetFolder,
    //   type: "image",
    // });

    const imageUrl = await storage.updateFile({
      file: req.files.coverImage,
      existingUrl: course.imageUrl,
      assetFolder: course.assetFolder,
      type: "image",
    });

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
  const course = req.course;
  if (course.parentCourseId) {
    const originalCourse = await Course.findById(course.parentCourseId);
    if (originalCourse) {
      originalCourse.updatedVersionId = null;
      await originalCourse.save();
    }
  }
  await Course.deleteCourse(courseId);

  res.status(204).json({ status: "success", message: "Course deleted" });
});

//get statistic for guests
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

  const instructorRole = await Role.findOne({ name: "Instructor" });
  const studentRole = await Role.findOne({ name: "student" });

  const totalInstructors = instructorRole
    ? await User.countDocuments({ role: instructorRole._id })
    : 0;

  const totalStudents = studentRole
    ? await User.countDocuments({ role: studentRole._id })
    : 0;

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
