const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const profileController = require("../controllers/profile.controller");

router.use(auth.protect);
router.get("/me", profileController.getMe);
module.exports = router;
