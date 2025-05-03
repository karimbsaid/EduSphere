const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const profileController = require("../controllers/profile.controller");
const courseController = require("../controllers/course.controller");
const userController = require("../controllers/user.controller");
router.get("/", auth.protect, userController.getAllUsers);
router.patch("/update-me", auth.protect, profileController.updateProfile);

router.post(
  "/",
  auth.protect,
  auth.restrictTo("admin"),
  userController.addUser
);
router.patch(
  "/:userId",
  auth.protect,
  auth.restrictTo("admin"),
  userController.editUser
);
router.delete(
  "/:userId",
  auth.protect,
  auth.restrictTo("admin"),
  userController.deleteUser
);

router.use(auth.protect);
router.get("/me", profileController.getMe);
router.get("/me/my-courses", auth.protect, courseController.getMyCourses);
router.get(
  "/me/my-students",
  auth.protect,
  auth.restrictTo("Instructor"),
  userController.getListOfMyStudents
);
router.get("/me/my-enrolled-courses", profileController.getMyEnrolledCourses);
module.exports = router;
