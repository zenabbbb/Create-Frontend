import { request } from "./request";

// Note: capital R in the path per the backend contract
const BASE = "/componentReservations";

export const getReservations = () => request(BASE);
export const getReservation = (id) => request(`${BASE}/${id}`);
export const getReservationsByComponent = (componentId) =>
  request(`${BASE}/component/${componentId}`);
export const getReservationsByUser = (userId) => request(`${BASE}/user/${userId}`);
export const createReservation = (data) => request(BASE, { method: "POST", body: data });
export const updateReservation = (data) => request(BASE, { method: "PATCH", body: data });
export const deleteReservation = (id) => request(`${BASE}/${id}`, { method: "DELETE" });
export const deleteReservationsByComponent = (componentId) =>
  request(`${BASE}/component/${componentId}`, { method: "DELETE" });