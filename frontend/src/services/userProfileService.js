// src/services/userProfileService.js
import api from "../slices/axiosInstance";

const userProfileService = {
  getProfile: async () => {
    const { data } = await api.get("/profile");
    return data;
  },

  updateProfile: async (updatedData) => {
    const { data } = await api.put("/profile", updatedData);
    return data;
  },

  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append("avatar", file);
    const { data } = await api.post("/profile/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  getUserEvents: async () => {
    const { data: profile } = await api.get("/profile");
    const { data: allEvents } = await api.get("/events");

    const organizedEvents = allEvents.filter(
      (ev) => ev.organizerId === profile.id
    );
    const participantEvents = allEvents.filter((ev) =>
      ev.participantsIds?.includes(profile.id)
    );
    return {
      organized: organizedEvents,
      participated: participantEvents,
    };
  },
};

export default userProfileService;
