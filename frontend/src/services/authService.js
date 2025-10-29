import api from "../slices/apiInstance";

const authService = {
  login: async (email, password) => {
    try {
      const res = await api.post("/auth/login", { email, password });
      const { token, user } = res.data;
      return {
        user: { nom: user.nom, email: user.email, role: user.role },
        token,
      };
    } catch (err) {
      // Gestion des erreurs 401 (identifiants incorrects)
      if (err.response?.status === 401) {
        throw new Error(
          err.response.data?.message || "Email ou mot de passe incorrect"
        );
      }
      // Autres erreurs serveur
      throw new Error("Erreur serveur");
    }
  },

  register: async (userData) => {
    try {
      const payload = {
        nom: userData.nom,
        email: userData.email,
        password: userData.password,
        role: userData.role,
        sexe: userData.sexe,
        phone: userData.phone || "Non renseigné",
        profession: userData.profession || "Non renseigné",
      };

      await api.post("/auth/register", payload);

      // Auto-login après inscription
      return authService.login(payload.email, payload.password);
    } catch (err) {
      console.error(
        "Erreur complète du serveur :",
        err.response?.data || err.message
      );
      throw new Error(
        err.response?.data?.message ||
          err.message ||
          "Erreur lors de l'inscription"
      );
    }
  },

  // ------------------------
  // Google Login
  // ------------------------
  googleLogin: async (googleToken) => {
    try {
      const res = await api.post("/auth/google", { token: googleToken });
      const { token, user } = res.data;
      return { user, token };
    } catch (err) {
      console.error(
        "Erreur complète du serveur :",
        err.response?.data || err.message
      );
      throw new Error(
        err.response?.data?.error ||
          err.message ||
          "Erreur lors de la connexion Google"
      );
    }
  },
};

export default authService;
