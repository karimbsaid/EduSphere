// models/role.model.js
const mongoose = require("mongoose");
const Permission = require("./permission.model");
const User = require("./user.models");
require("./permission.model");
const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
roleSchema.virtual("permissions", {
  ref: "Permission",
  localField: "_id",
  foreignField: "role",
});

roleSchema.pre("findOneAndDelete", async function (next) {
  const roleToDelete = await this.model.findOne(this.getFilter());

  if (roleToDelete) {
    await Permission.deleteMany({ role: roleToDelete._id });

    await User.updateMany({ role: roleToDelete._id }, { $set: { role: null } });
  }

  next();
});

module.exports = mongoose.model("Role", roleSchema);
