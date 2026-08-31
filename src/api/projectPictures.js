import { request } from "./request";

const BASE = "/projectpictures";

export const getProjectPictures = () => request(BASE);
export const getProjectPicture = (id) => request(`${BASE}/${id}`);
export const getProjectPicturesByProject = (projectId) =>
  request(`${BASE}/project/${projectId}`);
export const createProjectPicture = (data) => request(BASE, { method: "POST", body: data });
export const updateProjectPicture = (data) => request(BASE, { method: "PATCH", body: data });
export const deleteProjectPicture = (id) => request(`${BASE}/${id}`, { method: "DELETE" });
export const deleteProjectPicturesByProject = (projectId) =>
  request(`${BASE}/project/${projectId}`, { method: "DELETE" });