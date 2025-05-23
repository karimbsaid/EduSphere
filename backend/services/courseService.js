const Course = require("../models/course.models");
const Section = require("../models/section.models");
const Lecture = require("../models/lecture.models");
const Resource = require("../models/resource.models");
const AppError = require("../utils/appError");
const mongoose = require("mongoose");

exports.createCourseUpdate = async (courseId, userId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const course = await loadAndValidateCourse(courseId, userId, session);
    console.log("course", course);

    const newSections = await cloneSections(course.sections, session);
    const newResources = await cloneResources(course.resources, session);

    const draftCourse = await createDraftCourse(
      course,
      newSections,
      newResources,
      session
    );

    course.updatedVersionId = draftCourse._id;
    await course.save({ session });

    await session.commitTransaction();
    return draftCourse;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

// Load course and validate access
async function loadAndValidateCourse(courseId, userId, session) {
  const course = await Course.findById(courseId)
    .populate({ path: "sections", populate: { path: "lectures" } })
    .populate("resources")
    .session(session);
  console.log(course);

  if (!course) throw new AppError("Cours non trouvé", 404);

  if (course.instructor.toString() !== userId.toString()) {
    throw new AppError("Vous n’êtes pas autorisé à modifier ce cours", 403);
  }

  if (course.status !== "published") {
    throw new AppError("Ce cours n’est pas publié", 400);
  }

  if (course.updatedVersionId) {
    throw new AppError("Une mise à jour est déjà en cours", 400);
  }

  return course;
}

// Clone sections and lectures
async function cloneSections(sections, session) {
  const newSectionIds = [];

  for (const section of sections) {
    const newLectureIds = [];

    for (const lecture of section.lectures) {
      const [newLecture] = await Lecture.create(
        [
          {
            title: lecture.title,
            type: lecture.type,
            url: lecture.url,
            duration: lecture.duration,
            questions: lecture.questions,
          },
        ],
        { session }
      );

      lecture.draftVersion = newLecture._id;
      await lecture.save({ session });
      newLectureIds.push(newLecture._id);
    }

    const [newSection] = await Section.create(
      [
        {
          title: section.title,
          lectures: newLectureIds,
        },
      ],
      { session }
    );

    section.draftVersion = newSection._id;
    await section.save({ session });
    newSectionIds.push(newSection._id);
  }

  return newSectionIds;
}

// Clone resources
async function cloneResources(resources, session) {
  const newResourceIds = [];

  for (const resource of resources) {
    const [newResource] = await Resource.create(
      [
        {
          title: resource.title,
          resourceUrl: resource.resourceUrl,
        },
      ],
      { session }
    );

    newResourceIds.push(newResource._id);
  }

  return newResourceIds;
}

// Create draft course
async function createDraftCourse(
  original,
  newSectionIds,
  newResourceIds,
  session
) {
  const [draftCourse] = await Course.create(
    [
      {
        title: `${original.title} (brouillon)`,
        description: original.description,
        imageUrl: original.imageUrl,
        status: "draft",
        level: original.level,
        price: original.price,
        category: original.category,
        tags: original.tags,
        instructor: original.instructor,
        totalStudents: 0,
        totalStudentComplete: 0,
        totalDuration: original.totalDuration,
        sections: newSectionIds,
        resources: newResourceIds,
        assetFolder: original.assetFolder,
        parentCourseId: original._id,
        slug: `${original.slug}-draft-${Date.now()}`,
      },
    ],
    { session }
  );

  return draftCourse;
}
