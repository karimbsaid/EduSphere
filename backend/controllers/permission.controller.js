const Permission = require("../models/permission.model");
const factory = require("../controllers/HandleFactory");

exports.getPermissionsByRole = async (req, res) => {
  const permissions = await Permission.find({
    role: req.params.roleId,
  });
  res.json(permissions);
};

exports.updatePermission = async (req, res) => {
  console.log("okkk");
  const { roleId, featureId, authorized } = req.body;

  const permission = await Permission.findOneAndUpdate(
    { role: roleId, feature: featureId },
    { authorized },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  res.json(permission);
};
