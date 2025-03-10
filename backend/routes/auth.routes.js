const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");

router.post("/register", authController.signin);
router.post("/login", authController.login);
router.post("/forgetpassword", authController.forgotPassword);
router.post("/resetPassword/:resetToken", authController.resetPassword);
module.exports = router;
