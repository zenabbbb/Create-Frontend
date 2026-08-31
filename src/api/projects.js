import { request } from "./request";

export const getProjects = () => request("/projects");
export const getProject = (id) => request(`/projects/${id}`);
export const getProjectMembers = (id) => request(`/projects/${id}/members`);
export const createProject = (data) => request("/projects", { method: "POST", body: data });
export const updateProject = (data) => request("/projects", { method: "PATCH", body: data });
export const deleteProject = (id) => request(`/projects/${id}`, { method: "DELETE" });