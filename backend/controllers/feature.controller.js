const Feature = require("../models/feature.model");
const factory = require("../controllers/HandleFactory");

exports.getAllFeatures = factory.getAll(Feature);
exports.createFeature = factory.createOne(Feature);
exports.updateFeature = factory.updateOne(Feature);
exports.deleteFeature = factory.deleteOne(Feature);
