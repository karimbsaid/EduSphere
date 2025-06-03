import { apiClient } from "./apiClient";
const API_URL = "http://localhost:8080/api/v1/";

export const getAllCourseTitle = async (token) => {
  return apiClient("/courses/titles", { token });
};

export const createCourse = async (courseData, token) => {
  const formData = new FormData();
  formData.append("title", courseData.title);
  formData.append("description", courseData.description);
  formData.append("price", courseData.price);
  formData.append("tags", JSON.stringify(courseData.tags));
  formData.append("category", courseData.category);
  formData.append("level", courseData.level);
  if (courseData.coverImage)
    formData.append("coverImage", courseData.coverImage);

  return apiClient("/courses", {
    method: "POST",
    token,
    body: formData,
    isForm: true,
  });
};

export const createFullCourse = async (courseData, token) => {
  const formData = new FormData();

  // Basic course data
  formData.append("title", courseData.title);
  formData.append("description", courseData.description);
  formData.append("price", courseData.price);
  formData.append("tags", JSON.stringify(courseData.tags));
  formData.append("category", courseData.category);
  formData.append("level", courseData.level);

  // Cover image
  if (courseData.coverImage) {
    formData.append("coverImage", courseData.coverImage);
  }

  // Sections and lectures (structured as JSON)
  const sectionsData = courseData.sections.map((sec, secIndex) => ({
    title: sec.title,
    lectures: sec.lectures.map((lecture, lecIndex) => {
      const baseLecture = {
        title: lecture.title,
        type: lecture.type,
        duration: lecture.duration,
      };

      if (lecture.type === "quiz") {
        baseLecture.questions = lecture.questions || [];
      }

      if (lecture.type === "video") {
        baseLecture.fileFieldName = `lectureVideo-${secIndex}-${lecIndex}`;
      }

      return baseLecture;
    }),
  }));

  formData.append("sections", JSON.stringify(sectionsData));

  // Append each lecture video with a unique field name
  courseData.sections.forEach((sec, secIndex) => {
    sec.lectures.forEach((lec, lecIndex) => {
      if (lec.type === "video") {
        formData.append(`lectureVideo-${secIndex}-${lecIndex}`, lec.file);
      }
    });
  });

  // Append resources
  const resourcesData = courseData.resources.map((res, i) => ({
    title: res.title,
    fileFieldName: `resourceFile-${i}`,
  }));
  formData.append("resources", JSON.stringify(resourcesData));

  courseData.resources.forEach((res, i) => {
    if (res.file) {
      formData.append(`resourceFile-${i}`, res.file);
    }
  });

  return apiClient("/courses", {
    method: "POST",
    token,
    body: formData,
    isForm: true,
  });
};

export const createCourseUpdate = async (courseId, token) => {
  return apiClient(`/courses/${courseId}/create-update`, {
    token,
    method: "POST",
  });
};

export const submitCourseForApproval = async (courseId, token) => {
  return apiClient(`/courses/${courseId}/submit`, { method: "PATCH", token });
};

export const createSection = async (token, courseId, sectionTitle) => {
  return apiClient(`/courses/${courseId}/sections`, {
    method: "POST",
    token,
    body: { title: sectionTitle },
  });
};

