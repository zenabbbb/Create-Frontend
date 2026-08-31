import { request } from "./request";

export const getFields = () => request("/fields");
export const getField = (id) => request(`/fields/${id}`);
export const getFieldProjects = (id) => request(`/fields/${id}/projects`);
export const getFieldUsers = (id) => request(`/fields/${id}/users`);
export const createField = (data) => request("/fields", { method: "POST", body: data });
export const updateField = (data) => request("/fields", { method: "PATCH", body: data });
export const deleteField = (id) => request(`/fields/${id}`, { method: "DELETE" });