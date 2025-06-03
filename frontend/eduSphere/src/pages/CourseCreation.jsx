import { useContext, useEffect, useState } from "react";
import { HiChevronRight, HiChevronLeft, HiArrowLeft } from "react-icons/hi2";
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
  deleteRessource,
  createFullCourse,
} from "../services/apiCourse";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import CourseResources from "../features/course/courseCreation/CourseResources";
import { useAuth } from "../context/authContext";
import { splitPdfFile, storeDocuments } from "../services/apiSplitter";
import Spinner from "../ui/Spinner";
import { CourseContext } from "../context/courseContext";
import Button from "../ui/Button";
import Breadcrumb from "../components/Breadcrumb";
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

  const { dispatch, state } = useContext(CourseContext);

  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const token = user.token;

  const isValid = () => {
    switch (currentStep) {
      case 0:
        return (
          state.title.trim() !== "" &&
          state.description.trim() !== "" &&
          state.level != "" &&
          state.tags.length > 0 &&
          state.coverImage != null
        );
      case 1:
        return (
          state.sections.length > 0 &&
          state.sections.every((section) => {
            const hasValidTitle = section.title.trim() !== "";
            const hasLectures = section.lectures.length > 0;

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
          state.resources.every(
            (res) =>
              res?.title?.trim() != "" &&
              (res.file != null || res.resourceUrl != "")
          ) ?? false
        );
      case 3:
        return state.price >= 0 && state.price != "";
      default:
        return true;
    }
  };
  useEffect(() => {
    const fetchCourseDetail = async () => {
      try {
        const { data: course } = await getCourseDetailEdit(courseId, token);

        dispatch({
          type: "SET_ALL_FIELDS",
          payload: {
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
          },
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
  }, [courseId, dispatch, token]);

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

      if (courseId) {
        await handleUpdateCourse();
        navigate(`/course/${courseId}/preview`);
      } else {
        await handleCreateCourse();
      }
    } catch (err) {
      console.error("Erreur lors de la soumission : ", err);
    } finally {
      setLoading(false);
    }
  };
  const handleStoreDocumentAssistant = async () => {
    console.log("state ressources", state.resources);
    const splittable = state.resources.filter(
      (res) => res.isSpliter && !res.isNew
    );
    if (splittable.length === 0) return;

    try {
      for (const res of splittable) {
        console.log(res);
        await splitPdfFile(res);
      }
    } catch (error) {
      console.error("Auto-split failed:", error);
    }
  };

  // const handleCreateCourse = async () => {
  //   try {
  //     const course = await createFullCourse(state, token);
  //     console.log(course);

  //     // for (const sec of state.sections) {
  //     //   const sectionRes = await createSection(
  //     //     token,
  //     //     course.data._id,
  //     //     sec.title
  //     //   );

  //     //   for (const content of sec.lectures) {
  //     //     await uploadLecture(
  //     //       token,
  //     //       course.data._id,
  //     //       sectionRes.data._id,
  //     //       content
  //     //     );
  //     //   }
  //     // }
  //     // if (state.resources.length > 0) {
  //     //   for (const res of state.resources) {
  //     //     await addResource(course.data._id, res, course.data.title, token);
  //     //   }
  //     // }
  //     // handleStoreDocumentAssistant();
  //     toast.success("Cours créé avec succès !");
  //     navigate(`/course/${course.data._id}/preview`);
  //   } catch (err) {
  //     toast.error(`Erreur : ${err.message}`);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleCreateCourse = async () => {
    try {
      const course = await createCourse(state, token);

      for (const sec of state.sections) {
        const sectionRes = await createSection(
          token,
          course.data._id,
          sec.title
        );

        for (const content of sec.lectures) {
          const lectureResponse = await uploadLecture(
            token,
            course.data._id,
            sectionRes.data._id,
            content
          );
        }
      }
      if (state.resources.length > 0) {
        for (const res of state.resources) {
          const resourceLabel = `Création de resource ${res.title}`;
          const response = await addResource(
            course.data._id,
            res,
            course.data.title,
            token
          );
        }
      }
      if (state.faq.length > 0) {
        const response = await storeDocuments(state.faq);
      }
      handleStoreDocumentAssistant();
      toast.success("Cours créé avec succès !");
      navigate(`/course/${course.data._id}/preview`);
    } catch (err) {
      toast.error(`Erreur : ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCourse = async () => {
    try {
      if (state.updated) {
        await updateCourse(token, courseId, state);
      }

      for (const sec of state.sections) {
        if (sec.deleted) {
          await deleteSection(courseId, sec._id, token);
          continue;
        }

        let sectionId = sec._id;

        // Mise à jour de section existante
        if (sec.updated) {
          await updateSection(token, courseId, sectionId, sec.title);
        }

        // Création de nouvelle section
        if (sec.isNew) {
          const newSection = await createSection(token, courseId, sec.title);
          sectionId = newSection.data._id; // Récupérer le vrai ID de la section
        }

        // Traiter les lectures seulement si la section n'est pas supprimée
        for (const lec of sec.lectures) {
          if (lec.deleted) {
            await deleteLecture(courseId, sectionId, lec._id, token);
            continue;
          }

          if (lec.isNew) {
            await uploadLecture(token, courseId, sectionId, lec);
          }

          if (lec.updated) {
            await updateLecture(token, courseId, sectionId, lec._id, lec);
          }
        }
      }
      for (const res of state.resources) {
        if (res.isNew) {
          await addResource(courseId, res, token);
        }
        if (res.updated) {
          await updateResource(courseId, res._id, res, token);
        }
        if (res.deleted) {
          await deleteRessource(courseId, res._id, token);
        }
      }

      handleStoreDocumentAssistant();
    } catch (error) {
      console.error("Erreur lors de la mise à jour :", error);
    }
  };

  return (
    <div className="mx-5 w-full  p-12 bg-white shadow-lg rounded-lg">
      <Breadcrumb
        items={[
          { label: "Dashboard", path: "/dashboard" },
          { label: "Courses", path: "/dashboard/courses" },
          { label: "Create" }, // Pas de path => élément actif non cliquable
        ]}
      />

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

      {currentStep === 0 && <CourseDetailsForm />}
      {currentStep === 1 && <CourseCurriculum />}
      {currentStep === 2 && <CourseResources />}

      {currentStep === 3 && <CoursePricing />}
      {currentStep === 4 && <CoursePreview isPreview courseData={state} />}

      <div className="mt-8 flex justify-between">
        <Button
          onClick={handlePrev}
          disabled={currentStep === 0 || isLoading}
          variant="simple"
        >
          <HiChevronLeft className="mr-2 h-4 w-4" />
          <span>Previous</span>
        </Button>

        <Button
          variant="simple"
          onClick={handleNext}
          disabled={!isValid() || isLoading}
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
        </Button>
      </div>
    </div>
  );
}
