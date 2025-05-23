const Course = require("../models/course.models");
const Resource = require("../models/resource.models");
const catchAsync = require("../utils/catchAsync");
const CloudinaryStorage = require("../services/cloudinaryStorage");
const cloudinary = require("../config/cloudinary");
const storage = new CloudinaryStorage(cloudinary);

const slugify = require("slugify");

exports.addResource = catchAsync(async (req, res, next) => {
  const { title } = req.body;
  const { courseId } = req.params;

  const folder = `courses/resources`;
  let resourceUrl = "";

  if (req.files && req.files.resourceFile) {
    const result = await storage.upload(req.files.resourceFile, folder);
    resourceUrl = result.secure_url;
  }
  const resource = await Resource.create({ title, resourceUrl });
  await resource.save();
  await Course.findByIdAndUpdate(
    courseId,
    {
      $addToSet: { resources: resource._id },
    },
    { new: true }
  );

  res.status(201).json({ message: "Ressource ajoutée avec succès", resource });
});

exports.updateResource = catchAsync(async (req, res, next) => {
  const { resourceId } = req.params;
  const { title } = req.body;
  const resource = await Resource.findById(resourceId);
  let resourceUrl = "";
  if (req.files && req.files.resourceFile) {
    // const decodedImageUrl = decodeURIComponent(resource.resourceUrl);
    // const parts = decodedImageUrl.split("/upload/")[1].split("/");
    // const relevantParts = parts.slice(1).join("/");
    // const publicId = relevantParts.split(".").slice(0, -1).join(".");
    const folder = `courses/resources`;

    // const res = await deleteResourceFromCloudinary(publicId);
    // const file = await uploadToCloudinary(req.files.resourceFile, folder);
    const file = await storage.updateFile({
      file: req.files.resourceFile,
      existingUrl: resource.resourceUrl,
      assetFolder: folder,
    });
    resourceUrl = file.secure_url;
  }

  const updatedResource = await Resource.findByIdAndUpdate(
    resourceId,
    { title, resourceUrl },
    { new: true }
  );

  if (!resource) {
    return res.status(404).json({ message: "Ressource non trouvée" });
  }

  res.json({ message: "Ressource mise à jour avec succès", updatedResource });
});

exports.deleteResource = catchAsync(async (req, res, next) => {
  const { courseId, resourceId } = req.params;

  const resource = await Resource.findById(resourceId);
  const course = await Course.findById(courseId).populate("resources");
  await Resource.deleteResource(resourceId);

  if (!resource) {
    return res.status(404).json({ message: "Ressource non trouvée" });
  }

  course.resources.pull(resourceId);
  await course.save();

  res.json({ message: "Ressource supprimée avec succès" });
});

exports.getResources = catchAsync(async (req, res, next) => {
  const resources = await Course.getCourseResources(req.params.courseId);
  res.json(resources);
});
