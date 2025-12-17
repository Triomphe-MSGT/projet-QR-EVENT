const express = require("express");
require("express-async-errors");
const app = express();
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
const config = require("./utils/config");
const logger = require("./utils/logger");
const middleware = require("./utils/middleware");

const usersRouter = require("./routes/users");
const eventsRouter = require("./routes/events");
const categoriesRouter = require("./routes/categories");
const dashboardRouter = require("./routes/dashboard");
const geocodeRoutes = require("./routes/geocode");
const notificationsRouter = require("./routes/notifications");

logger.info("connecting to", config.MONGODB_URI);
mongoose.set("strictQuery", false);
mongoose
  .connect(config.MONGODB_URI)
  .then(() => logger.info("connected to MongoDB"))
  .catch((err) => logger.error("error connecting to MongoDB:", err.message));

app.use(cors());
app.use(express.json());
app.use(express.static("dist"));

app.use("/api/users", usersRouter);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/events", eventsRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/auth", require("./routes/auth"));
app.use("/api/dashboard", dashboardRouter);
app.use("/api/geocode", geocodeRoutes);
app.use("/api/notifications", notificationsRouter);

// --- Gestion du Routing Frontend (SPA) ---
// Pour toute requête qui n'est PAS une API (ne commence pas par /api)
// et qui n'a pas été servie par express.static (fichiers statiques),
// on renvoie index.html pour laisser le React Router gérer l'affichage.
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) {
    return next();
  }
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;
