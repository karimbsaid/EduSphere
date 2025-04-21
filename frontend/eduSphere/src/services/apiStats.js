const API_URL = "http://localhost:8080/api/v1/";

export const getTotalUser = async (token) => {
  const response = await fetch(`${API_URL}statistiques/total-users`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.json();
};
export const getTotalRevenu = async (token) => {
  const response = await fetch(`${API_URL}statistiques/total-revenu`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.json();
};

export const getRevenuStats = async (token, queryParams = {}) => {
  const queryString = new URLSearchParams(queryParams).toString();

  const response = await fetch(`${API_URL}statistiques/revenu?${queryString}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.json();
};

const getCourseDistribution = async (token) => {
  const response = await fetch(`${API_URL}statistiques/course-distribution`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.json();
};

export const getCourseOnHold = async (token) => {
  const response = await fetch(`${API_URL}statistiques/course-on-hold`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.json();
};

export const getTopInstructors = async (token, query = {}) => {
  const queryString = new URLSearchParams(query).toString();

  const response = await fetch(
    `${API_URL}statistiques/top-5-instructor?${queryString}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.json();
};
export const getTopCourses = async (token, query = {}) => {
  console.log(query);
  const queryString = new URLSearchParams(query).toString();
  console.log(queryString);
  const response = await fetch(
    `${API_URL}statistiques/top-5-courses?${queryString}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.json();
};

const getCompletionRate = async (token, query = {}) => {
  const response = await fetch(`${API_URL}statistiques/completion-rate`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.json();
};
