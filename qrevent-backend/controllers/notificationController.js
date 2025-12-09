const Notification = require("../models/Notification");

// --- Récupérer les notifications de l'utilisateur connecté ---
const getMyNotifications = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Authentification requise" });
    }

    const notifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean(); // Plus performant, pas d'objets Mongoose

    return res.json(notifications);
  } catch (error) {
    next(error);
  }
};

// --- Marquer toutes les notifications comme lues ---
const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Authentification requise" });
    }

    await Notification.updateMany(
      { user: userId, isRead: false },
      { isRead: true }
    );

    return res.status(200).json({ message: "Toutes les notifications ont été marquées comme lues." });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyNotifications,
  markAllAsRead,
};
