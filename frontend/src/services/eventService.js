import axios from 'axios';

const API_URL = 'http://localhost:3000/events';

const getEvents = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error("Échec de la récupération des événements:", error);
    return [];
  }
};

export default { getEvents };