const User = require("../models/user.models");
const UserDetails = require("../models/userDetails.model");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const cloudinary = require("../config/cloudinary");
const Enrollment = require("../models/enrollment.model");
const Course = require("../models/course.models");
const APIFeatures = require("../utils/apiFeatures");
const Role = require("../models/Role.model");

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const userRole = req.user.role;

  let filterUser = {};

  if (userRole === "Instructor") {
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

  // Handle role filtering by role name
  if (req.query.role) {
    console.log(req.query.role);
    const role = await Role.findOne({ name: req.query.role }).select("_id");
    console.log("role", role);
    if (role) {
      filterUser.role = role._id;
    }
    delete req.query.role;
  }
  console.log(await User.find(filterUser));
  const totalDocuments = await User.countDocuments(filterUser);

  // Apply filters, sorting, pagination, etc.
  const features = new APIFeatures(
    User.find(filterUser).populate("role"),
    req.query
  )
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
  console.log(req.body);
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

exports.blockUser = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
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
  const { userId } = req.params;
  const user = User.findById(userId);
  if (!user) return next(new AppError("user pas trouvée", 404));
  await user.deleteOne();
  res.status(204).json({ status: "success", message: "user deleted" });
});

exports.getListOfMyStudents = catchAsync(async (req, res, next) => {
  const userId = req.user._id;

  // 1. Récupérer les cours créés par l'instructeur
  const instructorCourses = await Course.find({ instructor: userId })
    .select("_id")
    .lean();
  const courseIds = instructorCourses.map((course) => course._id);
  const filter = { courseId: { $in: courseIds } };

  // 2. Appliquer les filtres (hors recherche)
  const features = new APIFeatures(Enrollment.find(filter), req.query)
    .filter()
    .sort()
    .paginate()
    .limitFields();

  // 3. Récupérer les étudiants (avec les populate)
  let students = await features.query
    .populate({ path: "studentId", select: "name email" })
    .populate({ path: "courseId", select: "title" })
    .populate({ path: "progress", select: "progressPercentage" });

  // 4. Filtrer les résultats en mémoire si une recherche est demandée
  if (req.query.search) {
    const search = req.query.search.toLowerCase();
    students = students.filter(
      (item) =>
        item.studentId &&
        (item.studentId.name.toLowerCase().includes(search) ||
          item.studentId.email.toLowerCase().includes(search))
    );
  }

  // 5. Trier en mémoire si besoin
  if (req.query.sort === "-student") {
    students.sort((a, b) => b.studentId.name.localeCompare(a.studentId.name));
  } else if (req.query.sort === "-cour") {
    students.sort((a, b) => b.courseId.title.localeCompare(a.courseId.title));
  }

  // 6. Total des documents avant pagination
  const totalDocuments = await Enrollment.countDocuments(filter);

  // 7. Réponse finale
  res.status(200).json({
    status: "success",
    nombreDocuments: students.length,
    totalDocuments,
    students,
  });
});
