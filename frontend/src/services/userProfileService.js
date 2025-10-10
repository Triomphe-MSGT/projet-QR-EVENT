import api from "../slices/axiosInstance";

const userProfileService = {
  getProfile: async () => {
    const response = await api.get("/profile");
    return response.data;
  },

  updateProfile: async (updatedData) => {
    const response = await api.put("/profile", updatedData);
    return response.data;
  },

  getOrganizerEvents: async () => {
    const response = await api.get("/organizer/events");
    return response.data;
  },
  getParticipantEvents: async () => {
    const response = await api.get("/participant/events");
    return response.data;
  },

  getAllUsers: async () => {
    const response = await api.get("/admin/users");
    return response.data;
  },
};

export default userProfileService;
