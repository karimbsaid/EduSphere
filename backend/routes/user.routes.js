const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const profileController = require("../controllers/profile.controller");

router.use(auth.protect);
router.get("/me", profileController.getMe);
router.get("/me/my-courses", profileController.getMyCourses);
router.get("/me/my-enrolled-courses", profileController.getMyEnrolledCourses);

router.patch("/update-me", profileController.updateProfile);
module.exports = router;