export const uploadLecture = async (
  token,
  courseId,
  sectionId,
  lectureData
) => {
  const formData = new FormData();
  formData.append("title", lectureData.title);
  formData.append("type", lectureData.type);

  const duration = Number(lectureData.duration ? lectureData.duration : 0);

  formData.append("duration", duration);

  if (lectureData.type === "video") {
    if (!lectureData.file) {
      throw new Error("Un fichier vidéo est requis pour une lecture vidéo");
    }
    formData.append("video", lectureData.file);
  } else if (lectureData.type === "quiz") {
    if (!lectureData.questions || lectureData.questions.length === 0) {
      throw new Error("Des questions sont requises pour un quiz");
    }

    const cleanedQuestions = lectureData.questions.map((question) => {
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

    formData.append("questions", JSON.stringify(cleanedQuestions));
  } else {
    throw new Error("Type de lecture invalide");
  }

  return apiClient(`/courses/${courseId}/sections/${sectionId}/lectures`, {
    method: "POST",
    isForm: true,
    body: formData,
    token,
  });
};

export const getCourseDetail = async (courseId, token = "") => {
  const header = {};
  if (token) {
    header.token = token;
  }
  console.log("get course detail");
  return apiClient(`/courses/${courseId}`, header);
};

export const getCourseProgramme = async (courseId, token) => {
  return apiClient(`/courses/${courseId}/programme`, { token });
};

export const getCourseDetailEdit = async (courseId, token) => {
  return apiClient(`/courses/${courseId}/edit`, { token });
};

export const updateCourse = async (token, courseId, courseData) => {
  const formData = new FormData();
  formData.append("title", courseData.title);
  formData.append("description", courseData.description);
  formData.append("price", courseData.price);
  formData.append("tags", JSON.stringify(courseData.tags));
  formData.append("category", courseData.category);
  formData.append("level", courseData.level);
  if (courseData.coverImage)
    formData.append("coverImage", courseData.coverImage);

  return apiClient(`/courses/${courseId}`, {
    method: "PATCH",
    token,
    isForm: true,
    body: formData,
  });
};

export const updateSection = async (
  token,
  courseId,
  sectionId,
  sectionTitle
) => {
  return apiClient(`/courses/${courseId}/sections/${sectionId}`, {
    method: "PATCH",
    body: { title: sectionTitle },
    token,
  });
};

export const updateLecture = async (
  token,
  courseId,
  sectionId,
  lectureId,
  lectureData
) => {
  const formData = new FormData();
  formData.append("title", lectureData.title);
  formData.append("type", lectureData.type);
  formData.append("duration", lectureData.duration || 0);

  if (lectureData.type === "video" && lectureData.file) {
    formData.append("video", lectureData.file);
  } else if (lectureData.type === "text") {
    formData.append("content", lectureData.content);
  } else if (lectureData.type === "quiz") {
    if (!lectureData.questions || lectureData.questions.length === 0) {
      throw new Error("Des questions sont requises pour un quiz");
    }

    // 🔹 Nettoyer les options avant l'envoi
    const cleanedQuestions = lectureData.questions.map((question) => {
      // Filtrer les options avec texte non-vide
      const filteredOptions = question.options.filter(
        (option) => option.text && option.text.trim() !== ""
      );

      // Vérifier qu'il reste des options valides
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

    formData.append("questions", JSON.stringify(cleanedQuestions));
  }
  return apiClient(
    `/courses/${courseId}/sections/${sectionId}/lectures/${lectureId}`,
    { method: "PATCH", token, isForm: true, body: formData }
  );
};

// Suppression d'une lecture
export const deleteLecture = async (courseId, sectionId, lectureId, token) => {
  return apiClient(
    `/courses/${courseId}/sections/${sectionId}/lectures/${lectureId}`,
    { method: "DELETE", token }
  );
};
export const deleteCourse = async (courseId, token) => {
  return apiClient(`/courses/${courseId}`, { method: "DELETE", token });
};

export const deleteSection = async (courseId, sectionId, token) => {
  return apiClient(`/courses/${courseId}/sections/${sectionId}`, {
    method: "DELETE",
    token,
  });
};

export const getLecture = async (courseId, sectionId, lectureId, token) => {
  return apiClient(
    `/courses/${courseId}/sections/${sectionId}/lectures/${lectureId}`,
    { token }
  );
};
export const getPopulaireCourses = async () => {
  return apiClient(
    `/courses/top-five?fields=title,instructor,totalStudents,averageRating,imageUrl,level,price`
  );
};
export const getAllcourse = async (query = {}, token) => {
  const queryString = new URLSearchParams(query).toString();
  return apiClient(
    `/courses?${queryString}&status=published&fields=title,status,price,category,instructor,averageRating,ratingsQuantity,totalStudents,imageUrl`,
    { token }
  );
};

export const getManagedCours = async (query = {}, token) => {
  const queryString = new URLSearchParams(query).toString();
  return apiClient(
    `/courses/managed-course?${queryString}&fields=title,status,price,category,instructor,totalStudents`,
    { token }
  );
};

export const getAllMyCourseStats = async (token) => {
  return apiClient(`/courses/my-courses-stats`, { token });
};

export const getRecommendedCourses = async (token) => {
  return apiClient(`/courses/recommend`, { token });
};

export const addResource = async (courseId, resourceData, token) => {
  const formData = new FormData();
  formData.append("title", resourceData.title);
  if (resourceData.file) formData.append("resourceFile", resourceData.file);
  return apiClient(`/courses/${courseId}/resources`, {
    method: "POST",
    isForm: true,
    body: formData,
    token,
  });
};

export const updateResource = async (
  courseId,
  resourceId,
  resourceData,
  token
) => {
  const formData = new FormData();
  formData.append("title", resourceData.title);
  if (resourceData.file) formData.append("resourceFile", resourceData.file);
  return apiClient(`/courses/${courseId}/resources/${resourceId}`, {
    method: "PATCH",
    token,
    isForm: true,
    body: formData,
  });
};

export const deleteRessource = async (courseId, ressourceId, token) => {
  return apiClient(`/courses/${courseId}/resources/${ressourceId}`, {
    token,
    method: "DELETE",
  });
};

export const getResources = async (courseId, token) => {
  return apiClient(`/courses/${courseId}/resources`, { token });
};

export const approuveRejetCour = async (courseId, status, message, token) => {
  return apiClient(`/courses/${courseId}/approuverejet`, {
    method: "PATCH",
    token,
    body: { message: message, status },
  });
};
