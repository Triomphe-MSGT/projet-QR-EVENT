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

export const downloadEventReport = async (
  eventId,
  eventName,
  format = "pdf"
) => {
  try {
    const response = await api.get(
      `/events/${eventId}/report?format=${format}`,
      {
        responseType: "blob", // !! Important: dit à axios de s'attendre à un fichier
      }
    );

    // Détermine le type MIME et l'extension
    const mimeType =
      format === "csv" ? "text/csv;charset=utf-8;" : "application/pdf";
    const extension = format === "csv" ? "csv" : "pdf";

    // Crée un Blob à partir de la réponse
    const blob = new Blob([response.data], { type: mimeType });

    // Utilise file-saver pour déclencher le téléchargement
    saveAs(blob, `Rapport_${eventName.replace(/ /g, "_")}.${extension}`);
  } catch (error) {
    console.error("❌ Échec téléchargement du rapport:", error);
    // Gérer l'erreur (par exemple, afficher une notification)
    alert("Impossible de télécharger le rapport.");
  }
};

export const downloadAdminReport = async (format = "csv") => {
  try {
    const response = await api.get(`/dashboard/admin-report?format=${format}`, {
      responseType: "blob", // On attend un fichier (blob)
    });

    // Détermine le type MIME et l'extension
    const mimeType =
      format === "pdf" ? "application/pdf" : "text/csv;charset=utf-8;";
    const extension = format === "pdf" ? "pdf" : "csv";

    // Crée un Blob à partir de la réponse
    const blob = new Blob([response.data], { type: mimeType });

    // Déclenche le téléchargement
    saveAs(
      blob,
      `rapport_admin_${new Date().toISOString().split("T")[0]}.${extension}`
    );

    return { success: true };
  } catch (error) {
    console.error("❌ Échec téléchargement du rapport admin:", error);
    alert("Impossible de télécharger le rapport.");
    return { success: false };
  }
};
