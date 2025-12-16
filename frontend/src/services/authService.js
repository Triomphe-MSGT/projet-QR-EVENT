import api from "../slices/axiosInstance";

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
      const formData = new FormData();
      formData.append("nom", userData.nom);
      formData.append("email", userData.email);
      formData.append("password", userData.password);
      formData.append("role", userData.role);
      
      if (userData.sexe) formData.append("sexe", userData.sexe);
      if (userData.phone) formData.append("phone", userData.phone);
      if (userData.profession) formData.append("profession", userData.profession);

      if (["Organisateur"].includes(userData.role)) {
        if (!userData.phone) formData.append("phone", "Non renseigné");
        if (!userData.profession) formData.append("profession", "Non renseigné");
      }

      // Si une image est fournie (supposons qu'elle soit dans userData.image)
      if (userData.image) {
        formData.append("image", userData.image);
      }

      await api.post(`/auth/register`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return authService.login(userData.email, userData.password);
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
      // Renvoie un objet simple pour Redux
      return {
        user: {
          nom: user.nom,
          email: user.email,
          role: user.role,
          id: user.id,
        },
        token,
      };
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

export const forgotPassword = async (email) => {
  const response = await api.post("/auth/forgot-password", { email });
  return response.data;
};

export const resetPassword = async (token, newPassword) => {
  const response = await api.post("/auth/reset-password", {
    token,
    newPassword,
  });
  return response.data;
};

export default authService;
