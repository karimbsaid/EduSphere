const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const courseController = require("../controllers/course.controller");
const resourceController = require("../controllers/resource.controller");
const reviewRouter = require("./review.routes");
const sectionRouter = require("./section.routes");

router.get("/my-courses-stats", auth.protect, courseController.getMyCourses);

// Créer un nouveau cours
router.post("/", auth.protect, courseController.createCourse);

// Mettre à jour un cours existant
router.patch("/:courseId", courseController.updateCourse);

// Supprimer un cours
router.delete("/:courseId", courseController.deleteCourse);

// Récupérer tous les cours
router.get("", courseController.getAllCourses);

// Récupérer un cours spécifique
router.get("/:courseId", courseController.getCourseDetails);
router.get(
  "/:courseId/edit",
  auth.protect,
  auth.checkInstructor,
  courseController.getCourseDetails
);

// Créer une nouvelle section dans un cours spécifique
router.post("/:courseId/sections", courseController.createSection);

// Mettre à jour une section existante
router.patch("/:courseId/sections/:sectionId", courseController.updateSection);

// Supprimer une section
router.delete("/:courseId/sections/:sectionId", courseController.deleteSection);

// Récupérer toutes les sections d'un cours
// router.get('/:courseId/sections', courseController.getSectionsByCourse);

// Récupérer une section spécifique
// // Créer une nouvelle leçon dans une section spécifique

router.post(
  "/:courseId/sections/:sectionId/lectures",
  courseController.createLecture
);

// Mettre à jour une leçon existante
router.patch(
  "/:courseId/sections/:sectionId/lectures/:lectureId",
  courseController.updateLecture
);

// Supprimer une leçon
router.delete(
  "/:courseId/sections/:sectionId/lectures/:lectureId",
  courseController.deleteLecture
);

// Récupérer toutes les leçons d'une section
router.get(
  "/:courseId/chapter/:sectionId/lecture/:lectureId",
  courseController.getLecture
);

router.get("/recommend", auth.protect, courseController.recommend);
router.post("/:courseId/resources", resourceController.addResource);
router.patch("/resources/:resourceId", resourceController.updateResource);

router.use("/:courseId/reviews", reviewRouter);
router.use("/:courseId/sections", sectionRouter);

// Récupérer une leçon spécifique
// router.get('/:courseId/sections/:sectionId/lectures/:lectureId', courseController.getLectureById);
module.exports = router;
