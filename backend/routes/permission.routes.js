const express = require("express");
const router = express.Router();
const permissionController = require("../controllers/permission.controller");
router.get("/role/:roleId", permissionController.getPermissionsByRole);
router.patch("/", permissionController.updatePermission);
module.exports = router;
