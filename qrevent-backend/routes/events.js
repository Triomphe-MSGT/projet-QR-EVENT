// backend/routes/events.js
const express = require("express");
const eventsController = require("../controllers/events");
const { userExtractor, authorize } = require("../utils/middleware");
const createUpload = require("../utils/multerConfig");

const upload = createUpload("events");
const router = express.Router();

// --- 1. Routes les plus spécifiques (sans /:id) ---

// GET /api/events/organizer/me (Voir les événements créés par l'organisateur connecté)
router.get(
  "/organizer/me",
  userExtractor,
  authorize(["Organisateur"]), // Seul un organisateur peut voir ses propres événements
  eventsController.getEventsByOrganizer
);

// POST /api/events/validate-qr (Valider un QR Code)
router.post(
  "/validate-qr",
  userExtractor,
  authorize(["Organisateur", "administrateur"]),
  eventsController.validateQRCodeWithEventName
);

// --- 2. Routes "publiques" (GET / est plus spécifique que /:id) ---

// GET /api/events/ (Obtenir tous les événements)
router.get("/", userExtractor, eventsController.getAllEvents);

// --- 3. Routes de création (POST /) ---

// POST /api/events/ (Création)
router.post(
  "/",
  userExtractor,
  authorize(["administrateur", "Organisateur"]),
  upload.single("image"),
  eventsController.createEvent
);

// --- 4. Routes spécifiques avec /:id (doivent être AVANT le /:id générique) ---

// GET /api/events/:id/report (Génération de rapport PDF)
router.get(
  "/:id/report",
  userExtractor,
  authorize(["administrateur", "Organisateur"]),
  eventsController.generateEventReport
);

// GET /api/events/:id/validated-attendees (Participants validés)
router.get(
  "/:id/validated-attendees",
  userExtractor,
  authorize(["administrateur", "Organisateur"]),
  eventsController.getValidatedAttendees
);

// POST /api/events/:id/register (Inscription d'un utilisateur)
router.post("/:id/register", userExtractor, eventsController.registerToEvent);

// POST /api/events/:id/participants (Ajouter un participant manuellement)
router.post(
  "/:id/participants",
  userExtractor,
  authorize(["administrateur", "Organisateur"]),
  eventsController.addParticipant
);

// DELETE /api/events/:id/participants/:participantId (Retirer un participant)
router.delete(
  "/:id/participants/:participantId",
  userExtractor,
  authorize(["administrateur", "Organisateur"]),
  eventsController.removeParticipant
);

// --- 5. Routes génériques avec /:id (doivent être EN DERNIER) ---

// GET /api/events/:id (Obtenir un événement par ID)
router.get("/:id", userExtractor, eventsController.getEventById);

// PUT /api/events/:id (Mise à jour)
router.put(
  "/:id",
  userExtractor,
  authorize(["administrateur", "Organisateur"]),
  upload.single("image"),
  eventsController.updateEvent
);

// DELETE /api/events/:id (Suppression)
router.delete(
  "/:id",
  userExtractor,
  authorize(["administrateur", "Organisateur"]),
  eventsController.deleteEvent
);

module.exports = router;
