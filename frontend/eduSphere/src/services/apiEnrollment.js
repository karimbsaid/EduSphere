const API_URL = "http://localhost:8080/api/v1/";
// frontend: api.js
export const getProgress = async (courseId, token) => {
  try {
    const response = await fetch(
      `${API_URL}enrollment/${courseId}/my-progress`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        status: "fail",
        message: data.message || "Erreur lors de la récupération du progrès",
      };
    }

    return data;
  } catch (error) {
    return {
      status: "error",
      message: "Erreur réseau ou serveur",
    };
  }
};

export const enroll = async (courseId, token) => {
  const response = await fetch(`${API_URL}enrollment/${courseId}/enroll`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) throw new Error("Erreur lors de enrollment");
  return response.json();
};

export const updateProgress = async (courseId, sectionId, lectureId, token) => {
  const response = await fetch(
    `${API_URL}course-enroll/${courseId}/section/${sectionId}/lecture/${lectureId}/update-progress`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!response.ok) throw new Error("Erreur lors de enrollment");
  return response.json();
};

/**get my enrolled course */
export const getMyEnrolledCourse = async (token) => {
  const response = await fetch(`${API_URL}users/me/my-enrolled-courses`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  console.log(data);
  return data;
};

export const getEnrolledCoursesStats = async (token) => {
  const response = await fetch(`${API_URL}course-enroll/my-enrolled-stats`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  console.log(data);

  if (!response.ok) throw new Error("Erreur lors de la fetch du stats");

  return data;
};
