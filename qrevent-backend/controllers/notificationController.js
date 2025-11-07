const Notification = require("../models/Notification"); // Assurez-vous d'avoir ce modèle

// GET /api/notifications
// Récupère toutes les notifications pour l'utilisateur connecté
const getMyNotifications = async (req, res, next) => {
  try {
    // userExtractor doit avoir été exécuté avant
    if (!req.user || !req.user.id) {
      return res.json([]);
    }

    const notifications = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 }) // Les plus récentes en premier
      .limit(20);
    res.json(notifications);
  } catch (error) {
    next(error);
  }
};

const markAllAsRead = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Authentification requise" });
    }

    // Met à jour toutes les notifications non lues de cet utilisateur
    await Notification.updateMany(
      { user: req.user.id, isRead: false },
      { $set: { isRead: true } }
    );
    res.status(204).end(); // Succès, pas de contenu
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyNotifications,
  markAllAsRead,
};
