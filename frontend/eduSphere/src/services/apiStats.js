// const API_URL = "http://localhost:8080/api/v1/";

import { apiClient } from "./apiClient";

// export const getTotalUser = async (token) => {
//   const response = await fetch(`${API_URL}statistiques/total-users`, {
//     method: "GET",
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   });
//   return response.json();
// };
// export const getTotalRevenu = async (token) => {
//   const response = await fetch(`${API_URL}statistiques/total-revenu`, {
//     method: "GET",
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   });

//   return response.json();
// };

// export const getRevenuStats = async (token, queryParams = {}) => {
//   const queryString = new URLSearchParams(queryParams).toString();

//   const response = await fetch(`${API_URL}statistiques/revenu?${queryString}`, {
//     method: "GET",
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   });

//   return response.json();
// };

// const getCourseDistribution = async (token) => {
//   const response = await fetch(`${API_URL}statistiques/course-distribution`, {
//     method: "GET",
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   });

//   return response.json();
// };

// export const getCourseOnHold = async (token) => {
//   const response = await fetch(`${API_URL}statistiques/course-on-hold`, {
//     method: "GET",
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   });

//   return response.json();
// };

// export const getTopInstructors = async (token, query = {}) => {
//   const queryString = new URLSearchParams(query).toString();

//   const response = await fetch(
//     `${API_URL}statistiques/top-5-instructor?${queryString}`,
//     {
//       method: "GET",
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     }
//   );

//   return response.json();
// };
// export const getTopCourses = async (token, query = {}) => {
//   console.log(query);
//   const queryString = new URLSearchParams(query).toString();
//   console.log(queryString);
//   const response = await fetch(
//     `${API_URL}statistiques/top-5-courses?${queryString}`,
//     {
//       method: "GET",
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     }
//   );

//   return response.json();
// };

// const getCompletionRate = async (token, query = {}) => {
//   const response = await fetch(`${API_URL}statistiques/completion-rate`, {
//     method: "GET",
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   });

//   return response.json();
// };

export const getStats = async () => {
  return apiClient(`/statistiques/global`);
};

export const getStatsForDashboard = async (token) => {
  return apiClient(`/statistiques/stats`, { token });
};

export const getRecentUsers = async (token) => {
  return apiClient("/statistiques/stats/recentUser");
};
export const getRecentEnrollments = async (token) => {
  return apiClient("/statistiques/stats/recentEnrollement", { token });
};
export const getRecentPendingCourse = async (token) => {
  return apiClient("/statistiques/stats/pendingCourses", { token });
};
export const getCoursesByCategories = async (token) => {
  return apiClient("/statistiques/stats/coursesByCategory", { token });
};
export const getStudentsByCategory = async (token) => {
  return apiClient("/statistiques/stats/studentsByCategory", { token });
};

export const getStudentsByCourses = async (token) => {
  return apiClient("/statistiques/stats/studentsByCourse", { token });
};

export const GetRevenueByPeriod = (
  token,
  instructorId = "",
  courseId = "",
  startDate,
  endDate
) => {
  const params = new URLSearchParams();

  if (instructorId) params.append("instructorId", instructorId);
  if (courseId) params.append("courseId", courseId);
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);

  return apiClient(`/statistiques/stats/revenue?${params.toString()}`, {
    token,
  });
};
