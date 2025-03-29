const express = require("express");
const router = express.Router({ mergeParams: true });
const auth = require("../middleware/auth");
const enrollmentController = require("../controllers/enrollment.controller");
router.post("/:courseId/enroll", auth.protect, enrollmentController.enroll);
router.get(
  "/:courseId/my-progress",
  auth.protect,
  enrollmentController.isEnrolled,
  enrollmentController.getProgress
);

router.patch(
  "/:courseId/section/:sectionId/lecture/:lectureId/update-progress",
  auth.protect,
  enrollmentController.isEnrolled,
  enrollmentController.updateProgress
);

module.exports = router;

// router.get(
//   "/my-enrolled-courses",
//   auth.protect,
//   enrollmentController.getMyEnrolledCourse
// );
// router.get(
//   "/my-enrolled-stats",
//   auth.protect,
//   enrollmentController.getStatistique
// );

// router.post(
//   "/interaction/:courseId",
//   auth.protect,
//   enrollmentController.createInteraction
// );
