// backend/routes/notifications.js
const express = require("express");
const router = express.Router();
const { userExtractor } = require("../utils/middleware");
const {
  getMyNotifications,
  markAllAsRead,
  deleteNotification,
} = require("../controllers/notificationController");

// Récupérer les notifications
router.get("/", userExtractor, getMyNotifications);

// Marquer comme lues
router.post("/read", userExtractor, markAllAsRead);

// Supprimer une notification
router.delete("/:id", userExtractor, deleteNotification);

module.exports = router;
