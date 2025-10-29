import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "https://projet-qr-event-uzrp.onrender.com/api",
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
    // Si la réponse est OK (2xx), on la retourne
    return response;
  },
  (error) => {
    // Si on reçoit une erreur 401 ou 403
    if (error.response && [401, 403].includes(error.response.status)) {
      console.log("Session expirée ou invalide. Déconnexion...");
      // 1. Supprimer le token
      localStorage.removeItem("token");

      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
