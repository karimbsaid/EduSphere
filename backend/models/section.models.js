const mongoose = require("mongoose");
const Lecture = require("./lecture.models");

const sectionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Le titre de la section est requis"],
    trim: true,
  },
  lectures: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lecture",
    },
  ],
  draftVersion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Section",
    default: null, // Référence à la version copiée (si elle existe)
  },
});

// sectionSchema.pre(
//   "deleteOne",

//   async function (next) {
//     try {
//       console.log("iam called");
//       await Lecture.deleteMany({ _id: { $in: this.lectures } });
//       next();
//     } catch (error) {
//       next(error);
//     }
//   }
// );

sectionSchema.statics.deleteSectionWithLecture = async function (sectionId) {
  const section = await this.findById(sectionId);
  if (!section) {
    throw new Error("Section not found");
  }

  console.log("Section trouvée :", section);

  for (const lectureId of section.lectures) {
    await Lecture.deleteLectureWithCloudinary(lectureId);
  }

  await section.deleteOne();
};

module.exports = mongoose.model("Section", sectionSchema);
