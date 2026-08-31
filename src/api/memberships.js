import { request } from "./request";

export const getMemberships = () => request("/memberships");
export const getMembership = (id) => request(`/memberships/${id}`);
export const createMembership = (data) => request("/memberships", { method: "POST", body: data });
export const updateMembership = (data) => request("/memberships", { method: "PATCH", body: data });
export const deleteMembership = (id) => request(`/memberships/${id}`, { method: "DELETE" });
export const deleteMembershipsByProject = (projectId) =>
  request(`/memberships/project/${projectId}`, { method: "DELETE" });
export const deleteMembershipsByUser = (userId) =>
  request(`/memberships/user/${userId}`, { method: "DELETE" });