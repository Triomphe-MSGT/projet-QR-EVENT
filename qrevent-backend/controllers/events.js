// backend/controllers/events.js
const mongoose = require("mongoose");
const axios = require("axios");
const PDFDocument = require("pdfkit");

const Event = require("../models/event");
const User = require("../models/user");
const Category = require("../models/category");
const Inscription = require("../models/inscription");
const Notification = require("../models/Notification");

const qrCodeService = require("../services/qrCodeService");
const { emitToUser } = require("../socket/socketHandler");

const GEOAPIFY_KEY = process.env.GEOAPIFY_KEY || null;
const ROLE_ADMIN = "Administrateur";

// Helper utils --------------------------------------------------------------
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const requireAuthUser = (req) => {
  if (!req.user || !req.user.id) throw { status: 401, message: "Utilisateur non authentifié" };
};

const respondError = (next, error) => {
  // Normalise l'erreur pour next()
  if (error && error.status) {
    const err = new Error(error.message || "Erreur");
    err.status = error.status;
    return next(err);
  }
  return next(error);
};

// Geocoding helper (non bloquant) ------------------------------------------
const geocodeAddress = async ({ neighborhood, city }) => {
  if (!city || !GEOAPIFY_KEY) return null;

  try {
    const fullAddress = [neighborhood, city, "Cameroun"].filter(Boolean).join(", ");
    const geoRes = await axios.get("https://api.geoapify.com/v1/geocode/search", {
      params: { text: fullAddress, apiKey: GEOAPIFY_KEY },
      timeout: 5000,
    });
    const coords = geoRes?.data?.features?.[0]?.geometry?.coordinates;
    if (coords && coords.length === 2) {
      const [lng, lat] = coords;
      return { type: "Point", coordinates: [lng, lat] };
    }
  } catch (err) {
    console.warn("Geoapify non disponible / échec geocoding (non bloquant):", err.message);
  }
  return null;
};

// Role check helper ---------------------------------------------------------
const canEditEvent = (user, event) => {
  if (!user) return false;
  const isOwner = event.organizer && event.organizer.toString() === user.id;
  const isAdmin = user.role === ROLE_ADMIN;
  return isOwner || isAdmin;
};

// Controller methods --------------------------------------------------------
/**
 * GET /events
 */
const getAllEvents = async (req, res, next) => {
  try {
    const events = await Event.find()
      .populate("organizer", "nom email")
      .populate("category", "name emoji")
      .sort({ startDate: 1 })
      .lean();
    res.json(events);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /events/:id
 */
const getEventById = async (req, res, next) => {
  try {
    const eventId = req.params.id;
    if (!isValidObjectId(eventId)) {
      return res.status(400).json({ error: "ID d'événement invalide." });
    }

    const event = await Event.findById(eventId)
      .populate("organizer", "nom email")
      .populate("category", "name emoji")
      .populate("participants", "nom email role sexe profession")
      .lean();

    if (!event) return res.status(404).json({ error: "Événement non trouvé." });
    res.json(event);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /events
 */
const createEvent = async (req, res, next) => {
  try {
    requireAuthUser(req);
    const { body, user } = req;

    // Vérifier la catégorie
    if (!body.category || !isValidObjectId(body.category)) {
      return res.status(400).json({ error: "Catégorie invalide." });
    }
    const category = await Category.findById(body.category);
    if (!category) return res.status(400).json({ error: "Catégorie introuvable." });

    // Géolocalisation (non bloquante)
    const location = await geocodeAddress({ neighborhood: body.neighborhood, city: body.city });

    // Image URL (Cloudinary via multer-storage-cloudinary)
    const imageUrl = req.file ? req.file.path : null;

    const newEvent = new Event({
      ...body,
      organizer: user.id,
      imageUrl,
      location,
    });

    const savedEvent = await newEvent.save();

    // Mettre à jour la catégorie
    category.events.push(savedEvent._id);
    await category.save();

    res.status(201).json(savedEvent.toObject());
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ error: error.message });
    }
    respondError(next, error);
  }
};

/**
 * PUT /events/:id
 */
const updateEvent = async (req, res, next) => {
  try {
    requireAuthUser(req);
    const { body, user } = req;
    const eventId = req.params.id;

    if (!isValidObjectId(eventId)) {
      return res.status(400).json({ error: "ID d'événement invalide." });
    }

    const eventToUpdate = await Event.findById(eventId);
    if (!eventToUpdate) return res.status(404).json({ error: "Événement non trouvé." });

    if (!canEditEvent(user, eventToUpdate)) {
      return res.status(403).json({ error: "Action non autorisée." });
    }

    // Si catégorie modifiée, mettre à jour les références
    if (body.category && body.category !== eventToUpdate.category.toString()) {
      if (!isValidObjectId(body.category)) {
        return res.status(400).json({ error: "Nouvelle catégorie invalide." });
      }
      await Category.findByIdAndUpdate(eventToUpdate.category, { $pull: { events: eventId } });
      await Category.findByIdAndUpdate(body.category, { $addToSet: { events: eventId } });
    }

    // Gestion image Cloudinary
    if (req.file) {
      body.imageUrl = req.file.path;
      // TODO: supprimer ancienne image via Cloudinary si besoin
    } else if (body.image === null || body.image === "") {
      body.imageUrl = null;
    } else {
      delete body.imageUrl; // ne pas écraser si pas de changement
    }

    const updatedEvent = await Event.findByIdAndUpdate(eventId, body, {
      new: true,
      runValidators: true,
    })
      .populate("organizer", "nom email")
      .populate("category", "name emoji")
      .lean();

    if (!updatedEvent) return res.status(404).json({ error: "Événement introuvable après mise à jour." });

    res.json(updatedEvent);
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ error: error.message });
    }
    respondError(next, error);
  }
};

