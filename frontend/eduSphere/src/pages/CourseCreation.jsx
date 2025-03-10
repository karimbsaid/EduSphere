import { useEffect, useState } from "react";
import { HiChevronRight, HiChevronLeft } from "react-icons/hi2";
import CourseDetailsForm from "../features/course/CourseDetailsForm";
import CourseCurriculum from "../features/course/CourseCurriculum";
import CoursePricing from "../features/course/CoursePricing";
import CoursePreview from "../features/course/coursePreview";
import {
  createCourse,
  createSection,
  uploadLecture,
  getCourseDetail,
  updateCourse,
  deleteSection,
  updateSection,
  updateLecture,
  deleteLecture,
} from "../services/apiCourse";
import { useParams } from "react-router-dom";
const steps = ["Course Details", "Curriculum", "Pricing", "Review"];

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
    isEdit: false,
  });
  const { courseId } = useParams();
  useEffect(() => {
    const fetchCourseDetail = async () => {
      try {
        const { data } = await getCourseDetail(courseId);
        setCourseData({
          title: data.title,
          description: data.description,
          coverImage: data.imageUrl,
          level: data.level,
          category: data.category,
          sections: data.sections,
          price: data.price || 0,
          tags: data.tags,
          isEdit: courseId ? true : false,
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
  }, [courseId]);

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else if (currentStep === steps.length - 1) {
      /* empty */
    }
  };
  const handleSubmit = async () => {
    try {
      setLoading(true);
      if (courseId) {
        handleUpdateCourse();
      } else {
        handleCreateCourse();
      }
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };
  const handleCourseDataChange = (field, value) => {
    setCourseData((prev) => {
      // Vérifier si le cours est en mode édition
      if (courseId) {
        return { ...prev, [field]: value, updated: true };
      }
      return { ...prev, [field]: value };
    });
  };
  const handleCreateCourse = async () => {
    const course = await createCourse(courseData);
    courseData.sections.map(async (sec) => {
      const sectiondd = await createSection(course.data._id, sec.title);
      sec.lectures.map(async (content) => {
        await uploadLecture(course.data._id, sectiondd.data._id, content);
      });
    });
  };
  const handleUpdateCourse = async () => {
    try {
      // Mettre à jour le cours lui-même
      if (courseData.updated) {
        await updateCourse(courseId, courseData);
      }

      // Traiter les sections séquentiellement
      for (const sec of courseData.sections) {
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
    } catch (error) {
      console.error("Erreur lors de la mise à jour :", error);
    }
  };

  return (
    <div className="mx-auto max-w-3xl p-6 bg-white shadow-lg rounded-lg">
      <h1 className="mb-8 text-3xl font-bold">Create a New Course</h1>
      <div className="mb-8 flex justify-between">
        {steps.map((step, index) => (
          <div
            key={step}
            className={`flex items-center ${
              index <= currentStep ? "text-black" : "text-gray-400"
            }`}
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
              className={
                index <= currentStep
                  ? "text-black font-medium"
                  : "text-gray-400"
              }
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
        <CoursePricing
          courseData={courseData}
          handleCourseDataChange={handleCourseDataChange}
        />
      )}
      {currentStep === 3 && <CoursePreview courseData={courseData} />}

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
          disabled={currentStep === steps.length - 1}
          className={`flex items-center px-6 py-2 rounded-lg font-medium  bg-black text-white hover:bg-gray-800`}
        >
          {currentStep === steps.length - 1 ? "Finish" : "Next"}
          <HiChevronRight className="ml-2 h-4 w-4" />
        </button>
        <button onClick={handleSubmit}>ffff</button>
        {isLoading && <div>loading ..</div>}
      </div>
    </div>
  );
}
