const express = require("express");
const multer = require("multer");
const {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  registerToEvent,
  validateQRCodeWithEventName,
  addParticipant,
  removeParticipant,
  getEventsByOrganizer,
} = require("../controllers/events");
const { userExtractor, authorize } = require("../utils/middleware");

const router = express.Router();

// Gestion des images
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/events"),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// Middleware global pour extraire l'utilisateur
router.use(userExtractor);

// Routes publiques
router.get("/", getAllEvents);
router.get("/:id", getEventById);

// Création et modification (Admin et Organisateur)
router.post(
  "/",
  authorize(["administrateur", "organisateur"]),
  upload.single("image"),
  createEvent
);
router.put(
  "/:id",
  authorize(["administrateur", "organisateur"]),
  upload.single("image"),
  updateEvent
);
router.delete(
  "/:id",
  authorize(["administrateur", "organisateur"]),
  deleteEvent
);

// Gestion des participants (Organisateur seulement sur ses événements)
router.post(
  "/:id/participants",
  authorize(["administrateur", "organisateur"]),
  addParticipant
);
router.delete(
  "/:id/participants",
  authorize(["administrateur", "organisateur"]),
  removeParticipant
);

// Inscription d'un participant à un événement
router.post(
  "/:id/register",
  authorize(["participant", "administrateur", "organisateur"]),
  registerToEvent
);

// Validation QR Code par l'organisateur
router.post(
  "/:eventId/validate-qr-full",
  userExtractor,
  authorize(["organisateur", "administrateur"]),
  validateQRCodeWithEventName
);

// Obtenir les événements d'un organisateur, groupés par catégorie
router.get("/organizer/me", authorize(["organisateur"]), getEventsByOrganizer);

module.exports = router;
