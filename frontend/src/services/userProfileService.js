// src/services/userProfileService.js
import api from "../slices/axiosInstance";

const userProfileService = {
  // Récupérer le profil de l'utilisateur connecté
  getProfile: async () => {
    const { data } = await api.get("/profile");
    return data;
  },

  // Mettre à jour le profil
  updateProfile: async (updatedData) => {
    const { data } = await api.put("/profile", updatedData);
    return data;
  },

  // Upload de l'avatar
  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append("avatar", file);
    const { data } = await api.post("/profile/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  // Récupérer les événements liés à l'utilisateur selon son rôle
  getUserEvents: async () => {
    const { data: profile } = await api.get("/profile");
    const { data: allEvents } = await api.get("/events");

    let organizedEvents = [];
    let participatedEvents = [];

    if (profile.role === "organizer" || profile.role === "admin") {
      // Pour les organisateurs et admin : récupérer par IDs
      organizedEvents = allEvents.filter((ev) =>
        profile.organizerEvents?.includes(ev.id)
      );
      participatedEvents = allEvents.filter((ev) =>
        profile.participantEvents?.includes(ev.id)
      );
    } else {
      // Pour les participants : uniquement events auxquels ils participent
      participatedEvents = allEvents.filter((ev) =>
        profile.participantEvents?.includes(ev.id)
      );
    }

    return {
      organized: organizedEvents,
      participated: participatedEvents,
    };
  },
};

export default userProfileService;
