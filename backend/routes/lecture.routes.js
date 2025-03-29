const courseController = require("../controllers/course.controller");
const express = require("express");
const router = express.Router({ mergeParams: true });

router.post("/", courseController.createLecture);

router.patch("/:lectureId", courseController.updateLecture);

router.delete("/:lectureId", courseController.deleteLecture);

router.get("/:lectureId", courseController.getLecture);
module.exports = router;
