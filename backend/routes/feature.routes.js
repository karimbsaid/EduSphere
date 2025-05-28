const express = require("express");
const router = express.Router();
const featureController = require("../controllers/feature.controller");

router.get("/", featureController.getAllFeatures);
router.post("/", featureController.createFeature);
router.patch("/:id", featureController.updateFeature);
router.delete("/:id", featureController.deleteFeature);
module.exports = router;
