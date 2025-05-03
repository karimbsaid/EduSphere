const sectionController = require("../controllers/section.controller");
const express = require("express");
const router = express.Router({ mergeParams: true });
const lectureRouter = require("./lecture.routes");
const auth = require("../middleware/auth");

router.post("/", auth.protect, sectionController.createSection);

router.patch("/:sectionId", auth.protect, sectionController.updateSection);

router.delete("/:sectionId", auth.protect, sectionController.deleteSection);
router.use("/:sectionId/lectures", lectureRouter);

module.exports = router;
