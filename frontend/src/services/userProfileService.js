import api from "../slices/axiosInstance"; // Ton instance 'api' préfixe déjà avec /api

const userProfileService = {
  // Récupérer le profil de l'utilisateur connecté
  getProfile: async () => {
    // CORRIGÉ : Appelle la route /users/me que nous avons créée
    const { data } = await api.get("/users/me");
    return data;
  },

  // Mettre à jour le profil (nom, profession, etc.)
  updateProfile: async (updatedData) => {
    // CORRIGÉ : Appelle la route /users/me
    const { data } = await api.put("/users/me", updatedData);
    return data;
  },

  // Upload de l'avatar
  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append("avatar", file); // 'avatar' doit correspondre au nom du 'upload.single'

    // CORRIGÉ : On crée une route /users/avatar pour ça
    const { data } = await api.post("/users/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  // Récupérer les événements liés à l'utilisateur
  getUserEvents: async () => {
    // CORRIGÉ : La logique est déplacée vers le backend.
    // On appelle simplement un nouvel endpoint.
    const { data } = await api.get("/users/me/events");
    return data; // Le backend renverra { organized: [...], participated: [...] }
  },

  upgradeToOrganizer: async (upgradeData) => {
    const { data } = await api.post("/users/me/upgrade-organizer", upgradeData);
    // Le backend est censé renvoyer { message, user }
    return data;
  },
};

export default userProfileService;
