const Course = require("./course.models");
const mongoose = require("mongoose");
const {
  deleteResourceFromCloudinary,
  getPublicId,
} = require("../utils/cloudinaryService");
const resourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  resourceUrl: String,
  draftVersion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Lecture",
    default: null,
  },
});

resourceSchema.statics.deleteResource = async function (resourceId) {
  const resource = await this.findById(resourceId);
  const publicId = getPublicId(resource.resourceUrl);
  await deleteResourceFromCloudinary(publicId, "image");

  await resource.deleteOne();
  return true;
};

module.exports = mongoose.model("Resource", resourceSchema);
