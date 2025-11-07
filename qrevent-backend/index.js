const app = require("./app"); // Importe votre app.js existante
const config = require("./utils/config");
const logger = require("./utils/logger");
const http = require("http"); // 1. Importer http
const { Server } = require("socket.io"); // 2. Importer Server

// 3. Créer un serveur HTTP à partir de votre app Express
const server = http.createServer(app);

// 4. Initialiser Socket.IO et l'attacher au serveur http
const io = new Server(server, {
  cors: {
    origin: [process.env.FRONTEND_URL, "http://localhost:5173"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// C'est crucial pour que emitToUser fonctionne
app.set("io", io);

// 6. Importer la logique de gestion des connexions socket
require("./socket/socketHandler")(io);

// 7. Lancer le serveur HTTP (et non app.listen)
server.listen(config.PORT, () => {
  logger.info(`✅ Serveur (HTTP + Sockets) démarré sur le port ${config.PORT}`);
});
