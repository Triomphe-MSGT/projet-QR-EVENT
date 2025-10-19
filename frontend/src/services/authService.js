import axios from "axios";

const API_BASE = "http://localhost:3000/api";

const authService = {
  login: async (email, password) => {
    try {
      const res = await axios.post(`${API_BASE}/login`, { email, password });
      const { token, nom, email: userEmail, role } = res.data;
      return { user: { nom, email: userEmail, role }, token };
    } catch (err) {
      if (err.response && err.response.status === 401) {
        throw new Error("Email ou mot de passe incorrect");
      }
      throw new Error("Erreur serveur");
    }
  },

  register: async (userData) => {
    try {
      const payload = {
        nom: userData.nom || userData.username || "SansNom",
        email: userData.email,
        password: userData.password,
        role: userData.role || "visiteur",
        sexe: "",
        profession: "",
        phone: userData.phone || "",
      };

      // Obligatoire pour organisateur / administrateur
      if (["organisateur"].includes(payload.role)) {
        payload.phone = userData.phone || "Non renseigné";
        payload.profession = userData.profession || "Non renseigné";
      }

      await axios.post(`${API_BASE}/users`, payload);

      return authService.login(payload.email, payload.password);
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

  // ------------------------
  // Google Login
  // ------------------------
  googleLogin: async (googleToken) => {
    try {
      const res = await axios.post(`${API_BASE}/auth/google`, {
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
