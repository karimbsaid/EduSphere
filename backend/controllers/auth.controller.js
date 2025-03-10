const User = require("../models/user.models");
const jwt = require("jsonwebtoken");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("../utils/appError");
const crypto = require("crypto");
const Email = require("../utils/emailService");
const UserDetails = require("../models/userDetails.model");
const signToken = (id) => {
  return jwt.sign({ id }, process.env.SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signin = catchAsync(async (req, res, next) => {
  const { name, email, password, role = "student" } = req.body;
  const userExiste = await User.findOne({ email });
  if (userExiste) {
    next(new AppError("tu est deja un compte avec ce email"));
  }

  const defaultProfile = await UserDetails.create({});
  const user = await User.create({
    name,
    email,
    password,
    role,
    additionalDetails: defaultProfile._id,
  });

  const token = signToken(user._id);

  res.status(201).json({
    status: "success",
    token,
    user: userExiste,
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password)
    return next(new AppError("please provide email and password", 400));
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }
  user.password = undefined;
  const token = signToken(user._id);

  res.status(201).json({
    status: "success",
    token,
    user,
  });
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user)
    return next(new AppError("Aucun utilisateur avec cet email.", 404));

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  try {
    const resetURL = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/auth/resetPassword/${resetToken}`;

    await new Email(user, resetURL).sendPasswordResetToken();

    res.status(200).json({
      status: "success",
      message: "Token envoyé par email !",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        "Erreur lors de l'envoi de l'email. Réessayez plus tard !",
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) return next(new AppError("Token invalide ou expiré", 400));

  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  const token = signToken(user._id);
  res.status(200).json({ status: "success", token });
});
