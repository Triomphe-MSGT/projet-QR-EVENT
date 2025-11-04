// qrevent-backend/utils/middleware.js
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const config = require("../utils/config.js");
const logger = require("../utils/logger.js"); // ✅ 2. Assurez-vous que logger.js est au bon endroit

const userExtractor = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"]; // Standardisé
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      req.user = null;
      return next();
    }

    const token = authHeader.split(" ")[1];

    // ✅ 3. Utiliser config.JWT_SECRET
    const decoded = jwt.verify(token, config.JWT_SECRET);

    // ✅ 4. S'assurer que le token contient 'id' et 'role' (comme vos contrôleurs le font)
    if (!decoded.id) {
      return res.status(401).json({ error: "Token invalide (ID manquant)" });
    }

    // Attache l'ID et le Rôle. Inutile de refaire un appel DB ici
    // si le token est fiable et que vos contrôleurs n'ont besoin que de l'ID/rôle.
    // req.user = { id: decoded.id, role: decoded.role };

    // --- OU ---
    // Si vous voulez VRAIMENT l'objet User complet (plus lourd pour la DB) :
    const user = await User.findById(decoded.id).select("-passwordHash");
    if (!user) {
      return res.status(401).json({ error: "Utilisateur du token non trouvé" });
    }
    req.user = user; // Attache l'objet User complet

    next();
  } catch (err) {
    logger.error("Erreur lors de la vérification du token :", err.message);

    if (err.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ error: "Le token a expiré, veuillez vous reconnecter" });
    }
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Token invalide ou corrompu" });
    }

    return res.status(500).json({ error: "Erreur d'authentification" });
  }
};

const authorize = (roles = []) => {
  const allowedRoles = Array.isArray(roles)
    ? roles.map((r) => r.toLowerCase())
    : [roles.toLowerCase()];

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Utilisateur non authentifié" });
    }

    if (!allowedRoles.includes(req.user.role.toLowerCase())) {
      logger.error(`Accès refusé à ${req.user.email}, rôle : ${req.user.role}`);
      return res
        .status(403)
        .json({ error: "Accès interdit. Droits insuffisants." });
    }

    next();
  };
};

const unknownEndpoint = (req, res) => {
  res.status(404).json({ error: "Endpoint inconnu" });
};

const errorHandler = (err, req, res, next) => {
  logger.error("Erreur attrapée :", err?.message || err);

  if (err.name === "CastError") {
    return res.status(400).json({ error: "ID mal formaté" });
  }

  if (err.name === "ValidationError") {
    return res.status(400).json({ error: err.message });
  }

  if (err.code === 11000) {
    return res.status(400).json({ error: "Cet email est déjà utilisé" });
  }

  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ error: "Token invalide" });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({ error: "Token expiré" });
  }

  return res.status(500).json({ error: "Erreur serveur interne" });
};

module.exports = {
  userExtractor,
  authorize,
  unknownEndpoint,
  errorHandler,
};
