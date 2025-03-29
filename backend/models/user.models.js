const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Veuillez entrer votre nom"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Veuillez fournir un email"],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "Email invalide"],
    },
    password: {
      type: String,
      required: [true, "Veuillez choisir un mot de passe"],
      minlength: 8,
      select: false,
    },
    role: {
      type: String,
      enum: ["student", "instructor", "admin"],
      default: "student",
    },
    additionalDetails: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserDetails",
    },
    createdAt: {
      type: Date,
      default: Date.now,
      select: false,
    },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

userSchema.virtual("courses", {
  ref: "Course",
  localField: "_id",
  foreignField: "instructor",
  options: {
    populate: {
      path: "sections",
      select: "title lectures",
    },
  },
});

module.exports = mongoose.model("User", userSchema);
