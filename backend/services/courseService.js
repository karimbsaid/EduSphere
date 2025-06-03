const Course = require("../models/course.models");
const Section = require("../models/section.models");
const Lecture = require("../models/lecture.models");
const Resource = require("../models/resource.models");
const AppError = require("../utils/appError");
const mongoose = require("mongoose");
const CloudinaryStorage = require("../services/cloudinaryStorage");
const cloudinary = require("../config/cloudinary");
const storage = new CloudinaryStorage(cloudinary);
const slugify = require("slugify");

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
///////////////////*///////////////////////////////
//creation cours

async function uploadCoverImage(coverImage, slug) {
  const uploaded = await storage.upload(coverImage, `courses/${slug}`);
  return {
    imageUrl: uploaded.secure_url,
    assetFolder: uploaded.asset_folder,
  };
}

async function createCourseDocument(
  data,
  userId,
  imageUrl,
  assetFolder,
  session
) {
  return await Course.create(
    [{ ...data, imageUrl, assetFolder, instructor: userId }],
    { session }
  );
}

exports.createFullCourse = async (courseData, user, files) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { sections = [], resources = [], ...courseInfo } = courseData;
    console.log(sections, resources, courseInfo);

    let imageUrl = "";
    let assetFolder = "";
    if (files?.coverImage) {
      const image = await uploadCoverImage(files.coverImage, courseInfo.slug);
      imageUrl = image.imageUrl;
      assetFolder = image.assetFolder;
    }

    const courseArr = await createCourseDocument(
      courseInfo,
      user._id,
      imageUrl,
      assetFolder,
      session
    );
    const course = courseArr[0];

    const fullSections = await createSections(sections, course._id, session);
    await createLectures(fullSections, course, session, files);
    await createResources(resources, course._id, session, files);

    await session.commitTransaction();
    session.endSession();

    return course;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

async function createSections(sections, courseId, session) {
  const sectionDocs = [];
  const parsedSections = JSON.parse(sections);
  console.log(parsedSections);

  for (const section of parsedSections) {
    const sec = await Section.create([{ title: section.title }], { session });

    sectionDocs.push({ ...sec[0]._doc, lectures: section.lectures });
    await Course.findByIdAndUpdate(
      courseId,
      { $push: { sections: sec[0]._id } },
      { session }
    );
  }

  return sectionDocs;
}

async function createLectures(sectionsWithLectures, course, session, files) {
  for (const sec of sectionsWithLectures) {
    const section = await Section.findById(sec._id).session(session);

    for (const lecture of sec.lectures) {
      if (lecture.type === "quiz") {
        const cleanedQuestions = lecture?.questions?.map((question) => {
          const filteredOptions = question.options.filter(
            (option) => option.text && option.text.trim() !== ""
          );

          if (filteredOptions.length === 0) {
            throw new Error(
              `La question "${question.questionText}" n'a aucune option valide`
            );
          }

          return {
            ...question,
            options: filteredOptions,
          };
        });

        lecture.questions = cleanedQuestions;
      }
      const { fileFieldName, ...lectureData } = lecture;
      console.log(fileFieldName);
      console.log(files[fileFieldName]);

      let url = "";
      if (lectureData.type === "video" && fileFieldName) {
        // Use the extracted fileFieldName
        const filename = fileFieldName;
        const folder = `courses/${course.title}/${slugify(section.title, {
          lower: true,
        })}`;
        const uploadedVideo = await storage.upload(
          files[fileFieldName], // Use the extracted fileFieldName to get the file
          folder,
          "video"
        );
        console.log(uploadedVideo);
        url = uploadedVideo.secure_url;
      }
      console.log({ ...lecture, url });

      const created = await Lecture.create([{ ...lectureData, url }], {
        session,
      });
      console.log("created ", created);

      section.lectures.push(created[0]._id);
      console.log("section", section);
      course.totalDuration += lecture.duration || 0;
      console.log("course", course);
      await section.save({ session });
    }
  }

  await course.save({ session });
}

async function createResources(resources, courseId, session, files) {
  console.log("create resource");
  const parsedResources = JSON.parse(resources); // frontend sends stringified
  for (const resource of parsedResources) {
    console.log("element", resource);
    let url = "";

    const file = files[resource.fileFieldName]; // 🔑 get the file from req.files

    if (file) {
      const uploaded = await storage.upload(file, `courses/resources`, "raw");
      url = uploaded.secure_url;
    }

    const resDoc = await Resource.create(
      [{ title: resource.title, resourceUrl: url }],
      { session }
    );
    await Course.findByIdAndUpdate(
      courseId,
      { $addToSet: { resources: resDoc[0]._id } },
      { session }
    );
  }
}
