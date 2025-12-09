const express = require("express");
const eventsController = require("../controllers/events");
const { userExtractor, authorize } = require("../utils/middleware");
const createUpload = require("../utils/multerConfig");

// Middleware Multer pour l'upload d'images des événements
const upload = createUpload("events");

// Création du routeur Express
const router = express.Router();

/* =========================================================
   1. Routes spécifiques pour l'organisateur connecté
   ========================================================= */

/**
 * GET /api/events/organizer/me
 * Récupère les événements créés par l'organisateur connecté
 * Accessible uniquement par un organisateur
 */
router.get(
  "/organizer/me",
  userExtractor,
  authorize(["Organisateur"]),
  eventsController.getEventsByOrganizer
);

/**
 * POST /api/events/validate-qr
 * Valide un QR Code pour un événement spécifique
 * Accessible par les organisateurs et les administrateurs
 */
router.post(
  "/validate-qr",
  userExtractor,
  authorize(["Organisateur", "administrateur"]),
  eventsController.validateQRCodeWithEventName
);

/* =========================================================
   2. Routes publiques
   ========================================================= */

/**
 * GET /api/events/
 * Récupère tous les événements
 * Peut être utilisé par tout utilisateur connecté
 */
router.get("/", userExtractor, eventsController.getAllEvents);

/* =========================================================
   3. Routes de création
   ========================================================= */

/**
 * POST /api/events/
 * Crée un nouvel événement
 * Accessible uniquement par les administrateurs et organisateurs
 * Upload d'une image via multer
 */
router.post(
  "/",
  userExtractor,
  authorize(["administrateur", "Organisateur"]),
  upload.single("image"),
  eventsController.createEvent
);

/* =========================================================
   4. Routes spécifiques avec /:id
   Ces routes doivent être définies avant la route générique /:id
   ========================================================= */

/**
 * GET /api/events/:id/report
 * Génère un rapport PDF pour un événement spécifique
 * Accessible par les administrateurs et organisateurs
 */
router.get(
  "/:id/report",
  userExtractor,
  authorize(["administrateur", "Organisateur"]),
  eventsController.generateEventReport
);

/**
 * GET /api/events/:id/validated-attendees
 * Récupère la liste des participants validés d'un événement
 */
router.get(
  "/:id/validated-attendees",
  userExtractor,
  authorize(["administrateur", "Organisateur"]),
  eventsController.getValidatedAttendees
);

/**
 * POST /api/events/:id/register
 * Permet à un utilisateur de s'inscrire à un événement
 */
router.post("/:id/register", userExtractor, eventsController.registerToEvent);

/**
 * POST /api/events/:id/participants
 * Ajoute manuellement un participant à un événement
 */
router.post(
  "/:id/participants",
  userExtractor,
  authorize(["administrateur", "Organisateur"]),
  eventsController.addParticipant
);

/**
 * DELETE /api/events/:id/participants/:participantId
 * Retire un participant d'un événement
 */
router.delete(
  "/:id/participants/:participantId",
  userExtractor,
  authorize(["administrateur", "Organisateur"]),
  eventsController.removeParticipant
);

/* =========================================================
   5. Routes génériques avec /:id
   Ces routes doivent toujours être définies en dernier
   ========================================================= */

/**
 * GET /api/events/:id
 * Récupère un événement par son ID
 */
router.get("/:id", userExtractor, eventsController.getEventById);

/**
 * PUT /api/events/:id
 * Met à jour un événement spécifique
 * Accessible uniquement par les administrateurs et organisateurs
 * Upload d'une image via multer
 */
router.put(
  "/:id",
  userExtractor,
  authorize(["administrateur", "Organisateur"]),
  upload.single("image"),
  eventsController.updateEvent
);

/**
 * DELETE /api/events/:id
 * Supprime un événement spécifique
 * Accessible uniquement par les administrateurs et organisateurs
 */
router.delete(
  "/:id",
  userExtractor,
  authorize(["administrateur", "Organisateur"]),
  eventsController.deleteEvent
);

// Export du routeur
module.exports = router;
