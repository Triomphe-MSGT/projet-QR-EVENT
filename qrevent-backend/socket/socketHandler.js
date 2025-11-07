const jwt = require("jsonwebtoken");
const config = require("../utils/config");

// Stocke les utilisateurs connectés
// { "userId_abc": "socketId_123" }
const userSocketMap = new Map();

const emitToUser = (io, userId, event, data) => {
  if (!userId) return;

  const socketId = userSocketMap.get(userId.toString());
  if (socketId) {
    io.to(socketId).emit(event, data);
    console.log(`[Socket] Événement '${event}' émis à l'utilisateur ${userId}`);
  } else {
    console.log(
      `[Socket] Utilisateur ${userId} non connecté, émission manquée.`
    );
  }
};

const socketHandler = (io) => {
  // Middleware Socket.IO pour l'authentification
  io.use((socket, next) => {
    const token = socket.handshake.auth.token; // Le token envoyé par le client (depuis SocketContext)

    if (!token) {
      return next(new Error("Authentification échouée: Token manquant"));
    }

    try {
      // Vérifier le token JWT
      const decoded = jwt.verify(token, config.JWT_SECRET);
      if (!decoded.id) {
        return next(new Error("Authentification échouée: Token invalide"));
      }
      socket.user = decoded; // Attacher les infos utilisateur (id, role) au socket
      next();
    } catch (err) {
      return next(new Error("Authentification échouée: Token invalide"));
    }
  });

  // Gérer la connexion d'un utilisateur authentifié
  io.on("connection", (socket) => {
    const userId = socket.user.id;
    console.log(
      `[Socket] ✅ Utilisateur connecté: ${userId} (Socket ID: ${socket.id})`
    );

    // Lier l'ID utilisateur à l'ID du socket
    userSocketMap.set(userId, socket.id);

    // Gérer la déconnexion
    socket.on("disconnect", () => {
      console.log(`[Socket] ❌ Utilisateur déconnecté: ${userId}`);
      // Retirer l'utilisateur du map
      userSocketMap.delete(userId);
    });
  });
};

// Exporter le handler ET la fonction d'émission
module.exports = socketHandler;
module.exports.emitToUser = emitToUser;
