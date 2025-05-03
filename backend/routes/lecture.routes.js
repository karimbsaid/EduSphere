const lectureController = require("../controllers/lecture.controller");
const express = require("express");
const auth = require("../middleware/auth");
const router = express.Router({ mergeParams: true });

router.post("/", auth.protect, lectureController.createLecture);

router.patch("/:lectureId", auth.protect, lectureController.updateLecture);

router.delete("/:lectureId", auth.protect, lectureController.deleteLecture);

router.get("/:lectureId", lectureController.getLecture);
module.exports = router;
