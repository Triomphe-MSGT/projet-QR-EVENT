import axios from "axios";

const API_URL = "http://localhost:3000/users";

const authService = {
  // Login existant
  login: async (email, password) => {
    const res = await axios.get(
      `${API_URL}?email=${email}&password=${password}`
    );
    const user = res.data[0];
    if (!user) throw new Error("Email ou mot de passe incorrect");
    const token = btoa(`${user.email}:${user.role}`);
    return { user, token };
  },

  // Nouveau : register
  register: async ({ email, username, password }) => {
    // Vérifier si l'utilisateur existe déjà
    const exists = await axios.get(`${API_URL}?email=${email}`);
    if (exists.data.length > 0) {
      throw new Error("Cet email est déjà utilisé");
    }

    // Créer utilisateur avec rôle par défaut : "user"
    const newUser = {
      email,
      username,
      password,
      role: "user",
      avatarUrl: "/avatars/default.png",
    };

    const res = await axios.post(API_URL, newUser);
    const token = btoa(`${res.data.email}:${res.data.role}`);
    return { user: res.data, token };
  },
};

export default authService;
