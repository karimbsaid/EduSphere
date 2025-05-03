const Payment = require("../models/payment.models");
const Course = require("../models/course.models");
const Enrollment = require("../models/enrollment.model");
const Progress = require("../models/progress.models");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const APIFeatures = require("../utils/apiFeatures");
const mongoose = require("mongoose");

const renderTemplate = async (templateName, params) => {
  const templatePath = path.join(
    __dirname,
    "../template",
    `${templateName}.html`
  );
  let html = await fs.promises.readFile(templatePath, "utf-8");

  // Remplacer les placeholders
  Object.entries(params).forEach(([key, value]) => {
    html = html.replace(new RegExp(`{{${key}}}`, "g"), value);
  });

  return html;
};

exports.pay = catchAsync(async (req, res, next) => {
  const { courseId } = req.params;
  const userId = req.user._id;
  const course = await Course.findById(courseId);

  if (!course) return next(new AppError("Cours non trouvé", 404));

  const url = "https://developers.flouci.com/api/generate_payment";
  const payload = {
    app_token: process.env.APP_TOKEN,
    app_secret: process.env.APP_SECRET,
    amount: course.price * 1000,
    accept_card: "true",
    session_timeout_secs: 1200,
    success_link: "http://localhost:8080/api/v1/payments/verify",
    fail_link: `http://localhost:8080/api/v1/payments/verify`,
    developer_tracking_id: "dfee00a7-1605-4367-88ed-fcd045306c61",
  };

  const response = await axios.post(url, payload);
  const paymentData = response.data;

  let payment = await Payment.findOne({
    studentId: userId,
    courseId,
    paymentStatus: "pending",
  });
  console.log("payment", payment);

  if (payment) {
    payment.paymentId = paymentData.result.payment_id;
    payment.amount = course.price * 1000;
    await payment.save();
  } else {
    // Créer un nouveau paiement
    payment = await Payment.create({
      studentId: userId,
      courseId,
      amount: course.price * 1000,
      status: "pending",
      paymentId: paymentData.result.payment_id,
    });
  }

  res.status(200).json({
    status: "success",
    paymentUrl: paymentData.result.link,
  });
});

exports.verify = catchAsync(async (req, res, next) => {
  const { payment_id } = req.query;
  const url = `https://developers.flouci.com/api/verify_payment/${payment_id}`;
  const response = await axios.get(url, {
    headers: {
      "Content-Type": "application/json",
      apppublic: process.env.APP_TOKEN,
      appsecret: process.env.APP_SECRET,
    },
  });

  const verification = response.data;
  const payment = await Payment.findOne({ paymentId: payment_id });

  if (!payment) return next(new AppError("Paiement non trouvé", 404));

  payment.paymentStatus = verification.success === true ? "paid" : "failed";
  await payment.save();
  const course = await Course.findById(payment.courseId)
    .populate({
      path: "sections",
      populate: { path: "lectures" },
    })
    .populate({
      path: "instructor",
      select: "name",
    })
    .select("sections title instructor price")
    .lean();

  if (!course) {
    return next(new AppError("Aucun cours trouvé", 404));
  }
  if (verification.success === true) {
    const firstSection = course.sections[0]._id;
    const firstLecture = course.sections[0].lectures[0]._id;

    const progress = await Progress.create({
      currentSection: firstSection,
      currentLecture: firstLecture,
    });

    const enrollment = await Enrollment.create({
      courseId: payment.courseId,
      studentId: payment.studentId,
      progress,
    });

    return res.send(
      await renderTemplate("payment-success", {
        title: course.title,
        instructor: course.instructor.name,
        amount: course.price,
        message: "Votre accès au cours a été activé avec succès",
        courseLink: `/course/${course._id}/start`,
      })
    );
  }

  return res.send(
    await renderTemplate("payment-failure", {
      title: course.title,
      errorMessage: "Veuillez réessayer ou contacter le support",
      retryLink: `/course/${course._id}/payment`,
    })
  );
});

exports.getAllPaiements = async (req, res) => {
  try {
    const user = req.user;

    let filter = {};

    if (user.role.name === "Instructor") {
      const instructorCourses = await Course.find({
        instructor: user._id,
      })
        .select("_id")
        .lean();
      const courseIds = instructorCourses.map((course) => course._id);
      filter.courseId = { $in: courseIds };
    }

    const totalDocuments = await Payment.countDocuments(filter);
    const features = new APIFeatures(Payment.find(filter), req.query)
      .filter()
      .sort()
      .paginate()
      .limitFields();

    let paiements = await features.query
      .populate({
        path: "courseId",
        select: "title",
      })
      .populate({
        path: "studentId",
        select: "name",
      });

    if (req.query.search !== undefined && req.query.search.trim() !== "") {
      const searchRegex = new RegExp(req.query.search, "i");

      paiements = paiements.filter((p) => {
        return (
          searchRegex.test(p.courseId?.title || "") ||
          searchRegex.test(p.studentId?.name || "")
        );
      });
    }

    res.status(200).json({
      status: "success",
      nombreDocuments: paiements.length,
      totalDocuments,
      paiements,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: "Server Error" });
  }
};
