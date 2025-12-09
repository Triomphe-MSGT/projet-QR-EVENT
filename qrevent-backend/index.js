const app = require("./app");
const config = require("./utils/config");
const logger = require("./utils/logger");
const http = require("http");
const { Server } = require("socket.io");

// 3. Création du serveur HTTP
const server = http.createServer(app);

// 4. Initialisation de Socket.IO et l'attacher au serveur http
const io = new Server(server, {
  cors: {
    origin: [process.env.FRONTEND_URL, "http://localhost:5173"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.set("io", io);

// 6. logique de gestion des connexions socket
const { socketHandler } = require("./socket/socketHandler");
socketHandler(io);

server.listen(config.PORT, () => {
  logger.info(`✅ Serveur (HTTP + Sockets) démarré sur le port ${config.PORT}`);
});
