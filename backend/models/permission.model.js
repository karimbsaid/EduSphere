// models/permission.model.js
const mongoose = require("mongoose");

const permissionSchema = new mongoose.Schema({
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Role",
    required: true,
  },
  feature: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Feature",
    required: true,
  },
  authorized: {
    type: Boolean,
    required: true,
  },
});
permissionSchema.statics.isAuthorized = async function (roleId, featureId) {
  const permission = await this.findOne({ role: roleId, feature: featureId });
  return permission && permission.authorized;
};
module.exports = mongoose.model("Permission", permissionSchema);
