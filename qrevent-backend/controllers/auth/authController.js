const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../../models/user"); // Assurez-vous que le chemin est bon
const { OAuth2Client } = require("google-auth-library");
const config = require("../../utils/config"); // 1. Importer le fichier config

// 2. Initialiser le client avec la variable du config
const client = new OAuth2Client(config.GOOGLE_CLIENT_ID);

const register = async (req, res, next) => {
  try {
    // 3. Logique d'inscription simplifiée (nom, email, password)
    const { nom, email, password } = req.body;

    if (!nom || !email || !password) {
      return res
        .status(400)
        .json({ error: "Nom, email et mot de passe sont requis." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email déjà utilisé" });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 4. Utiliser Cloudinary (req.file.path)
    const image = req.file ? req.file.path : null;

    const user = new User({
      nom,
      email,
      passwordHash,
      image: image,
      // role, sexe, etc. sont 'default' ou 'required: false' dans le modèle
    });

    const savedUser = await user.save();

    // 5. Connecter l'utilisateur directement
    const token = jwt.sign(
      { id: savedUser._id, role: savedUser.role },
      config.JWT_SECRET, // Utiliser config.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Inscription réussie",
      token,
      user: savedUser.toJSON(),
    });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: "Utilisateur introuvable" });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid)
      return res.status(401).json({ message: "Mot de passe incorrect" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      config.JWT_SECRET, // Utiliser config.JWT_SECRET,
      { expiresIn: "7d" }
    );
    res
      .status(200)
      .json({ message: "Connexion réussie", token, user: user.toJSON() });
  } catch (err) {
    next(err);
  }
};

const googleLogin = async (req, res, next) => {
  try {
    const { token } = req.body;

    // --- 6. CORRECTION DE LA FAUTE DE FRAPPE ---
    // (et utilisation de config au lieu de process.env)
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: config.GOOGLE_CLIENT_ID, // Corrigé !
    });
    // --- FIN CORRECTION ---

    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      // Si l'utilisateur n'existe pas, on le crée
      const randomPassword = Math.random().toString(36).slice(-8);
      const passwordHash = await bcrypt.hash(randomPassword, 10);

      user = new User({
        nom: name,
        email: email,
        passwordHash, // Requis par le schéma
        image: picture, // Image de profil Google
        role: "Participant", // Rôle par défaut (selon votre user.js)
      });
      await user.save();
    }

    // Créer notre propre token JWT
    const tokenJWT = jwt.sign(
      { id: user._id, role: user.role },
      config.JWT_SECRET, // Utiliser config.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({ token: tokenJWT, user: user.toJSON() });
  } catch (err) {
    if (err.message.includes("Invalid token")) {
      return res.status(401).json({ message: "Token Google invalide" });
    }
    next(err); // Laisse le errorHandler gérer le reste
  }
};

module.exports = {
  register,
  login,
  googleLogin,
};
