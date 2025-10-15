import axios from "axios";

const API_URL = "http://localhost:3001/users";

const authService = {
  // ------------------------
  // Connexion classique
  // ------------------------
  login: async (email, password) => {
    const res = await axios.get(
      `${API_URL}?email=${email}&password=${password}`
    );
    const user = res.data[0];
    if (!user) throw new Error("Email ou mot de passe incorrect");

    const token = btoa(`${user.email}:${user.role}`);
    return { user, token };
  },

  // ------------------------
  // Inscription classique
  // ------------------------
  register: async ({
    email,
    username,
    password,
    role,
    sexe,
    phone,
    metier,
  }) => {
    // Vérifie si l'utilisateur existe déjà
    const exists = await axios.get(`${API_URL}?email=${email}`);
    if (exists.data.length > 0) {
      throw new Error("Cet email est déjà utilisé");
    }

    // Rôle par défaut = "user" si non précisé
    const newUser = {
      email,
      username,
      password,
      role: role || "user",
      sexe: sexe || "",
      phone: phone || "",
      metier: metier || "",
      avatarUrl: "/avatars/default.png",
    };

    const res = await axios.post(API_URL, newUser);
    const token = btoa(`${res.data.email}:${res.data.role}`);
    return { user: res.data, token };
  },

  // ------------------------
  // Connexion / inscription via Google
  // ------------------------
  googleLogin: async ({ token }) => {
    try {
      // Décodage du token Google côté front
      // (si tu utilises jwtDecode(credential) dans le composant React)
      // tu peux recevoir par exemple : { email, name, picture }

      // Ici, on suppose que tu reçois un objet :
      // { email, name, picture }
      const { email, name, picture } = token;

      // Vérifie si l'utilisateur existe déjà
      const res = await axios.get(`${API_URL}?email=${email}`);
      let user = res.data[0];

      // Si pas encore inscrit → création automatique
      if (!user) {
        const newUser = {
          email,
          username: name,
          password: "", // pas nécessaire
          role: "user",
          avatarUrl: picture || "/avatars/default.png",
          provider: "google",
        };
        const createRes = await axios.post(API_URL, newUser);
        user = createRes.data;
      }

      // Génération d’un "token" local (mocké)
      const mockToken = btoa(`${user.email}:${user.role}`);

      return { user, token: mockToken };
    } catch (err) {
      console.error("Erreur lors du login Google :", err);
      throw new Error("Erreur de connexion Google");
    }
  },
};

export default authService;
