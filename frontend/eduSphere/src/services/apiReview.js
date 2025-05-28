import { apiClient } from "./apiClient";

const API_URL = "http://localhost:8080/api/v1/";

export const getCourseReviews = async (courseId) => {
  return apiClient(`/courses/${courseId}/reviews`);
};

export const createReview = async (courseId, token, reviewData) => {
  return apiClient(`/courses/${courseId}/reviews`, {
    method: "POST",
    token,
    body: {
      rating: reviewData.rating,
      comment: reviewData.comment,
    },
  });
};
