import React, { useEffect, useState } from "react";
import CoursePreview from "../features/course/courseCreation/CoursePreview";
import { useNavigate, useParams } from "react-router-dom";
import { getCourseDetailEdit } from "../services/apiCourse";
import { useAuth } from "../context/authContext";
import { toast } from "react-hot-toast";
import Spinner from "../ui/Spinner";

export default function CoursePreviewPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  const token = user.token;
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
    isEdit: true,
    faq: [],
  });
  const { courseId } = useParams();
  useEffect(() => {
    const fetchCourseDetail = async () => {
      try {
        const result = await getCourseDetailEdit(courseId, token);

        if (result?.error === "404") {
          navigate("/404", { replace: true });
          return;
        }

        const { course } = result;
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
        toast.error(error.message); // hot-toast ici
      } finally {
        setIsLoading(false);
      }
    };

    if (courseId) {
      fetchCourseDetail();
    }
  }, [courseId, token, navigate]);
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <Spinner size="lg" />
        <div className="ml-4 text-lg">Chargement...</div>
      </div>
    );
  }

  return (
    <div>
      <CoursePreview courseData={courseData} isPreview />{" "}
    </div>
  );
}
