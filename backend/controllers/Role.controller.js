const Role = require("../models/Role.model");
const factory = require("../controllers/HandleFactory");

exports.getAllRoles = factory.getAll(Role, {}, "permissions");
exports.createRole = factory.createOne(Role);
exports.updateRole = factory.updateOne(Role);
exports.deleteRole = factory.deleteOne(Role);
