const jwt = require("jsonwebtoken");
const config = require("../utils/config");

// Stockage des utilisateurs connectés : { userId -> socketId }
const userSocketMap = new Map();

/**
 * Émettre un événement à un utilisateur connecté
 * @param {Server} io - Instance Socket.IO
 * @param {string} userId - ID de l'utilisateur
 * @param {string} event - Nom de l'événement
 * @param {any} data - Données à envoyer
 */
const emitToUser = (io, userId, event, data) => {
  if (!userId) return;

  const socketId = userSocketMap.get(userId.toString());
  if (socketId) {
    io.to(socketId).emit(event, data);
    console.log(`[Socket] Événement '${event}' émis à l'utilisateur ${userId}`);
  } else {
    console.log(`[Socket] Utilisateur ${userId} non connecté, émission manquée.`);
  }
};

/**
 * Handler principal pour Socket.IO avec authentification JWT
 * @param {Server} io - Instance Socket.IO
 */
const socketHandler = (io) => {
  // Middleware d'authentification
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Authentification échouée : Token manquant"));

    try {
      const decoded = jwt.verify(token, config.JWT_SECRET);
      if (!decoded.id) return next(new Error("Authentification échouée : Token invalide"));

      socket.user = decoded; // { id, role, ... }
      next();
    } catch (err) {
      return next(new Error("Authentification échouée : Token invalide"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.user.id.toString();
    console.log(`[Socket] ✅ Utilisateur connecté: ${userId} (Socket ID: ${socket.id})`);

    userSocketMap.set(userId, socket.id);

    socket.on("disconnect", () => {
      console.log(`[Socket] ❌ Utilisateur déconnecté: ${userId}`);
      userSocketMap.delete(userId);
    });
  });
};


module.exports = {
  socketHandler,
  emitToUser,
};
