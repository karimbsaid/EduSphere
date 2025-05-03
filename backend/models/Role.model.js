// models/role.model.js
const mongoose = require("mongoose");
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
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
roleSchema.virtual("permissions", {
  ref: "Permission",
  localField: "_id",
  foreignField: "role",
});

module.exports = mongoose.model("Role", roleSchema);
