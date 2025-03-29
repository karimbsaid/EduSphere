const mongoose = require("mongoose");

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

module.exports = mongoose.model("UserDetails", userDetailsSchema);
