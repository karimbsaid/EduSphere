const API_URL = "http://localhost:8080/api/v1/";

// Helper function pour gérer l'authentification
// const getAuthHeader = () => {
//   const token = localStorage.getItem("token");
//   if (!token) throw new Error("Aucun token trouvé");
//   return { Authorization: `Bearer ${token}` };
// };

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

  const response = await fetch(`${API_URL}courses`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) throw new Error("Erreur lors de la création du cours");
  return response.json();
};

export const createSection = async (courseId, sectionTitle) => {
  console.log("creation d'un section", courseId, sectionTitle);
  const response = await fetch(`${API_URL}courses/${courseId}/sections`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title: sectionTitle }),
  });
  if (!response.ok) throw new Error("Erreur lors de la création de la section");
  return response.json();
};

export const uploadLecture = async (courseId, sectionId, lectureData) => {
  console.log("uploadLecture");
  console.log(courseId, sectionId, lectureData);
  const formData = new FormData();
  formData.append("title", lectureData.title);
  formData.append("type", lectureData.type);

  // Assurer que duration est bien un nombre
  const duration = Number(lectureData.duration ? lectureData.duration : 0);

  formData.append("duration", duration);

  if (lectureData.type === "video") {
    if (!lectureData.file) {
      throw new Error("Un fichier vidéo est requis pour une lecture vidéo");
    }
    formData.append("video", lectureData.file);
  } else if (lectureData.type === "text") {
    if (!lectureData.content) {
      throw new Error("Le contenu est requis pour une lecture texte");
    }
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
  } else {
    throw new Error("Type de lecture invalide");
  }

  const response = await fetch(
    `${API_URL}courses/${courseId}/sections/${sectionId}/lectures`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(`Erreur lors de l'upload de la lecture: ${errorMessage}`);
  }

  const data = await response.json();
  return data;
};

export const getCourseDetail = async (courseId) => {
  const response = await fetch(`${API_URL}courses/${courseId}`, {
    method: "GET",
  });
  if (!response.ok) throw new Error("Erreur lors de la fetch du cours");
  return response.json();
};

export const getCourseDetailEdit = async (courseId, token) => {
  const response = await fetch(`${API_URL}courses/${courseId}/edit`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error("Erreur lors de la fetch du cours");
  return response.json();
};
export const updateCourse = async (courseId, courseData) => {
  const formData = new FormData();
  formData.append("title", courseData.title);
  formData.append("description", courseData.description);
  formData.append("price", courseData.price);
  formData.append("tags", JSON.stringify(courseData.tags));
  formData.append("category", courseData.category);
  formData.append("level", courseData.level);
  if (courseData.coverImage)
    formData.append("coverImage", courseData.coverImage);

  const response = await fetch(`${API_URL}courses/${courseId}`, {
    method: "PATCH",
    body: formData,
  });

  if (!response.ok) throw new Error("Erreur lors de la création du cours");
  return response.json();
};

export const updateSection = async (courseId, sectionId, sectionTitle) => {
  const response = await fetch(
    `${API_URL}courses/${courseId}/sections/${sectionId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title: sectionTitle }),
    }
  );

  if (!response.ok)
    throw new Error("Erreur lors de la mise à jour de la section");
  return response.json();
};

export const updateLecture = async (
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

  const response = await fetch(
    `${API_URL}courses/${courseId}/sections/${sectionId}/lectures/${lectureId}`,
    {
      method: "PATCH",
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Échec de la mise à jour de la lecture");
  }

  return response.json();
};

// Suppression d'une lecture
export const deleteLecture = async (courseId, sectionId, lectureId) => {
  const response = await fetch(
    `${API_URL}courses/${courseId}/sections/${sectionId}/lectures/${lectureId}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Échec de la suppression de la lecture");
  }

  return response.json();
};

// Suppression d'une section
export const deleteSection = async (courseId, sectionId) => {
  const response = await fetch(
    `${API_URL}courses/${courseId}/sections/${sectionId}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Échec de la suppression de la section");
  }

  return response.json();
};

export const getLecture = async (courseId, sectionId, lectureId) => {
  const response = await fetch(
    `${API_URL}courses/${courseId}/sections/${sectionId}/lectures/${lectureId}`,
    {
      method: "GET",
    }
  );

  if (!response.ok) throw new Error("Erreur lors de la fetch du lecture");
  return response.json();
};

export const getAllcourse = async (queryParams = {}) => {
  const response = await fetch(`${API_URL}courses?${queryParams}`, {
    method: "GET",
  });

  if (!response.ok) throw new Error("Erreur lors de la fetch du cours");
  return response.json();
};

export const getAllMyCourseStats = async (token) => {
  const response = await fetch(`${API_URL}courses/my-courses-stats`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) throw new Error("Erreur lors de la fetch du cours");
  return response.json();
};

export const addResource = async (courseId, resourceData, courseTitle) => {
  const formData = new FormData();
  formData.append("title", resourceData.title);
  formData.append("courseTitle", courseTitle);
  if (resourceData.file) formData.append("resourceFile", resourceData.file);

  const response = await fetch(`${API_URL}courses/${courseId}/resources`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) throw new Error("Erreur lors de la création du resource");
  return response.json();
};

export const updateResource = async (resourceId, token, resourceData) => {
  const formData = new FormData();
  formData.append("title", resourceData.title);
  if (resourceData.file) formData.append("resourceFile", resourceData.file);
  const response = await fetch(`${API_URL}courses/resources/${resourceId}`, {
    method: "PATCH",
    body: formData,
  });

  if (!response.ok) throw new Error("Erreur lors de la création du resource");
  return response.json();
};

export const getResources = async (courseId) => {
  const response = await fetch(`${API_URL}courses/${courseId}/resources`, {
    method: "GET",
  });

  if (!response.ok) throw new Error("Erreur lors de la fetch du cours");
  return response.json();
};
