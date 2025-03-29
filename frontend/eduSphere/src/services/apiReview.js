const API_URL = "http://localhost:8080/api/v1/";

export const getCourseReviews = async (courseId) => {
  const response = await fetch(`${API_URL}courses/${courseId}/reviews`, {
    method: "GET",
  });
  const data = await response.json();

  return data;
};

export const createReview = async (courseId, token, reviewData) => {
  const response = await fetch(`${API_URL}courses/${courseId}/reviews`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      rating: reviewData.rating,
      comment: reviewData.comment,
    }),
  });

  if (!response.ok) throw new Error("Erreur lors de la creation du review");
  return response.json();
};
