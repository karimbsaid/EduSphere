import { apiClient } from "./apiClient";

export const getProgress = async (courseId, token) => {
  return apiClient(`/enrollment/${courseId}/my-progress`, { token });
};

export const getListOfMyStudents = async (query = {}, token) => {
  const queryString = new URLSearchParams(query).toString();
  return apiClient(`/users/me/my-students?${queryString}`, { token });
};

export const enroll = async (courseId, token) => {
  return apiClient(`/enrollment/${courseId}/enroll`, { method: "POST" });
};

export const updateProgress = async (courseId, sectionId, lectureId, token) => {
  return apiClient(
    `/enrollment/${courseId}/section/${sectionId}/lecture/${lectureId}/update-progress`,
    { method: "PATCH", token }
  );
};

/**get my enrolled course */
export const getMyEnrolledCourse = async (token) => {
  return apiClient(`/users/me/my-enrolled-courses`, { token });
};
