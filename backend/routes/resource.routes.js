const express = require("express");
const router = express.Router({ mergeParams: true });
const resourceController = require("../controllers/resource.controller");

router.post("/", resourceController.addResource);
router.patch("/:resourceId", resourceController.updateResource);
router.get("/", resourceController.getResources);
router.delete("/:resourceId", resourceController.deleteResource);

module.exports = router;
