import { request } from "./request";

export const getUsers = () => request("/users");
export const getUser = (id) => request(`/users/${id}`);
export const createUser = (data) => request("/users", { method: "POST", body: data });
export const updateUser = (data) => request("/users", { method: "PATCH", body: data });
export const deleteUser = (id) => request(`/users/${id}`, { method: "DELETE" });