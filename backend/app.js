const express = require("express");
const AppError = require("./utils/appError");
const courseRouter = require("./routes/course.routes");
const paimentRouter = require("./routes/paiment.routes");
const enrollRouter = require("./routes/enrollment.routes");
const profileRouter = require("./routes/user.routes");
const statistiquesRouter = require("./routes/statistiques.routes");
const authRouter = require("./routes/auth.routes");
const globalErrorController = require("./controllers/error.controller");
const app = express();
const fileUpload = require("express-fileupload");
const cors = require("cors");
// mongoose.set("debug", true);
app.use(express.json({ limit: "500mb" }));
app.use(express.urlencoded({ limit: "500mb", extended: true }));
app.use(cors());

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp",
    limits: { fileSize: 2 * 1024 * 1024 * 1024 },
  })
);
app.use(express.static(`${__dirname}/public`));

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/statistiques", statistiquesRouter);

app.use("/api/v1/courses", courseRouter);
app.use("/api/v1/payments", paimentRouter);
app.use("/api/v1/enrollment", enrollRouter);
app.use("/api/v1/users", profileRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorController);

module.exports = app;
