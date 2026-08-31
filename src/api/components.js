import { request } from "./request";

export const getComponents = () => request("/components");
export const getComponent = (id) => request(`/components/${id}`);
export const createComponent = (data) => request("/components", { method: "POST", body: data });
export const updateComponent = (data) => request("/components", { method: "PATCH", body: data });
export const deleteComponent = (id) => request(`/components/${id}`, { method: "DELETE" });