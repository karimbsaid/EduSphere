const express = require("express");
const router = express.Router({ mergeParams: true });
const resourceController = require("../controllers/resource.controller");
const auth = require("../middleware/auth");
router.post("/", auth.protect, resourceController.addResource);
router.patch("/:resourceId", auth.protect, resourceController.updateResource);
router.get("/", resourceController.getResources);
router.delete("/:resourceId", resourceController.deleteResource);

module.exports = router;
