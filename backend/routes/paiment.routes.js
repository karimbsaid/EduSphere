const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const paimentController = require("../controllers/paiment.controller");
router.get("/verify", paimentController.verify);
router.get(
  "/",
  auth.protect,
  auth.restrictTo("admin", "instructor"),
  paimentController.getAllPaiements
);

router.post("/:courseId", auth.protect, paimentController.pay);
module.exports = router;
