const express = require("express");
const router = express.Router({ mergeParams: true });
const permissionRouter = require("./permission.routes");

const roleController = require("../controllers/Role.controller");
router.use("/permissions", permissionRouter);

router.get("/", roleController.getAllRoles);
router.post("/", roleController.createRole);
router.patch("/:id", roleController.updateRole);
router.delete("/:id", roleController.deleteRole);

module.exports = router;
