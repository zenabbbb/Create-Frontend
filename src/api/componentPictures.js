import { request } from "./request";

const BASE = "/componentpictures";

export const getComponentPictures = () => request(BASE);
export const getComponentPicture = (id) => request(`${BASE}/${id}`);
export const getComponentPictureSingle = (componentId) =>
  request(`${BASE}/component/${componentId}/single`);
export const getComponentPictureSingleByOrder = (componentId, order) =>
  request(`${BASE}/component/${componentId}/single/${order}`);
export const getComponentPicturesByComponent = (componentId) =>
  request(`${BASE}/component/${componentId}`);
export const createComponentPicture = (data) => request(BASE, { method: "POST", body: data });
export const updateComponentPicture = (data) => request(BASE, { method: "PATCH", body: data });
export const deleteComponentPicture = (id) => request(`${BASE}/${id}`, { method: "DELETE" });
export const deleteComponentPicturesByComponent = (componentId) =>
  request(`${BASE}/component/${componentId}`, { method: "DELETE" });