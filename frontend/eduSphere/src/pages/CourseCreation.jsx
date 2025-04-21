import { useEffect, useState } from "react";
import { HiChevronRight, HiChevronLeft } from "react-icons/hi2";
import CourseDetailsForm from "../features/course/courseCreation/CourseDetailsForm";
import CourseCurriculum from "../features/course/courseCreation/CourseCurriculum";
import CoursePricing from "../features/course/courseCreation/CoursePricing";
import CoursePreview from "../features/course/courseCreation/CoursePreview";
import {
  createCourse,
  createSection,
  uploadLecture,
  updateCourse,
  deleteSection,
  updateSection,
  updateLecture,
  deleteLecture,
  addResource,
  updateResource,
  getCourseDetailEdit,
} from "../services/apiCourse";
import { useParams } from "react-router-dom";
import CourseResources from "../features/course/courseCreation/CourseResources";
import { useAuth } from "../context/authContext";
import { storeDocuments } from "../services/apiSplitter";
import Spinner from "../ui/Spinner";
const steps = [
  "Course Details",
  "Curriculum",
  "Resources",
  "Pricing",
  "Review",
];

export default function CourseCreation() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setLoading] = useState(false);

  const [courseData, setCourseData] = useState({
    title: "",
    description: "",
    category: "",
    level: "",
    tags: [],
    coverImage: null,
    sections: [],
    price: 0,
    resources: [],
    isEdit: false,
    faq: [],
  });
  const { courseId } = useParams();
  const { user } = useAuth();
  const token = user.token;

  const isValid = () => {
    switch (currentStep) {
      case 0:
        return (
          courseData.title.trim() !== "" &&
          courseData.description.trim() !== "" &&
          courseData.level != "" &&
          courseData.tags.length > 0 &&
          courseData.coverImage != null
        );
      case 1:
        return (
          courseData.sections.length > 0 &&
          courseData.sections.every((section) => {
            const hasValidTitle = section.title.trim() !== "";
            const hasLectures = section.lectures.length > 0;
            console.log(
              "hasLectures",
              section.lectures.every((lecture) => !lecture.deleted)
            );

            if (!hasValidTitle || !hasLectures) return false;

            return section.lectures.every((lecture) => {
              if (lecture.title.trim() === "") return false;

              switch (lecture.type) {
                case "quiz":
                  return (
                    lecture.questions.length > 0 &&
                    (lecture.questions.every(
                      (question) =>
                        question.questionText.trim() !== "" &&
                        question.options.length > 1 &&
                        question.options?.some((opt) => opt.isCorrect)
                    ) ??
                      false)
                  );

                case "video":
                  return (
                    (lecture.file != null || lecture.url != "") &&
                    lecture.duration?.toString().trim() !== ""
                  );

                default:
                  return true;
              }
            });
          })
        );
      case 2:
        return (
          courseData.resources.every(
            (res) =>
              res.title.trim() != "" &&
              (res.file != null || res.resourceUrl != "")
          ) ?? false
        );
      case 3:
        return courseData.price >= 0 && courseData.price != "";
      default:
        return true;
    }
  };
  useEffect(() => {
    const fetchCourseDetail = async () => {
      try {
        const { course } = await getCourseDetailEdit(courseId, token);
        console.log("get course detail ");
        setCourseData({
          title: course.title,
          description: course.description,
          coverImage: course.imageUrl,
          level: course.level,
          category: course.category,
          sections: course.sections,
          price: Number(course.price) || 0,
          tags: course.tags,
          isEdit: courseId ? true : false,
          resources: course.resources || [],
        });
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des détails du cours",
          error
        );
      }
    };
    if (courseId) {
      fetchCourseDetail();
    }
  }, [courseId, token]);

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleNext = () => {
    if (isValid) {
      if (currentStep === steps.length - 1) {
        handleSubmit();
      } else {
        setCurrentStep((prev) => prev + 1);
      }
    }
  };
  const handleSubmit = async () => {
    try {
      setLoading(true);
      console.log("Submitting...");

      // Appel asynchrone pour la création ou la mise à jour du cours
      if (courseId) {
        await handleUpdateCourse(); // Assurez-vous d'utiliser await pour attendre la fin de la mise à jour
      } else {
        await handleCreateCourse(); // Assurez-vous d'utiliser await pour attendre la fin de la création
      }
    } catch (err) {
      console.error("Erreur lors de la soumission : ", err);
    } finally {
      // Assurez-vous de réinitialiser l'état de loading après la fin du processus
      setLoading(false);
    }
  };

  const handleCourseDataChange = (field, value) => {
    setCourseData((prev) => {
      if (courseId) {
        return { ...prev, [field]: value, updated: true };
      }
      return { ...prev, [field]: value };
    });
  };
  // const handleCreateCourse = async () => {
  //   setCourseStatus("loading");

  //   const course = await createCourse(courseData, token);
  //   setCourseStatus("success");
  //   setSectionStatus("loading");
  //   setVideoStatus("loading");
  //   courseData.sections.map(async (sec) => {
  //     const sectiondd = await createSection(course.data._id, sec.title);
  //     sec.lectures.map(async (content) => {
  //       await uploadLecture(course.data._id, sectiondd.data._id, content);
  //     });
  //   });
  //   setSectionStatus("success");
  //   setVideoStatus("success");
  //   if (courseData.resources) {
  //     courseData.resources.map(async (res) => {
  //       const response = await addResource(
  //         course.data._id,
  //         res,
  //         course.data.title
  //       );
  //     });
  //   }
  // };

  const handleCreateCourse = async () => {
    // Création du cours
    const course = await createCourse(courseData, token);

    // Pour chaque section
    for (const sec of courseData.sections) {
      const sectionRes = await createSection(course.data._id, sec.title);

      // Pour chaque lecture dans la section
      for (const content of sec.lectures) {
        const lectureResponse = await uploadLecture(
          course.data._id,
          sectionRes.data._id,
          content
        );
      }
    }

    // Pour chaque ressource, s'il y en a
    if (courseData.resources) {
      for (const res of courseData.resources) {
        const resourceLabel = `Création de resource ${res.title}`;
        const response = await addResource(
          course.data._id,
          res,
          course.data.title
        );
      }
    }
    if (courseData.faq) {
      const response = await storeDocuments(courseData.faq);
      console.log(response);
    }
  };

  const handleUpdateCourse = async () => {
    try {
      // Mettre à jour le cours lui-même
      if (courseData.updated) {
        console.log("course Updated");
        await updateCourse(courseId, courseData);
      }

      // Traiter les sections séquentiellement
      for (const sec of courseData.sections) {
        console.log("sec updated", sec);
        if (sec.deleted) {
          await deleteSection(courseId, sec._id);
          continue; // Passer au traitement suivant
        }

        let sectionId = sec._id;

        // Mise à jour de section existante
        if (sec.updated) {
          await updateSection(courseId, sectionId, sec.title);
        }

        // Création de nouvelle section
        if (sec.isNew) {
          const newSection = await createSection(courseId, sec.title);
          sectionId = newSection.data._id; // Récupérer le vrai ID de la section
        }

        // Traiter les lectures seulement si la section n'est pas supprimée
        for (const lec of sec.lectures) {
          console.log("lec updated", lec);
          if (lec.deleted) {
            await deleteLecture(courseId, sectionId, lec._id);
            continue;
          }

          if (lec.isNew) {
            await uploadLecture(courseId, sectionId, {
              // Utiliser le nouveau sectionId
              ...lec,
              file: lec.file, // Inclure le fichier si nécessaire
            });
          }

          if (lec.updated) {
            await updateLecture(courseId, sectionId, lec._id, lec);
          }
        }
      }
      for (const res of courseData.resources) {
        console.log(res);
        if (res.updated) {
          await updateResource(res._id, token, res);
        }
      }
      if (courseData.faq) {
        const response = await storeDocuments(courseData.faq);
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour :", error);
    }
  };

  return (
    <div className="mx-auto max-w-3xl p-6 bg-white shadow-lg rounded-lg">
      <h1 className="mb-8 text-3xl font-bold">Create a New Course</h1>
      <div className="mb-8 flex flex-wrap justify-center md:justify-between space-x-2">
        {steps.map((step, index) => (
          <div
            key={step}
            className={`flex items-center ${
              index <= currentStep ? "text-black" : "text-gray-400"
            } mb-4 md:mb-0 md:flex-row flex-col items-center`}
          >
            <div
              className={`mr-2 h-8 w-8 rounded-full flex items-center justify-center ${
                index < currentStep
                  ? "bg-black text-white"
                  : index === currentStep
                  ? "bg-black text-white"
                  : "bg-gray-200 text-gray-400"
              }`}
            >
              {index + 1}
            </div>
            <span
              className={`${
                index <= currentStep
                  ? "text-black font-medium"
                  : "text-gray-400"
              }`}
            >
              {step}
            </span>
          </div>
        ))}
      </div>

      {currentStep === 0 && (
        <CourseDetailsForm
          courseData={courseData}
          handleCourseDataChange={handleCourseDataChange}
        />
      )}
      {currentStep === 1 && (
        <CourseCurriculum
          courseData={courseData}
          setCourseData={setCourseData}
        />
      )}
      {currentStep === 2 && (
        <CourseResources
          courseData={courseData}
          setCourseData={setCourseData}
        />
      )}

      {currentStep === 3 && (
        <CoursePricing
          courseData={courseData}
          handleCourseDataChange={handleCourseDataChange}
        />
      )}
      {currentStep === 4 && <CoursePreview courseData={courseData} />}

      <div className="mt-8 flex justify-between">
        <button
          onClick={handlePrev}
          disabled={currentStep === 0}
          className={`flex items-center px-6 py-2 rounded-lg font-medium ${
            currentStep === 0
              ? "bg-gray-400 text-white cursor-not-allowed"
              : "bg-black text-white hover:bg-gray-800"
          }`}
        >
          <HiChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </button>
        <button
          onClick={handleNext}
          disabled={!isValid() || isLoading}
          className={`flex items-center px-6 py-2 rounded-lg font-medium  bg-black text-white hover:bg-gray-800 ${
            !isValid() || isLoading
              ? "bg-gray-400 text-white cursor-not-allowed"
              : "bg-black"
          }`}
        >
          {isLoading ? (
            <div className="flex items-center">
              <Spinner size="sm" />
              <span className="ml-2">
                {courseId ? "Modification..." : "Création..."}
              </span>
            </div>
          ) : currentStep === steps.length - 1 ? (
            "Finish"
          ) : (
            "Next"
          )}

          <HiChevronRight className="ml-2 h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
