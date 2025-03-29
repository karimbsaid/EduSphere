const express = require("express");
const router = express.Router({ mergeParams: true });
const auth = require("../middleware/auth");
const reviewController = require("../controllers/review.controller");

router.get("/", reviewController.getCourseReviews);
router.post("/", auth.protect, reviewController.addReview);

module.exports = router;
