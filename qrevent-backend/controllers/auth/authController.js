const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../../models/user");
const { OAuth2Client } = require("google-auth-library");
const config = require("../../utils/config");
const crypto = require("crypto");
const { sendEmail } = require("../../services/emailService");

// Client OAuth2 pour la connexion via Google
const client = new OAuth2Client(config.GOOGLE_CLIENT_ID);

/* =========================================================
   REGISTER - Inscription d'un nouvel utilisateur
   ========================================================= */

/**
 * Inscrit un nouvel utilisateur dans la base de données
 * Hash le mot de passe et génère un token JWT
 *
 * @param {import("express").Request} req - Requête HTTP
 * @param {import("express").Response} res - Réponse HTTP
 * @param {import("express").NextFunction} next - Middleware de gestion des erreurs
 */
const register = async (req, res, next) => {
  try {
    const { nom, email, password } = req.body;

    // Vérification des champs obligatoires
    if (!nom || !email || !password) {
      return res
        .status(400)
        .json({ message: "Nom, email et mot de passe sont requis." });
    }

    // Vérifie si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email déjà utilisé." });

    // Hash du mot de passe
    const passwordHash = await bcrypt.hash(password, 10);

    // Gestion de l'image (optionnelle)
    const image = req.file ? req.file.path : null;

    // Création du nouvel utilisateur
    const user = new User({
      nom,
      email,
      passwordHash,
      image,
    });

    const savedUser = await user.save();

    // Génération du JWT
    const token = jwt.sign(
      { id: savedUser._id, role: savedUser.role },
      config.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Supprime le passwordHash avant d'envoyer la réponse
    const safeUser = savedUser.toObject();
    delete safeUser.passwordHash;

    return res.status(201).json({
      message: "Inscription réussie",
      token,
      user: safeUser,
    });
  } catch (err) {
    next(err);
  }
};

/* =========================================================
   LOGIN - Connexion d'un utilisateur
   ========================================================= */

/**
 * Connecte un utilisateur existant avec email et mot de passe
 * Vérifie le mot de passe et retourne un JWT
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email et mot de passe requis." });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: "Utilisateur introuvable." });

    // Vérification du mot de passe
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid)
      return res.status(401).json({ message: "Mot de passe incorrect." });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      config.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const safeUser = user.toObject();
    delete safeUser.passwordHash;

    return res.status(200).json({
      message: "Connexion réussie",
      token,
      user: safeUser,
    });
  } catch (err) {
    next(err);
  }
};

/* =========================================================
   GOOGLE LOGIN - Connexion via Google OAuth2
   ========================================================= */

/**
 * Connecte un utilisateur via un token Google
 * Crée l'utilisateur s'il n'existe pas encore
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
const googleLogin = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token)
      return res.status(400).json({ message: "Token Google requis." });

    // Vérification du token Google
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: config.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    // Vérifie si l'utilisateur existe
    let user = await User.findOne({ email });

    // Création de l'utilisateur si inexistant
    if (!user) {
      const randomPassword = Math.random().toString(36).slice(-8);
      const passwordHash = await bcrypt.hash(randomPassword, 10);

      user = new User({
        nom: name,
        email,
        passwordHash,
        image: picture,
        role: "Participant",
      });

      await user.save();
    }

    // Génération du JWT
    const tokenJWT = jwt.sign(
      { id: user._id, role: user.role },
      config.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const safeUser = user.toObject();
    delete safeUser.passwordHash;

    return res.status(200).json({
      message: "Connexion Google réussie",
      token: tokenJWT,
      user: safeUser,
    });
  } catch (err) {
    // Gestion des erreurs liées au token Google invalide
    if (err.message.includes("Invalid token")) {
      return res.status(401).json({ message: "Token Google invalide." });
    }
    next(err);
  }
};

/* =========================================================
   FORGOT PASSWORD - Demande de réinitialisation
   ========================================================= */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email requis." });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable." });

    // Générer un token
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 heure

    await user.save();

    // Lien de réinitialisation (Frontend URL)
    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password/${resetToken}`;

    const subject = "Réinitialisation de votre mot de passe";
    const text = `Vous avez demandé une réinitialisation de mot de passe.\n\nVeuillez cliquer sur le lien suivant :\n${resetUrl}\n\nCe lien expire dans 1 heure.`;
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Réinitialisation de mot de passe</h2>
        <p>Vous avez demandé à réinitialiser votre mot de passe.</p>
        <p>Cliquez sur le bouton ci-dessous pour procéder :</p>
        <a href="${resetUrl}" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Réinitialiser mon mot de passe</a>
        <p style="margin-top: 20px;">Ou copiez ce lien : <br> ${resetUrl}</p>
        <p>Ce lien expire dans 1 heure.</p>
      </div>
    `;

    await sendEmail(user.email, subject, text, html);

    res.status(200).json({ message: "Email de réinitialisation envoyé." });
  } catch (err) {
    next(err);
  }
};

/* =========================================================
   RESET PASSWORD - Nouveau mot de passe
   ========================================================= */
const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ message: "Token et nouveau mot de passe requis." });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Token invalide ou expiré." });
    }

    // Hash du nouveau mot de passe
    user.passwordHash = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({ message: "Mot de passe réinitialisé avec succès." });
  } catch (err) {
    next(err);
  }
};

// Export des fonctions du controller
module.exports = {
  register,
  login,
  googleLogin,
  forgotPassword,
  resetPassword,
};
