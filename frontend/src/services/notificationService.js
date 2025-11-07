import api from "../slices/axiosInstance"; // Votre client Axios configuré

const notificationService = {
  /**
   * Récupère les notifications pour l'utilisateur connecté
   */
  fetchNotifications: async () => {
    const { data } = await api.get("/notifications");

    return data;
  },

  /**
   * Marque toutes les notifications comme lues
   */
  markNotificationsAsRead: async () => {
    const { data } = await api.post("/notifications/read");

    return data;
  },
};

export default notificationService;
