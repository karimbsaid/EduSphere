const mongoose = require("mongoose");
const {
  getPublicId,
  deleteResourceFromCloudinary,
} = require("../utils/cloudinaryService");

const userDetailsSchema = new mongoose.Schema({
  photo: {
    type: String,
    default: `${process.env.BASE_URL}/images/avatar.jpg`,
  },
  bio: { type: String, default: "---" },
  contactNumber: {
    type: Number,
    trim: true,
    default: 0,
  },
});

userDetailsSchema.pre("deleteOne", async function (next) {
  const doc = await this.model.findOne(this.getQuery());
  const publicId = getPublicId(doc.photo);
  const res = await deleteResourceFromCloudinary(publicId, "image");
  next();
});

module.exports = mongoose.model("UserDetails", userDetailsSchema);
