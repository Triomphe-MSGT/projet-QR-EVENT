import api from "../slices/axiosInstance";

export const getDashboardStats = async () => {
  try {
    const response = await api.get("/dashboard/organizer-stats");
    return response.data;
  } catch (error) {
    console.error("❌ Échec récupération stats dashboard:", error);

    return { totalEvents: 0, totalRegistrations: 0, qrValidated: 0 };
  }
};

export const getMyOrganizedEvents = async () => {
  try {
    const response = await api.get("/events/organizer/me");

    return response.data || [];
  } catch (error) {
    console.error("❌ Échec récupération événements organisés:", error);
    return [];
  }
};
