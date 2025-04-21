const User = require("../models/user.models");
const UserDetails = require("../models/userDetails.model");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const cloudinary = require("../config/cloudinary");
const Enrollment = require("../models/enrollment.model");
const Course = require("../models/course.models");
const APIFeatures = require("../utils/apiFeatures");
exports.getAllUsers = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const userRole = req.user.role;

  let filterUser = {};

  if (userRole === "instructor") {
    const instructorCourses = await Course.find({ instructor: userId })
      .select("_id")
      .lean();

    const courseIds = instructorCourses.map((course) => course._id);

    const enrollments = await Enrollment.find({ courseId: { $in: courseIds } })
      .select("studentId")
      .lean();

    const studentIds = enrollments.map((en) => en.studentId);

    const uniqueStudentIds = [
      ...new Set(studentIds.map((id) => id.toString())),
    ];

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
  console.log(name, email, password, role, permissions);
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

exports.editUser = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const userExiste = await User.findById(userId);
  if (!userExiste) {
    next(new AppError("aucune compte associé "));
  }

  const user = await User.findByIdAndUpdate(userId, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(201).json({
    status: "success",
    user,
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  console.log("deleted");
  const { userId } = req.params;
  console.log(userId);
  const user = User.findById(userId);
  if (!user) return next(new AppError("user pas trouvée", 404));
  await user.deleteOne();
  console.log("succes deleted");
  res.status(204).json({ status: "success", message: "user deleted" });
});
