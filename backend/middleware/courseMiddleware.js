const User = require("../models/user.models");
const Enrollment = require("../models/enrollment.model");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const Course = require("../models/course.models");
const Section = require("../models/section.models");
const slugify = require("slugify");

exports.getDocumentById = ({ model, paramIdKey, reqKey, populate, select }) => {
  return async (req, res, next) => {
    try {
      let query = model.findById(req.params[paramIdKey]);

      if (select) query = query.select(select.join(" "));
      if (populate) query = query.populate(populate);

      const doc = await query;

      if (!doc) {
        return next(new AppError(`${model.modelName} introuvable`, 404));
      }
      if (reqKey) {
        req[reqKey] = doc;
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};

exports.getDocumentByQuery = ({
  model,
  buildQuery, // (req) => query object
  reqKey, // where to attach the found doc on req
  notFoundMessage, // optional custom message
  select, // optional fields array
  populate, // optional populate config
}) => {
  return async (req, res, next) => {
    console.log("model name", model);
    try {
      const queryConditions = buildQuery(req);
      let query = model.findOne(queryConditions);

      if (select) query = query.select(select.join(" "));
      if (populate) query = query.populate(populate);

      const doc = await query;

      if (!doc) {
        return next(
          new AppError(notFoundMessage || `${model.modelName} introuvable`, 404)
        );
      }

      if (reqKey) {
        req[reqKey] = doc;
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};

exports.checkUserEnrolled = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const course = req.course;

  // Instructors can always access
  if (course.instructor.toString() === userId.toString()) {
    return next();
  }

  const enrollment = await Enrollment.findOne({
    courseId: course._id,
    studentId: userId,
    paymentStatus: "paid",
  });

  if (!enrollment) {
    return next(
      new AppError("Vous devez être inscrit à ce cours pour y accéder", 403)
    );
  }
  req.enrollment = enrollment;

  next();
});

exports.getSection = catchAsync(async (req, res, next) => {
  await req.course.populate("sections");
  const section = await Section.findById(req.params.sectionId);
  if (!section) {
    return next(new AppError("section introuvable", 404));
  }

  const existsInCourse = req.course.sections.some(
    (s) => s._id.toString() === req.params.sectionId
  );

  if (!existsInCourse) {
    return next(new AppError("Cette section n'appartient pas à ce cours", 403));
  }

  req.section = section;
  next();
});

exports.checkOwnership = (req, res, next) => {
  console.log("check ownership", req.course);
  if (req.course.instructor.toString() !== req.user._id.toString()) {
    return next(new AppError("Action non autorisée", 403));
  }
  next();
};
exports.checkIsAdminOrInstructor = (req, res, next) => {
  const user = req.user;
  const course = req.course;

  const isInstructor = course.instructor.toString() === user._id.toString();
  const isAdmin = user.role.name === "Admin"; // Adjust if your role field uses a different name

  if (!isInstructor && !isAdmin) {
    return next(
      new AppError("Accès réservé à l'instructeur ou à un administrateur", 403)
    );
  }

  next();
};

exports.checkCourseStatus =
  (statuses = []) =>
  (req, res, next) => {
    console.log(statuses, req.course.status);
    if (statuses.includes(req.course.status)) {
      return next(
        new AppError(
          `Action impossible pour ce statut (${req.course.status})`,
          400
        )
      );
    }
    next();
  };
exports.isCourseHasStudents = catchAsync(async (req, res, next) => {
  const { courseId } = req.params;

  const enrollmentCount = await Enrollment.countDocuments({ courseId });

  if (enrollmentCount > 0) {
    return next(
      new AppError("Cannot delete course: students are still enrolled.", 400)
    );
  }

  next();
});
exports.parseJSONFieldsMiddleware = (fields = []) => {
  return (req, res, next) => {
    for (const field of fields) {
      if (req.body[field] && typeof req.body[field] === "string") {
        try {
          req.body[field] = JSON.parse(req.body[field]);
        } catch (err) {
          return next(
            new AppError(
              `Invalid format for '${field}': must be valid JSON`,
              400
            )
          );
        }
      }
    }
    next();
  };
};
exports.checkSlugUniqueMiddleware = ({
  model,
  sourceField,
  slugField = "slug",
}) => {
  return async (req, res, next) => {
    if (!req.body[sourceField]) {
      return next(new AppError(`${sourceField} is required`, 400));
    }

    const slug = slugify(req.body[sourceField], { lower: true, strict: true });

    const existing = await model.findOne({ [slugField]: slug });
    if (existing) {
      return next(
        new AppError(
          `A ${model.modelName} with this ${sourceField} already exists`,
          409
        )
      );
    }

    req.body[slugField] = slug;
    next();
  };
};
