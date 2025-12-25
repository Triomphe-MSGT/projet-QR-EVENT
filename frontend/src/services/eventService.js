import api from "../slices/axiosInstance";

/**
 * Fetch all events.
 */
export const getEvents = async () => {
  const { data } = await api.get("/events");
  return data;
};

/**
 * Fetch event by ID.
 * @param {string} id
 */
export const getEventById = async (id) => {
  if (!id) throw new Error("Event ID missing");
  const { data } = await api.get(`/events/${id}`);
  return data;
};

/**
 * Register for an event.
 * @param {object} params - { eventId, formData }
 */
export const registerToEvent = async ({ eventId, formData }) => {
  if (!eventId) throw new Error("Event ID missing");
  const { data } = await api.post(`/events/${eventId}/register`, formData);
  return data;
};

/**
 * Unregister from an event.
 * @param {string} eventId
 */
export const unregisterFromEvent = async (eventId) => {
  if (!eventId) throw new Error("Event ID missing");
  await api.delete(`/events/${eventId}/register`);
  return eventId;
};

/**
 * Create a new event.
 * @param {FormData} formData
 */
export const createEvent = async (formData) => {
  const { data } = await api.post("/events", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

/**
 * Update an existing event.
 * @param {object} params - { id, formData }
 */
export const updateEvent = async ({ id, formData }) => {
  if (!id) throw new Error("Event ID missing");
  const { data } = await api.put(`/events/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

/**
 * Delete an event.
 * @param {string} id
 */
export const deleteEvent = async (id) => {
  if (!id) throw new Error("Event ID missing");
  await api.delete(`/events/${id}`);
  return id;
};

/**
 * Validate a QR code.
 * @param {object} validationData
 */
export const validateQrCode = async (validationData) => {
  const { data } = await api.post("/events/validate-qr", validationData);
  return data;
};

/**
 * Add a participant to an event.
 * @param {object} params - { eventId, participantId }
 */
export const addParticipant = async ({ eventId, participantId }) => {
  if (!eventId || !participantId)
    throw new Error("Event or Participant ID missing");
  const { data } = await api.post(`/events/${eventId}/participants`, {
    participantId,
  });
  return data;
};

/**
 * Remove a participant from an event.
 * @param {object} params - { eventId, participantId }
 */
export const removeParticipant = async ({ eventId, participantId }) => {
  if (!eventId || !participantId)
    throw new Error("Event or Participant ID missing");
  await api.delete(`/events/${eventId}/participants/${participantId}`);
  return { eventId, participantId };
};

/**
 * Toggle like on an event.
 * @param {string} eventId
 */
export const toggleLikeEvent = async (eventId) => {
  if (!eventId) throw new Error("Event ID missing");
  const { data } = await api.post(`/events/${eventId}/like`);
  return data;
};

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
