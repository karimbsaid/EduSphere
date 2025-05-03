const User = require("../models/user.models");
const UserDetails = require("../models/userDetails.model");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const cloudinary = require("../config/cloudinary");
const Enrollment = require("../models/enrollment.model");
const Course = require("../models/course.models");
const APIFeatures = require("../utils/apiFeatures");
const uploadToCloudinary = async (file, folder) => {
  return await cloudinary.uploader.upload(file.tempFilePath, {
    resource_type: "auto",
    folder,
  });
};
// Get user details
exports.getMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return next(new AppError("Utilisateur non trouvé", 404));
  }

  res.status(200).json({
    status: "success",
    user,
  });
});

// Update user details
exports.updateProfile = catchAsync(async (req, res, next) => {
  console.log(req.body);
  const user = await User.findById(req.user._id).populate("additionalDetails");
  if (!user) {
    return next(new AppError("Utilisateur non trouvé", 404));
  }

  const folder = "users/";
  let imageUrl = user.additionalDetails.photo;

  if (req.files && req.files.avatar) {
    const image = await uploadToCloudinary(req.files.avatar, folder);
    imageUrl = image.secure_url;
  }

  // Update UserDetails fields
  user.additionalDetails.bio = req.body.bio || user.additionalDetails.bio;
  user.additionalDetails.contactNumber =
    req.body.contactNumber || user.additionalDetails.contactNumber;
  user.additionalDetails.photo = imageUrl;

  await user.additionalDetails.save();

  user.name = req.body.name || user.name;
  user.email = req.body.email || user.email;
  await user.save(); // Save updated User

  res.status(200).json({
    status: "success",
    user,
  });
});

exports.getMyCourses = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).populate({
    path: "courses",
    // populate: {
    //   path: "sections", // Populate des sections pour chaque cours
    //   select: "title lectures", // Sélectionne les champs nécessaires de section
    // },
  });
  console.log(user);

  if (!user) {
    return next(new AppError("Utilisateur non trouvé", 404));
  }

  // Utiliser Promise.all pour gérer l'asynchronicité dans le map
  const coursesWithFirstInfo = await Promise.all(
    user.courses.map(async (courseDoc) => {
      // Convertir le document en objet
      const course = courseDoc.toObject();
      const { firstSectionId, firstLectureId } =
        await courseDoc.getFirstSectionAndLecture();
      // Ajouter les propriétés à l'objet
      course.firstSectionId = firstSectionId;
      course.firstLectureId = firstLectureId;
      return course;
    })
  );

  // Remplacer le tableau de cours par la version enrichie
  user.courses = coursesWithFirstInfo;

  res.status(200).json({
    status: "success",
    user,
  });
});

exports.getMyEnrolledCourses = catchAsync(async (req, res, next) => {
  const enrolledCourses = await Enrollment.find({ studentId: req.user._id })
    .populate({
      path: "courseId",
      select: "-instructor -revenu", // Exclusion explicite
      options: { skipInstructor: true },
    })
    .populate("progress");

  res.status(200).json({
    status: "success",
    results: enrolledCourses.length,
    enrolledCourses,
  });
});

// exports.getAllUsers = catchAsync(async (req, res, next) => {
//   const userId = req.user._id;
//   const userRole = req.user.role;

//   let users;
//   const page = req.query.page * 1 || 1;
//   const limit = req.query.limit * 1 || 10;
//   const skip = (page - 1) * limit;
//   let totalDocuments;

//   if (userRole === "admin") {
//     // Admin : Compter tous les utilisateurs
//     totalDocuments = await User.countDocuments();

//     // Utilisation d'APIFeatures pour filtrage et pagination
//     const features = new APIFeatures(User.find(), req.query)
//       .filter()
//       .search()
//       .sort()
//       .limitFields()
//       .paginate();

//     users = await features.query;
//   } else if (userRole === "instructor") {
//     const countResult = await Enrollment.aggregate([
//       {
//         $lookup: {
//           from: "courses",
//           localField: "courseId",
//           foreignField: "_id",
//           as: "course",
//         },
//       },
//       { $unwind: "$course" },
//       { $match: { "course.instructor": userId } },
//       { $count: "total" }, // Compter le nombre total d'inscriptions
//     ]);

//     totalDocuments = countResult.length > 0 ? countResult[0].total : 0;

//     // Aggregation avec pagination
//     users = await Enrollment.aggregate([
//       {
//         $lookup: {
//           from: "users",
//           localField: "studentId",
//           foreignField: "_id",
//           as: "student",
//         },
//       },
//       { $unwind: "$student" },
//       {
//         $lookup: {
//           from: "userdetails",
//           localField: "student.additionalDetails",
//           foreignField: "_id",
//           as: "additionalDetail",
//         },
//       },
//       {
//         $unwind: {
//           path: "$additionalDetail",
//           preserveNullAndEmptyArrays: true,
//         },
//       },
//       {
//         $lookup: {
//           from: "courses",
//           localField: "courseId",
//           foreignField: "_id",
//           as: "course",
//         },
//       },
//       { $unwind: "$course" },
//       { $match: { "course.instructor": userId } },
//       {
//         $project: {
//           _id: "$student._id",
//           name: "$student.name",
//           email: "$student.email",
//           role: "$student.role",
//           additionalDetail: 1,
//           dateInscription: "$enrolledAt",
//         },
//       },
//       { $skip: skip },
//       { $limit: limit },
//     ]);
//   } else {
//     return res.status(403).json({ message: "Accès non autorisé" });
//   }

//   res.json({
//     totalDocuments,
//     currentPage: page,
//     users,
//   });
// });

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const userRole = req.user.role;

  let filterUser = {};

  if (userRole === "instructor") {
    // Récupérer les cours de l'instructeur
    const instructorCourses = await Course.find({ instructor: userId })
      .select("_id")
      .lean();

    const courseIds = instructorCourses.map((course) => course._id);

    // Récupérer les inscriptions associées à ces cours
    const enrollments = await Enrollment.find({ courseId: { $in: courseIds } })
      .select("studentId")
      .lean();

    const studentIds = enrollments.map((en) => en.studentId);

    // Supprimer les doublons
    const uniqueStudentIds = [
      ...new Set(studentIds.map((id) => id.toString())),
    ];

    // Filtrer les utilisateurs avec les IDs des étudiants
    filterUser._id = { $in: uniqueStudentIds };
  }

  const totalDocuments = await User.countDocuments(filterUser);

  // Appliquer les filtres, tri, pagination, etc.
  const features = new APIFeatures(User.find(filterUser), req.query)
    .filter()
    .sort()
    .paginate()
    .limitFields();

  let users = await features.query;

  // Filtrage par recherche (optionnel)
  if (req.query.search && req.query.search.trim() !== "") {
    const searchRegex = new RegExp(req.query.search, "i");
    users = users.filter((user) => searchRegex.test(user.name));
  }

  res.status(200).json({
    status: "success",
    nombreDocuments: users.length,
    totalDocuments,
    users,
  });
});

exports.addUser = catchAsync(async (req, res, next) => {
  const { name, email, password, role, permissions } = req.body;
  const userExiste = await User.findOne({ email });
  if (userExiste) {
    next(new AppError("tu est deja un compte avec ce email"));
  }
  const defaultProfile = await UserDetails.create({});

  const newUser = await User.create({
    name,
    email,
    password,
    role,
    permissions,
    additionalDetails: defaultProfile,
  });
  const userObj = newUser.toObject();
  delete userObj.password;
  delete userObj.email;

  res.status(201).json({
    status: "success",
    user: userObj,
  });
});
