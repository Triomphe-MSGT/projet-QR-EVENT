// backend/routes/notifications.js
const express = require("express");
const router = express.Router();
const { userExtractor } = require("../utils/middleware");
const {
  getMyNotifications,
  markAllAsRead,
} = require("../controllers/notificationController");

// ✅ Récupérer les notifications
router.get("/", userExtractor, getMyNotifications);

// ✅ Marquer comme lues
router.post("/read", userExtractor, markAllAsRead);

module.exports = router;
