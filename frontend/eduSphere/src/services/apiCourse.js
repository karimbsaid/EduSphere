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
  const data = await response.json();
  if (response.status === 400) {
    throw new Error(data.message);
  }

  if (!response.ok) throw new Error("Erreur lors de la création du cours");
  return data;
};

export const createCourseUpdate = async (courseId, token) => {
  const response = await fetch(`${API_URL}courses/${courseId}/create-update`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok)
    throw new Error("Erreur lors de la create cours update du cours");
  return response.json();
};

export const submitCourseForApproval = async (courseId, token) => {
  const response = await fetch(`${API_URL}courses/${courseId}/submit`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) throw new Error("Erreur lors de la submit du cours");
  return response.json();
};

export const createSection = async (token, courseId, sectionTitle) => {
  const response = await fetch(`${API_URL}courses/${courseId}/sections`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ title: sectionTitle }),
  });
  if (!response.ok) throw new Error("Erreur lors de la création de la section");
  return response.json();
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

  const response = await fetch(
    `${API_URL}courses/${courseId}/sections/${sectionId}/lectures`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
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
  try {
    const response = await fetch(`${API_URL}courses/${courseId}`, {
      method: "GET",
    });

    const data = await response.json();

    if (response.status === 404) {
      return data;
    }

    if (!response.ok) {
      throw new Error(
        data.message || "Erreur lors de la récupération du cours"
      );
    }

    return data;
  } catch (error) {
    throw new Error("Erreur réseau : " + error.message);
  }
};
export const getStats = async () => {
  const response = await fetch(`${API_URL}courses/stats`, {
    method: "GET",
  });
  if (!response.ok) throw new Error("Erreur lors de la fetch du stats");
  return response.json();
};

export const getCourseDetailEdit = async (courseId, token) => {
  try {
    const response = await fetch(`${API_URL}courses/${courseId}/edit`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (response.status === 404) {
      return { error: "404", message: data.message };
    }

    if (!response.ok) {
      throw new Error(
        data.message || "Erreur lors de la récupération du cours"
      );
    }

    return data;
  } catch (error) {
    throw new Error("Erreur réseau : " + error.message);
  }
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

  const response = await fetch(`${API_URL}courses/${courseId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) throw new Error("Erreur lors de la création du cours");
  return response.json();
};

export const updateSection = async (
  token,
  courseId,
  sectionId,
  sectionTitle
) => {
  const response = await fetch(
    `${API_URL}courses/${courseId}/sections/${sectionId}`,
    {
      method: "PATCH",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title: sectionTitle }),
    }
  );

  if (!response.ok)
    throw new Error("Erreur lors de la mise à jour de la section");
  return response.json();
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

  const response = await fetch(
    `${API_URL}courses/${courseId}/sections/${sectionId}/lectures/${lectureId}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
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
export const deleteLecture = async (courseId, sectionId, lectureId, token) => {
  const response = await fetch(
    `${API_URL}courses/${courseId}/sections/${sectionId}/lectures/${lectureId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Échec de la suppression de la lecture");
  }
};
export const deleteCourse = async (courseId, token) => {
  const response = await fetch(`${API_URL}courses/${courseId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Échec de la suppression de la cour");
  }
};

// Suppression d'une section
export const deleteSection = async (courseId, sectionId, token) => {
  const response = await fetch(
    `${API_URL}courses/${courseId}/sections/${sectionId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  const data = await response.json();

  if (!response.ok) {
    throw new Error("Échec de la suppression de la section");
  }

  return data;
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
export const getPopulaireCourses = async () => {
  const response = await fetch(`${API_URL}courses/top-five`, {
    method: "GET",
  });

  if (!response.ok) throw new Error("Erreur lors de la récupération des cours");
  return response.json();
};
export const getAllcourse = async (query = {}, token) => {
  const queryString = new URLSearchParams(query).toString();

  const headers = {};
  if (token != null) {
    headers.Authorization = `Bearer ${token}`;
  }
  const response = await fetch(`${API_URL}courses?${queryString}`, {
    method: "GET",
    headers,
  });

  if (!response.ok) throw new Error("Erreur lors de la récupération des cours");
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

export const getRecommendedCourses = async (token) => {
  const response = await fetch(`${API_URL}courses/recommend`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await response.json();
  if (data.status === "fail" && response.status === 404) {
    return [];
  }

  if (!response.ok) throw new Error("Erreur lors de la fetch du cours");
  return data;
};

export const addResource = async (courseId, resourceData, token) => {
  const formData = new FormData();
  formData.append("title", resourceData.title);
  if (resourceData.file) formData.append("resourceFile", resourceData.file);

  const response = await fetch(`${API_URL}courses/${courseId}/resources`, {
    method: "POST",
    body: formData,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) throw new Error("Erreur lors de la création du resource");
  return response.json();
};

export const updateResource = async (resourceId, resourceData, token) => {
  const formData = new FormData();
  formData.append("title", resourceData.title);
  if (resourceData.file) formData.append("resourceFile", resourceData.file);
  const response = await fetch(`${API_URL}courses/resources/${resourceId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
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

export const approuveRejetCour = async (courseId, status, message, token) => {
  const response = await fetch(`${API_URL}courses/${courseId}/approuverejet`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ message: message, status }),
  });
  if (!response.ok) throw new Error("Erreur lors de l approuve ou bien rejet");
  return response.json();
};
