// models/feature.model.js
const mongoose = require("mongoose");
const Permission = require("./permission.model");

const featureSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
});

featureSchema.pre("findOneAndDelete", async function (next) {
  const featureToDelete = await this.model.findOne(this.getFilter());

  if (featureToDelete) {
    await Permission.deleteMany({ feature: featureToDelete._id });
  }

  next();
});

module.exports = mongoose.model("Feature", featureSchema);
