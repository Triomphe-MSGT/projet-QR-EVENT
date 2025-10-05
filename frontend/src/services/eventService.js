import axios from "axios";

const API_URL = "http://localhost:3000/events";

export const getEvents = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error("Échec de la récupération des événements:", error);
    throw error;
  }
};

// export const getEventsByCategory = async (category) => {
//   const { data } = await axios.get(`${API_URL}?type=${category}`);
//   return data;
// };

export const getEventById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(
      `Échec de la récupération de l'événement avec l'ID ${id}:`,
      error
    );
    throw error;
  }
};
export const createEvent = async (eventData) => {
  try {
    const response = await axios.post(API_URL, eventData);

    return response.data;
  } catch (error) {
    console.error("Échec de la création de l'événement:", error);
    throw error;
  }
};

export const updateEvent = async (id, eventData) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, eventData);
    return response.data;
  } catch (error) {
    console.error(
      `Échec de la mise à jour de l'événement avec l'ID ${id}:`,
      error
    );
    throw error;
  }
};

export const deleteEvent = async (id) => {
  try {
    await axios.delete(`${API_URL}/${id}`);
    return true;
  } catch (error) {
    console.error(
      `Échec de la suppression de l'événement avec l'ID ${id}:`,
      error
    );
    throw error;
  }
};

export const deleteAllEvents = async () => {
  try {
    await axios.delete(API_URL);
    return true;
  } catch (error) {
    console.error("Échec de la suppression de tous les événements:", error);
    throw error;
  }
};

export default {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventById,
  deleteAllEvents,
};
