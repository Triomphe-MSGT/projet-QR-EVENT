import api from "../slices/axiosInstance";

// Récupère tous les événements
export const getEvents = async () => {
  const { data } = await api.get("/events");
  console.log("eventService: getEvents returned", data.length, "events");
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

// --- NOUVELLE FONCTION AJOUTÉE ---
// Se désinscrire d'un événement
export const unregisterFromEvent = async (eventId) => {
  if (!eventId) throw new Error("ID d'événement manquant");
  // Appelle la route DELETE /api/events/:id/register
  await api.delete(`/events/${eventId}/register`);
  return eventId; // Retourne l'ID pour la mise à jour du cache
};

// Crée un événement
export const createEvent = async (formData) => {
  const { data } = await api.post("/events", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

// Met à jour un événement
export const updateEvent = async ({ id, formData }) => {
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

// Valide un QR code
export const validateQrCode = async (validationData) => {
  const { data } = await api.post("/events/validate-qr", validationData);
  return data;
};

export const addParticipant = async ({ eventId, participantId }) => {
  if (!eventId || !participantId)
    throw new Error("ID événement ou participant manquant");
  const { data } = await api.post(`/events/${eventId}/participants`, {
    participantId,
  });
  return data;
};

// Supprime un participant (action de l'organisateur/admin)
export const removeParticipant = async ({ eventId, participantId }) => {
  if (!eventId || !participantId)
    throw new Error("ID événement ou participant manquant");
  // Appelle la route DELETE /api/events/:eventId/participants/:participantId
  await api.delete(`/events/${eventId}/participants/${participantId}`);
  return { eventId, participantId }; // Retourne les ID pour la mise à jour du cache
};

// Liker/Unliker un événement
export const toggleLikeEvent = async (eventId) => {
  if (!eventId) throw new Error("ID d'événement manquant");
  const { data } = await api.post(`/events/${eventId}/like`);
  return data;
};

// Exporte les fonctions individuellement ou en tant qu'objet
const eventService = {
  getEvents,
  getEventById,
  registerToEvent,
  unregisterFromEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  validateQrCode,
  addParticipant,
  removeParticipant,
  toggleLikeEvent,
};
export default eventService;
