import api from "../slices/axiosInstance"; // Votre client Axios configuré

const notificationService = {
  /**
   * Récupère les notifications pour l'utilisateur connecté
   */
  fetchNotifications: async () => {
    // --- CORRECTION ---
    // Appelle "/notifications", pas "/api/notifications"
    const { data } = await api.get("/notifications");
    // --- FIN CORRECTION ---
    return data;
  },

  /**
   * Marque toutes les notifications comme lues
   */
  markNotificationsAsRead: async () => {
    // --- CORRECTION ---
    const { data } = await api.post("/notifications/read");
    // --- FIN CORRECTION ---
    return data;
  },
};

export default notificationService;
