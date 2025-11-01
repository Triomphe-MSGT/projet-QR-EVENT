import api from "../slices/axiosInstance";
import { saveAs } from "file-saver";

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

export const downloadEventReport = async (eventId, eventName) => {
  try {
    const response = await api.get(`/events/${eventId}/report`, {
      responseType: "blob", // !! Important: dit à axios de s'attendre à un fichier
    });

    // Crée un Blob à partir de la réponse
    const blob = new Blob([response.data], { type: "application/pdf" });

    // Utilise file-saver pour déclencher le téléchargement
    saveAs(blob, `Rapport_${eventName.replace(/ /g, "_")}.pdf`);
  } catch (error) {
    console.error("❌ Échec téléchargement du rapport:", error);
    // Gérer l'erreur (par exemple, afficher une notification)
    alert("Impossible de télécharger le rapport.");
  }
};

export const downloadAdminReport = async () => {
  try {
    const response = await api.get("/dashboard/admin-report", {
      responseType: "text", // On attend du texte (CSV)
    });

    // Crée un Blob à partir du texte CSV
    const blob = new Blob([response.data], { type: "text/csv;charset=utf-8;" });

    // Déclenche le téléchargement
    saveAs(blob, `rapport_admin_${new Date().toISOString().split("T")[0]}.csv`);

    return { success: true };
  } catch (error) {
    console.error("❌ Échec téléchargement du rapport admin:", error);
    alert("Impossible de télécharger le rapport.");
    return { success: false };
  }
};
