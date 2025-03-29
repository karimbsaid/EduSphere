const jwt = require("jsonwebtoken");
const User = require("../models/user.models");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const Course = require("../models/course.models");
exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) return next(new AppError("Veuillez vous connecter", 401));

  const decoded = jwt.verify(token, process.env.SECRET_KEY);
  const user = await User.findById(decoded.id).select("+photo");
  if (!user) return next(new AppError("Utilisateur non trouvé", 404));

  req.user = user;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError("Action non autorisée", 403));
    }
    next();
  };
};

exports.checkInstructor = catchAsync(async (req, res, next) => {
  const course = await Course.findById(req.params.courseId);
  if (course.instructor._id.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Accès refusé" });
  }
  next();
});

exports.sanitizeCourseResponse = (isEditRoute) => (req, res, next) => {
  res.locals.isEditRoute = isEditRoute;
  next();
};

exports.optionalProtect = catchAsync(async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) return next();

  const decoded = jwt.verify(token, process.env.SECRET_KEY);
  const user = await User.findById(decoded.id).select("+photo");
  if (!user) return next(new AppError("Utilisateur non trouvé", 404));

  req.user = user;
  next();
});
