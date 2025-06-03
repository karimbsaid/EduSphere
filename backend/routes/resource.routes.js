const express = require("express");
const router = express.Router({ mergeParams: true });
const resourceController = require("../controllers/resource.controller");
const courseMiddleware = require("../middleware/courseMiddleware");
const Course = require("../models/course.models");
const Ressource = require("../models/resource.models");
const Enrollment = require("../models/enrollment.model");
const auth = require("../middleware/auth");
router.post(
  "/",
  auth.protect,
  courseMiddleware.getDocumentById({
    model: courseMiddleware,
    paramIdKey: "courseId",
    reqKey: "course",
  }),
  courseMiddleware.checkOwnership,
  resourceController.addResource
);
router.patch(
  "/:resourceId",
  auth.protect,
  courseMiddleware.getDocumentById({
    model: Course,
    paramIdKey: "courseId",
    reqKey: "course",
  }),
  courseMiddleware.checkOwnership,
  courseMiddleware.getDocumentById({
    model: Ressource,
    paramIdKey: "resourceId",
    reqKey: "ressource",
  }),
  resourceController.updateResource
);
router.get(
  "/",
  auth.protect,

  courseMiddleware.getDocumentByQuery({
    model: Enrollment,
    buildQuery: (req) => ({
      courseId: req.params.courseId,
      studentId: req.user._id,
      paymentStatus: "paid",
    }),
    notFoundMessage: "Vous devez être inscrit à ce cours pour y accéder",
  }),
  resourceController.getResources
);
router.delete("/:resourceId", resourceController.deleteResource);

module.exports = router;
