import { apiClient } from "./apiClient";

export const getPermissionsByRole = async (roleId, token) => {
  return apiClient(`/roles/permissions/role/${roleId}`, { method: "GET" });
};

export const getAllFeatures = (token) => {
  return apiClient("/features", { method: "GET" });
};
export const getAllRoles = (token) => {
  return apiClient(`/roles/`);
};
export const createRole = (token, name) => {
  return apiClient("/roles", { method: "POST", body: { name } });
};
export const updateRole = (token, name, roleId) => {
  return apiClient(`/roles/${roleId}`, { method: "PATCH", body: { name } });
};

export const deleteRole = (token, roleId) => {
  return apiClient(`/roles/${roleId}`, { method: "DELETE" });
};
export const createFeature = (token, featureName) => {
  return apiClient("/features", {
    method: "POST",
    body: { name: featureName },
  });
};
export const updateFeature = (token, featureName, featureId) => {
  return apiClient(`/features/${featureId}`, {
    method: "PATCH",
    body: { name: featureName },
  });
};

export const deleteFeature = (token, featureId) => {
  return apiClient(`/features/${featureId}`, { method: "DELETE" });
};

export const updatePermission = (token, roleId, featureId, authorized) => {
  return apiClient("/roles/permissions", {
    method: "PATCH",
    body: { roleId, featureId, authorized },
  });
};
