const User = require("../models/user.models");
const UserDetails = require("../models/userDetails.model");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const cloudinary = require("../config/cloudinary");
const Enrollment = require("../models/enrollment.model");
const uploadToCloudinary = async (file, folder) => {
  return await cloudinary.uploader.upload(file.tempFilePath, {
    resource_type: "auto",
    folder,
  });
};
// Get user details
exports.getMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).populate("additionalDetails");

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
