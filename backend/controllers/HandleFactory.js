const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const APIFeatures = require("./../utils/apiFeatures");

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError("No document found with that ID", 404));
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(new AppError("No document found with that ID", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(201).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  });

// factory.js

// For Express route usage
exports.getOne = (Model, id, popOptions) =>
  catchAsync(async (req, res, next) => {
    const doc = await getOneDoc(Model, req.params[id], popOptions);
    if (!doc) return next(new AppError("No document found with that ID", 404));

    res.status(200).json({
      status: "success",
      data: doc,
    });
  });

// For internal use (e.g., when you want to return the doc)
// For internal use (e.g., when you want to return the doc)
const getOneDoc = async (Model, id, popOptions = null) => {
  let query = Model.findById(id);
  if (popOptions) query = query.populate(popOptions);
  const doc = await query;
  return doc;
};

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

      req[reqKey] = doc;
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

exports.getAll = (Model, filter = {}, popOptions = null, searchFields = []) =>
  catchAsync(async (req, res, next) => {
    let query = Model.find(filter);

    if (popOptions) {
      query = query.populate(popOptions);
    }

    const features = new APIFeatures(query, req.query, Model)
      .filter()
      .search(searchFields)
      .sort()
      .limitFields();

    // Clone the query before pagination to count documents
    const countQuery = features.query.model.find(features.query.getQuery());

    const totalDocuments = await countQuery.countDocuments();

    // Apply pagination
    features.paginate();

    const doc = await features.query;

    res.status(200).json({
      status: "success",
      total: totalDocuments,
      results: doc.length,
      data: {
        data: doc,
      },
    });
  });
exports.getOneDoc = getOneDoc;
