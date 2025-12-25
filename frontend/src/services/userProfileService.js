import api from "../slices/axiosInstance";

const userProfileService = {
  getProfile: async () => {
    const { data } = await api.get("/users/me");
    return data;
  },

  updateProfile: async (updatedData) => {
    const { data } = await api.put("/users/me", updatedData);
    return data;
  },

  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append("avatar", file);

    const { data } = await api.post("/users/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  getUserEvents: async () => {
    const { data } = await api.get("/users/me/events");
    return data;
  },

  upgradeToOrganizer: async (upgradeData) => {
    const { data } = await api.post("/users/me/upgrade-organizer", upgradeData);

    return data;
  },

  changeMyPassword: async (passwordData) => {
    const { data } = await api.post("/users/me/change-password", passwordData);
    return data;
  },

  deleteMyAccount: async () => {
    const { data } = await api.delete("/users/me");
    return data;
  },
};

export default userProfileService;
