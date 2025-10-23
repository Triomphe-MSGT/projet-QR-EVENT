// src/services/eventService.js
import api from "../slices/axiosInstance"; // ✅ Vérifiez ce chemin

// Récupère tous les événements
export const getEvents = async () => {
  const { data } = await api.get("/events");
  return data;
};

// Récupère un événement par ID
export const getEventById = async (id) => {
  if (!id) throw new Error("ID d'événement manquant");
  const { data } = await api.get(`/events/${id}`);
  return data;
};

// S'inscrire à un événement
export const registerToEvent = async ({ eventId, formData }) => {
  if (!eventId) throw new Error("ID d'événement manquant");
  const { data } = await api.post(`/events/${eventId}/register`, formData);
  return data;
};

// Crée un événement
export const createEvent = async (formData) => {
  // formData doit être un objet FormData
  const { data } = await api.post("/events", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

// Met à jour un événement
export const updateEvent = async ({ id, formData }) => {
  // formData doit être un objet FormData
  if (!id) throw new Error("ID d'événement manquant");
  const { data } = await api.put(`/events/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

// Supprime un événement
export const deleteEvent = async (id) => {
  if (!id) throw new Error("ID d'événement manquant");
  await api.delete(`/events/${id}`);
  return id;
};

// Exporte les fonctions individuellement ou en tant qu'objet
const eventService = {
  getEvents,
  getEventById,
  registerToEvent,
  createEvent,
  updateEvent,
  deleteEvent,
};
export default eventService;
