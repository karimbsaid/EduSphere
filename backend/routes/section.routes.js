const courseController = require("../controllers/course.controller");
const express = require("express");
const router = express.Router({ mergeParams: true });
const lectureRouter = require("./lecture.routes");

router.post("/", courseController.createSection);

router.patch("/:sectionId", courseController.updateSection);

router.delete("/:sectionId", courseController.deleteSection);
router.use("/:sectionId/lectures", lectureRouter);

module.exports = router;
