import axios from "axios";
export const API_BASE_URL ="http://localhost:3001/api"
//"https://projet-qr-event-uzrp.onrender.com/api";
;
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur de RÉPONSE (pour gérer les erreurs)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Si on reçoit une erreur 401 ou 403
    if (error.response && [401, 403].includes(error.response.status)) {
      console.log("Session expirée ou invalide. Déconnexion...");
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
