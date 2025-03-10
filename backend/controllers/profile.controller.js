const User = require("../models/user.models");
const UserDetails = require("../models/userDetails.model");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const cloudinary = require("../config/cloudinary");

const uploadToCloudinary = async (file, folder) => {
  return await cloudinary.uploader.upload(file.tempFilePath, {
    resource_type: "auto",
    folder,
  });
};
// Get user details
exports.getMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id)
    .populate("additionalDetails")
    .select("-password -passwordResetToken -passwordResetExpires");

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
  const user = await User.findById(req.user._id).populate("additionalDetails");
  if (!user) {
    return next(new AppError("Utilisateur non trouvé", 404));
  }
  const folder = "users/";
  let imageUrl = "";

  if (req.files && req.files.avatar) {
    const image = await uploadToCloudinary(req.files.avatar, folder);
    imageUrl = image.secure_url;
  }
  const profile = await UserDetails.findByIdAndUpdate(
    user.additionalDetails._id,
    { ...req.body, photo: imageUrl },
    { new: true, runValidators: true }
  );
  res.status(200).json({
    status: "success",
    data: profile,
  });
});
