import api from "../slices/axiosInstance";

const notificationService = {
  /**
   * Fetch notifications for the logged-in user.
   */
  fetchNotifications: async () => {
    const { data } = await api.get("/notifications");
    return data;
  },

  /**
   * Mark all notifications as read.
   */
  markNotificationsAsRead: async () => {
    const { data } = await api.post("/notifications/read");
    return data;
  },
};

export default notificationService;
