const Course = require("../models/course.models");
const Lecture = require("../models/lecture.models");
const Section = require("../models/section.models");
const Resource = require("../models/resource.models");
const {
  getPublicId,
  deleteResourceFromCloudinary,
} = require("../utils/cloudinaryService");
const fetchCourse = async (courseId, session) => {
  return Course.findById(courseId)
    .populate({
      path: "sections",
      populate: { path: "lectures" },
    })
    .populate("resources")
    .session(session);
};

const updateLecture = async (originalLecture, draftLecture, session) => {
  if (
    originalLecture.type === "video" &&
    originalLecture.url &&
    originalLecture.url !== draftLecture.url
  ) {
    const publicId = getPublicId(originalLecture.url);
    await deleteResourceFromCloudinary(publicId, "video");
  }

  originalLecture.title = draftLecture.title;
  originalLecture.type = draftLecture.type;
  originalLecture.url = draftLecture.url;
  originalLecture.duration = draftLecture.duration;
  originalLecture.questions = draftLecture.questions;
  originalLecture.draftVersion = null;

  await originalLecture.save({ session });
};

const processSection = async (originalSection, draftCourse, session) => {
  if (!originalSection.draftVersion) return originalSection._id;

  const draftSection = draftCourse.sections.find(
    (s) => s._id.toString() === originalSection.draftVersion.toString()
  );

  if (!draftSection) {
    await Section.deleteSectionWithLecture(originalSection._id, session);
    return null;
  }

  originalSection.title = draftSection.title;
  const newLectures = [];

  // Traiter les leçons
  for (const originalLecture of originalSection.lectures) {
    if (!originalLecture.draftVersion) {
      newLectures.push(originalLecture._id);
      continue;
    }

    const draftLecture = draftSection.lectures.find(
      (l) => l._id.toString() === originalLecture.draftVersion.toString()
    );

    if (draftLecture) {
      await updateLecture(originalLecture, draftLecture, session);
      newLectures.push(originalLecture._id);
      draftSection.lectures = draftSection.lectures.filter(
        (l) => l._id.toString() !== draftLecture._id.toString()
      );
      await draftSection.save({ session });
      await Lecture.findByIdAndDelete(draftLecture._id, { session });
    } else {
      await Lecture.deleteLectureWithCloudinary(originalLecture._id, session);
    }
  }

  const newDraftLectures = draftSection.lectures.filter(
    (l) =>
      !originalSection.lectures.some(
        (ol) => ol.draftVersion?.toString() === l._id.toString()
      )
  );
  newLectures.push(...newDraftLectures.map((l) => l._id));

  originalSection.lectures = newLectures;
  originalSection.draftVersion = null;
  await originalSection.save({ session });
  await Section.findByIdAndDelete(draftSection._id, { session });

  return originalSection._id;
};

const updateResources = async (originalCourse, draftCourse, session) => {
  const updatedResources = [];

  for (const draftResource of draftCourse.resources) {
    const existingResource = originalCourse.resources.find(
      (r) => r._id.toString() === draftResource._id.toString()
    );

    if (existingResource) {
      // Mettre à jour la ressource existante
      existingResource.title = draftResource.title;
      existingResource.resourceUrl = draftResource.resourceUrl;
      await existingResource.save({ session });
      updatedResources.push(existingResource._id);
    } else {
      // Créer une nouvelle ressource
      const newResource = await Resource.create(
        [
          {
            title: draftResource.title,
            resourceUrl: draftResource.resourceUrl,
          },
        ],
        { session }
      );
      updatedResources.push(newResource[0]._id);
    }

    // Supprimer la ressource brouillon
    await Resource.deleteResource(draftResource._id, session);
  }

  return updatedResources;
};

const mergeCourseUpdates = async (draftCourseId, originalCourseId, session) => {
  // Étape 1 : Récupérer les cours
  const [originalCourse, draftCourse] = await Promise.all([
    fetchCourse(originalCourseId, session),
    fetchCourse(draftCourseId, session),
  ]);

  if (!originalCourse || !draftCourse) {
    throw new Error(ERRORS.COURSE_NOT_FOUND);
  }

  // Étape 2 : Construire la nouvelle liste de sections
  const newSections = [];

  // Traiter les sections originales
  for (const originalSection of originalCourse.sections) {
    const sectionId = await processSection(
      originalSection,
      draftCourse,
      session
    );
    if (sectionId) newSections.push(sectionId);
  }

  // Scénario 4 : Ajouter les nouvelles sections
  const newDraftSections = draftCourse.sections.filter(
    (s) =>
      !originalCourse.sections.some(
        (os) => os.draftVersion?.toString() === s._id.toString()
      )
  );
  newSections.push(...newDraftSections.map((s) => s._id));

  // Étape 3 : Mettre à jour les ressources
  originalCourse.resources = await updateResources(
    originalCourse,
    draftCourse,
    session
  );

  originalCourse.sections = newSections;
  originalCourse.description = draftCourse.description;
  originalCourse.imageUrl = draftCourse.imageUrl;
  originalCourse.level = draftCourse.level;
  originalCourse.price = draftCourse.price;
  originalCourse.category = draftCourse.category;
  originalCourse.tags = draftCourse.tags;
  originalCourse.totalDuration = draftCourse.totalDuration;
  originalCourse.status = "published";
  originalCourse.updatedVersionId = null;
  await originalCourse.save({ session });

  await Course.findByIdAndDelete(draftCourseId, { session });

  return originalCourse;
};

module.exports = mergeCourseUpdates;