/**
 * DELETE /events/:id
 */
const deleteEvent = async (req, res, next) => {
  try {
    requireAuthUser(req);
    const { user } = req;
    const eventId = req.params.id;

    if (!isValidObjectId(eventId)) {
      return res.status(400).json({ error: "ID d'événement invalide." });
    }

    const eventToDelete = await Event.findById(eventId);
    if (!eventToDelete) return res.status(404).json({ error: "Événement non trouvé." });

    if (!canEditEvent(user, eventToDelete)) {
      return res.status(403).json({ error: "Action non autorisée." });
    }

    // Supprimer les inscriptions et nettoyer références
    await Promise.all([
      Inscription.deleteMany({ event: eventId }),
      User.updateMany({ _id: { $in: eventToDelete.participants } }, { $pull: { participatedEvents: eventId } }),
      Category.findByIdAndUpdate(eventToDelete.category, { $pull: { events: eventId } }),
      Event.findByIdAndDelete(eventId),
    ]);

    // TODO: supprimer image Cloudinary si nécessaire

    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

/**
 * POST /events/:id/register
 */
const registerToEvent = async (req, res, next) => {
  try {
    requireAuthUser(req);
    const eventId = req.params.id;
    const userId = req.user.id;

    if (!isValidObjectId(eventId)) return res.status(400).json({ error: "ID d'événement invalide." });

    const [participantUser, event] = await Promise.all([
      User.findById(userId),
      Event.findById(eventId),
    ]);

    if (!event) return res.status(404).json({ error: "Événement non trouvé." });
    if (!participantUser) return res.status(404).json({ error: "Utilisateur non trouvé." });

    if (event.participants.some((p) => p.toString() === participantUser._id.toString())) {
      return res.status(400).json({ error: "Vous êtes déjà inscrit." });
    }

    // Sauvegarder participation
    event.participants.push(participantUser._id);
    participantUser.participatedEvents.push(event._id);
    await Promise.all([event.save(), participantUser.save()]);

    // Préparer réponse immédiate
    let qrCodeUrl = null;
    let responsePayload = { message: "Inscription réussie", qrCode: null };

    // Si QR activé, générer inscription et token
    if (event.qrOption) {
      const qrFormData = {
        nom: req.body.nom || participantUser.nom,
        email: req.body.email || participantUser.email,
        profession: req.body.profession || participantUser.profession,
      };

      const { qrCodeImage, token } = await qrCodeService.generateQRCodeForInscription(
        qrFormData,
        event,
        participantUser
      );

      qrCodeUrl = qrCodeImage;

      const inscription = new Inscription({
        event: event._id,
        participant: participantUser._id,
        qrCodeToken: token,
        qrCodeImage,
      });
      await inscription.save();

      responsePayload.qrCode = qrCodeUrl;
    }

    // Répondre immédiatement au client
    res.status(201).json(responsePayload);

    // Envoyer e-mail et notifications en "background" (fire-and-forget)
    (async () => {
      try {
        // Email content (simple text + HTML can be delegated to email service)
        // sendEmail(...) => implémentation existante dans ton projet
        const subject = `Confirmation: ${event.name}`;
        const textBody = `Bonjour ${participantUser.nom},\n\nVous êtes inscrit à ${event.name} (${new Date(event.startDate).toLocaleDateString("fr-FR")}).`;
        const htmlBody = `<p>Bonjour ${participantUser.nom},</p><p>Vous êtes inscrit à <strong>${event.name}</strong>.</p>`;

        // sendEmail is assumed to exist globally or imported; wrap in try/catch
        if (typeof sendEmail === "function") {
          try {
            await sendEmail(participantUser.email, subject, textBody, htmlBody);
            console.info(`E-mail de confirmation envoyé à ${participantUser.email}`);
          } catch (e) {
            console.warn("Échec envoi e-mail confirmation :", e.message);
          }
        }

        // Notifications (participant + organizer)
        const userNotification = new Notification({
          user: participantUser._id,
          sender: event.organizer,
          message: responsePayload.qrCode
            ? `Inscription confirmée à "${event.name}". QR disponible.`
            : `Inscription confirmée à "${event.name}".`,
          link: responsePayload.qrCode ? "/my-qrcodes" : `/events/${event._id}`,
        });
        const savedUserNotif = await userNotification.save();
        emitToUser(req.app.get("io"), participantUser._id.toString(), "new_notification", savedUserNotif);

        if (event.organizer.toString() !== participantUser._id.toString()) {
          const orgNotification = new Notification({
            user: event.organizer,
            sender: participantUser._id,
            message: `${participantUser.nom} s'est inscrit à "${event.name}".`,
            link: "/dashboard",
          });
          const savedOrgNotif = await orgNotification.save();
          emitToUser(req.app.get("io"), event.organizer.toString(), "new_notification", savedOrgNotif);
        }
      } catch (bgErr) {
        console.error("Erreur tâches de fond inscription:", bgErr);
      }
    })();
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /events/:id/unregister
 */
const unregisterFromEvent = async (req, res, next) => {
  try {
    requireAuthUser(req);
    const eventId = req.params.id;
    const userId = req.user.id;

    if (!isValidObjectId(eventId)) return res.status(400).json({ error: "ID d'événement invalide." });

    await Promise.all([
      Event.findByIdAndUpdate(eventId, { $pull: { participants: userId } }),
      User.findByIdAndUpdate(userId, { $pull: { participatedEvents: eventId } }),
      Inscription.findOneAndDelete({ event: eventId, participant: userId }),
    ]);

    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

/**
 * POST /events/validate
 * Body: { qrCodeToken, eventName }
 */
const validateQRCodeWithEventName = async (req, res, next) => {
  try {
    requireAuthUser(req);
    const { qrCodeToken, eventName } = req.body;
    const userValidating = await User.findById(req.user.id);

    if (!userValidating) return res.status(401).json({ error: "Utilisateur non trouvé." });

    const inscription = await Inscription.findOne({ qrCodeToken })
      .populate("participant", "nom email profession")
      .populate("event", "name organizer");

    if (!inscription) return res.status(404).json({ error: "QR Code/incription introuvable." });

    if (inscription.event.name !== eventName) {
      return res.status(400).json({ error: "QR code pour un autre événement." });
    }

    const isEventOwner = inscription.event.organizer.toString() === userValidating._id.toString();
    const isAdmin = userValidating.role === ROLE_ADMIN;
    if (!isEventOwner && !isAdmin) {
      return res.status(403).json({ error: "Non autorisé à valider pour cet événement." });
    }

    if (inscription.isValidated) return res.status(409).json({ error: "QR code déjà utilisé." });

    inscription.isValidated = true;
    inscription.validatedBy = userValidating._id;
    inscription.validatedAt = new Date();
    await inscription.save();

    res.json({
      message: "QR code validé",
      participant: {
        id: inscription.participant._id,
        nom: inscription.participant.nom,
        email: inscription.participant.email,
        profession: inscription.participant.profession,
      },
      event: { id: inscription.event._id, name: inscription.event.name },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /events/:id/add-participant (admin/organizer)
 */
const addParticipant = async (req, res, next) => {
  try {
    requireAuthUser(req);
    const { participantId } = req.body;
    const eventId = req.params.id;
    const user = req.user;

    if (!isValidObjectId(eventId) || !isValidObjectId(participantId)) {
      return res.status(400).json({ error: "ID invalide." });
    }

    const [event, participant] = await Promise.all([Event.findById(eventId), User.findById(participantId)]);
    if (!event) return res.status(404).json({ error: "Événement non trouvé." });
    if (!participant) return res.status(404).json({ error: "Utilisateur non trouvé." });

    if (!canEditEvent(user, event)) return res.status(403).json({ error: "Action non autorisée." });

    if (event.participants.some((p) => p.toString() === participant._id.toString())) {
      return res.status(400).json({ error: "Utilisateur déjà inscrit." });
    }

    event.participants.push(participant._id);
    participant.participatedEvents.push(event._id);
    await Promise.all([event.save(), participant.save()]);

    if (event.qrOption) {
      const { qrCodeImage, token } = await qrCodeService.generateQRCodeForInscription(
        { nom: participant.nom, email: participant.email, profession: participant.profession },
        event,
        participant
      );
      await new Inscription({ event: event._id, participant: participant._id, qrCodeToken: token, qrCodeImage }).save();
    }

    const populatedEvent = await Event.findById(eventId)
      .populate("participants", "nom email role sexe profession")
      .populate("organizer", "nom email")
      .populate("category", "name emoji")
      .lean();

    res.json(populatedEvent);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /events/:id/participants/:participantId
 */
const removeParticipant = async (req, res, next) => {
  try {
    requireAuthUser(req);
    const participantId = req.params.participantId;
    const eventId = req.params.id;
    const user = req.user;

    if (!isValidObjectId(eventId) || !isValidObjectId(participantId)) {
      return res.status(400).json({ error: "ID invalide." });
    }

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ error: "Événement non trouvé." });

    if (!canEditEvent(user, event)) return res.status(403).json({ error: "Action non autorisée." });

    await Promise.all([
      Event.findByIdAndUpdate(eventId, { $pull: { participants: participantId } }),
      User.findByIdAndUpdate(participantId, { $pull: { participatedEvents: eventId } }),
      Inscription.findOneAndDelete({ event: eventId, participant: participantId }),
    ]);

    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

/**
 * GET /organizer/events
 */
const getEventsByOrganizer = async (req, res, next) => {
  try {
    requireAuthUser(req);
    const organizerId = req.user.id;

    const events = await Event.find({ organizer: organizerId })
      .populate("category", "name emoji")
      .populate("participants", "nom email role sexe profession")
      .sort({ startDate: -1 })
      .lean();

    res.json(events);
  } catch (error) {
    console.error("Erreur getEventsByOrganizer:", error);
    next(error);
  }
};

/**
 * GET /events/:id/validated-attendees
 */
const getValidatedAttendees = async (req, res, next) => {
  try {
    requireAuthUser(req);
    const eventId = req.params.id;
    const userId = req.user.id;

    if (!isValidObjectId(eventId)) return res.status(400).json({ error: "ID d'événement invalide." });

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ error: "Événement non trouvé." });

    if (!canEditEvent(req.user, event)) {
      return res.status(403).json({ error: "Action non autorisée." });
    }

    const inscriptions = await Inscription.find({ event: eventId, isValidated: true })
      .populate("participant", "nom email sexe profession")
      .lean();

    const attendees = inscriptions.map((i) => i.participant);
    res.json(attendees);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /events/:id/report (PDF generation using pdfkit)
 */
const generateEventReport = async (req, res, next) => {
  try {
    requireAuthUser(req);
    const eventId = req.params.id;
    const userId = req.user.id;

    if (!isValidObjectId(eventId)) return res.status(400).json({ error: "ID d'événement invalide." });

    const event = await Event.findById(eventId).populate("category", "name").lean();
    if (!event) return res.status(404).json({ error: "Événement non trouvé." });

    if (!canEditEvent(req.user, event)) return res.status(403).json({ error: "Action non autorisée." });

    const inscriptions = await Inscription.find({ event: eventId }).populate("participant", "nom email sexe profession").lean();

    const totalRegistered = inscriptions.length;
    const validatedInscriptions = inscriptions.filter((i) => i.isValidated);
    const totalValidated = validatedInscriptions.length;
    const participationRate = totalRegistered > 0 ? (totalValidated / totalRegistered) * 100 : 0;

    // Prepare pdf
    const doc = new PDFDocument({ margin: 50, layout: "portrait", size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="rapport-${(event.name || 'event').replace(/\s+/g, "_")}.pdf"`);

    doc.pipe(res);

    // Header
    doc.font("Helvetica-Bold").fontSize(20).text("Rapport d'Événement", { align: "center" });
    doc.fontSize(16).text(event.name || "N/A", { align: "center" });
    doc.moveDown(1.5);

    // Details
    doc.font("Helvetica-Bold").fontSize(14).text("Détails de l'Événement");
    doc.moveDown(0.4);
    doc.font("Helvetica").fontSize(11);
    doc.text(`Date: ${event.startDate ? new Date(event.startDate).toLocaleDateString("fr-FR") : "N/A"}`);
    doc.text(`Lieu: ${event.city || "N/A"}${event.neighborhood ? ", " + event.neighborhood : ""}`);
    doc.text(`Catégorie: ${event.category?.name || "N/A"}`);
    doc.text(`Prix: ${event.price > 0 ? `${event.price} FCFA` : "Gratuit"}`);
    doc.moveDown();

    // Stats
    doc.font("Helvetica-Bold").fontSize(14).text("Statistiques de participation");
    doc.moveDown(0.4);
    doc.font("Helvetica").fontSize(11);
    doc.text(`Total Inscrits: ${totalRegistered}`);
    doc.text(`Total Validés: ${totalValidated}`);
    doc.text(`Taux de Participation: ${participationRate.toFixed(1)}%`);
    doc.moveDown();

    // Démographie (sexe)
    doc.font("Helvetica-Bold").fontSize(14).text("Statistiques démographiques (par sexe)");
    doc.moveDown(0.4);
    const statsSexRegistered = inscriptions.reduce((acc, i) => {
      const sexe = i.participant?.sexe || "Inconnu";
      acc[sexe] = (acc[sexe] || 0) + 1;
      return acc;
    }, {});
    const statsSexValidated = validatedInscriptions.reduce((acc, i) => {
      const sexe = i.participant?.sexe || "Inconnu";
      acc[sexe] = (acc[sexe] || 0) + 1;
      return acc;
    }, {});
    const allSexes = new Set([...Object.keys(statsSexRegistered), ...Object.keys(statsSexValidated)]);
    allSexes.forEach((sexe) => {
      doc.font("Helvetica-Bold").fontSize(10).text(sexe || "Inconnu");
      doc.font("Helvetica").fontSize(10).text(`  Inscrits: ${statsSexRegistered[sexe] || 0} | Validés: ${statsSexValidated[sexe] || 0}`);
      doc.moveDown(0.3);
    });

    // Validated participants list
    doc.addPage();
    doc.font("Helvetica-Bold").fontSize(14).text(`Participants validés (${totalValidated})`);
    doc.moveDown(0.6);

    doc.font("Helvetica-Bold").fontSize(10);
    doc.text("Nom", 50, doc.y, { width: 140 });
    doc.text("Email", 200, doc.y, { width: 150 });
    doc.text("Sexe", 360, doc.y, { width: 50 });
    doc.text("Profession", 420, doc.y, { width: 130 });
    doc.moveDown(0.5);
    doc.strokeColor("#aaaaaa").lineWidth(0.5).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.6);
    doc.font("Helvetica").fontSize(9);

    validatedInscriptions.forEach((ins) => {
      const p = ins.participant || {};
      doc.text(p.nom || "N/A", 50, doc.y, { width: 140 });
      doc.text(p.email || "N/A", 200, doc.y, { width: 150 });
      doc.text(p.sexe || "N/A", 360, doc.y, { width: 50 });
      doc.text(p.profession || "N/A", 420, doc.y, { width: 130 });
      doc.moveDown(0.8);
    });

    // All registered list on a new page
    doc.addPage();
    doc.font("Helvetica-Bold").fontSize(14).text(`Tous les inscrits (${totalRegistered})`);
    doc.moveDown(0.6);

    doc.font("Helvetica-Bold").fontSize(10);
    doc.text("Nom", 50, doc.y, { width: 140 });
    doc.text("Email", 200, doc.y, { width: 150 });
    doc.text("Sexe", 360, doc.y, { width: 50 });
    doc.text("Profession", 420, doc.y, { width: 130 });
    doc.moveDown(0.5);
    doc.strokeColor("#aaaaaa").lineWidth(0.5).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.6);
    doc.font("Helvetica").fontSize(9);

    inscriptions.forEach((ins) => {
      const p = ins.participant || {};
      doc.text(p.nom || "N/A", 50, doc.y, { width: 140 });
      doc.text(p.email || "N/A", 200, doc.y, { width: 150 });
      doc.text(p.sexe || "N/A", 360, doc.y, { width: 50 });
      doc.text(p.profession || "N/A", 420, doc.y, { width: 130 });
      doc.moveDown(0.8);
    });

    doc.end();
  } catch (error) {
    console.error("Erreur génération PDF:", error);
    next(error);
  }
};

// Exports -------------------------------------------------------------------
module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  registerToEvent,
  unregisterFromEvent,
  validateQRCodeWithEventName,
  addParticipant,
  removeParticipant,
  getEventsByOrganizer,
  getValidatedAttendees,
  generateEventReport,
};
