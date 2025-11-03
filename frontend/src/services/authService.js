import api from "../slices/axiosInstance";

// const API_BASE = "http://localhost:3001/api";

const authService = {
  login: async (email, password) => {
    try {
      const res = await api.post(`/auth/login`, {
        email,
        password,
      });
      const { token, user } = res.data;
      return {
        user: { nom: user.nom, email: user.email, role: user.role },
        token,
      };
    } catch (err) {
      if (err.response && err.response.status === 401) {
        throw new Error(
          err.response.data.message || "Email ou mot de passe incorrect"
        );
      }
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
        phone: userData.phone,
        profession: userData.profession,
      };

      if (["Organisateur"].includes(payload.role)) {
        payload.phone = userData.phone || "Non renseigné";
        payload.profession = userData.profession || "Non renseigné";
      }

      await api.post(`/auth/register`, payload);

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
      const res = await api.post(`/auth/google`, {
        token: googleToken,
      });
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
          "Erreur lors de l'inscription"
      );
    }
  },
};

export default authService;
