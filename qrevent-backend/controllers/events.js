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
const { sendEmail } = require("../services/emailService");
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
    const events = await Event.find({ visibility: { $ne: "private" } })
      .populate("organizer", "nom email")
      .populate("category", "name emoji")
      .sort({ startDate: -1 })
      .lean();
    console.log(`getAllEvents: Found ${events.length} public events`);
    res.json(events);
  } catch (error) {
    console.error("Error in getAllEvents:", error);
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
      type: body.format || body.type, // Sync type with format
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

    if (body.format) body.type = body.format; // Sync type with format

    const updatedEvent = await Event.findByIdAndUpdate(eventId, body, {
      new: true,
      runValidators: true,
    })
      .populate("organizer", "nom email")
      .populate("category", "name emoji")
      .lean();

    if (!updatedEvent) return res.status(404).json({ error: "Événement introuvable après mise à jour." });

    // --- NOTIFICATIONS AUX PARTICIPANTS ---
    // On le fait en "fire-and-forget" pour ne pas bloquer la réponse
    (async () => {
      try {
        const participants = updatedEvent.participants || [];
        const io = req.app.get("io");

        for (const participant of participants) {
          // Ne pas notifier l'organisateur s'il est dans la liste (peu probable mais possible)
          if (participant._id.toString() === user.id) continue;

          const message = `L'événement "${updatedEvent.name}" a été modifié par l'organisateur.`;
          
          const notification = new Notification({
            user: participant._id,
            sender: user.id,
            message,
            link: `/events/${updatedEvent._id}`,
          });

          const savedNotif = await notification.save();
          emitToUser(io, participant._id.toString(), "new_notification", savedNotif);
        }
      } catch (notifError) {
        console.error("Erreur envoi notifications updateEvent:", notifError);
      }
    })();

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

    const isAdmin = user.role === ROLE_ADMIN;
    const isOwner = eventToDelete.organizer && eventToDelete.organizer.toString() === user.id;

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ error: "Action non autorisée." });
    }

    // Restriction : l'organisateur ne peut supprimer que dans les 24h suivant la création
    if (!isAdmin && isOwner) {
      const creationDate = eventToDelete.createdAt || eventToDelete._id.getTimestamp();
      const now = new Date();
      const diffInHours = (now - creationDate) / (1000 * 60 * 60);

      if (diffInHours > 24) {
        return res.status(403).json({ 
          error: "Délai de suppression dépassé (24h). Seul un administrateur peut supprimer cet événement." 
        });
      }
    }

    // --- NOTIFICATIONS AUX PARTICIPANTS (AVANT SUPPRESSION) ---
    // On le fait en "fire-and-forget"
    (async () => {
      try {
        // Il faut peupler les participants pour avoir leurs IDs
        const eventWithParticipants = await Event.findById(eventId).populate("participants");
        const participants = eventWithParticipants.participants || [];
        const io = req.app.get("io");

        for (const participant of participants) {
          if (participant._id.toString() === user.id) continue;

          const message = `L'événement "${eventToDelete.name}" a été annulé par l'organisateur.`;
          
          const notification = new Notification({
            user: participant._id,
            sender: user.id,
            message,
            link: "/dashboard", // Rediriger vers le dashboard car l'event n'existe plus
          });

          const savedNotif = await notification.save();
          emitToUser(io, participant._id.toString(), "new_notification", savedNotif);
        }
      } catch (notifError) {
        console.error("Erreur envoi notifications deleteEvent:", notifError);
      }
    })();

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
        let textBody = `Bonjour ${participantUser.nom},\n\nVous êtes inscrit à ${event.name} (${new Date(event.startDate).toLocaleDateString("fr-FR")}).`;
        
        let qrMessage = "";
        if (qrCodeUrl) {
          textBody += `\n\nVotre QR Code d'accès est disponible dans l'application.`;
          qrMessage = `<p style="margin-top: 20px; font-weight: bold; color: #3b82f6;">Votre QR Code d'accès est disponible dans l'application.</p>
                       <p>Veuillez le présenter à l'entrée.</p>`;
        }

        const htmlBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
          <div style="background: linear-gradient(to right, #3b82f6, #4ade80); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Qr-Event</h1>
          </div>
          <div style="padding: 20px; background-color: #ffffff;">
            <h2 style="color: #1f2937; margin-top: 0;">Bonjour ${participantUser.nom},</h2>
            <p style="color: #4b5563; line-height: 1.6;">
              Votre inscription à l'événement <strong>${event.name}</strong> a été confirmée avec succès.
            </p>
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p style="margin: 5px 0; color: #374151;"><strong>📅 Date :</strong> ${new Date(event.startDate).toLocaleDateString("fr-FR")}</p>
              <p style="margin: 5px 0; color: #374151;"><strong>📍 Lieu :</strong> ${event.city}</p>
            </div>
            ${qrMessage}
            <p style="color: #4b5563; margin-top: 20px;">
              Merci de votre confiance !
            </p>
          </div>
          <div style="background-color: #f9fafb; padding: 15px; text-align: center; font-size: 12px; color: #9ca3af;">
            &copy; ${new Date().getFullYear()} Qr-Event. Tous droits réservés.
          </div>
        </div>
        `;

        try {
          await sendEmail(participantUser.email, subject, textBody, htmlBody);
          console.info(`E-mail de confirmation envoyé à ${participantUser.email}`);
        } catch (e) {
          console.warn("Échec envoi e-mail confirmation :", e.message);
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

const path = require("path");
const fs = require("fs");

/**
 * GET /events/:id/report (PDF or CSV generation)
 */
const generateEventReport = async (req, res, next) => {
  try {
    requireAuthUser(req);
    const eventId = req.params.id;
    const format = req.query.format || "pdf";

    if (!isValidObjectId(eventId))
      return res.status(400).json({ error: "ID d'événement invalide." });

    const event = await Event.findById(eventId)
      .populate("category", "name")
      .lean();
    if (!event) return res.status(404).json({ error: "Événement non trouvé." });

    if (!canEditEvent(req.user, event))
      return res.status(403).json({ error: "Action non autorisée." });

    const inscriptions = await Inscription.find({ event: eventId })
      .populate("participant", "nom email sexe profession phone")
      .lean();

    const totalRegistered = inscriptions.length;
    const validatedInscriptions = inscriptions.filter((i) => i.isValidated);
    const totalValidated = validatedInscriptions.length;
    const participationRate =
      totalRegistered > 0 ? (totalValidated / totalRegistered) * 100 : 0;

    // --- GÉNÉRATION CSV ---
    if (format === "csv") {
      const fields = [
        "Nom",
        "Prénom",
        "Email",
        "Sexe",
        "Profession",
        "Téléphone",
        "Statut",
        "Date Validation",
      ];
      const csvRows = inscriptions.map((ins) => {
        const p = ins.participant || {};
        const names = (p.nom || "").split(" ");
        const nom = names[0] || "N/A";
        const prenom = names.slice(1).join(" ") || "N/A";

        return [
          `"${nom}"`,
          `"${prenom}"`,
          `"${p.email || ""}"`,
          `"${p.sexe || ""}"`,
          `"${p.profession || ""}"`,
          `"${p.phone || ""}"`,
          `"${ins.isValidated ? "Présent" : "Inscrit"}"`,
          `"${ins.validatedAt ? new Date(ins.validatedAt).toLocaleString() : ""}"`,
        ].join(",");
      });

      const csvContent = "\uFEFF" + [fields.join(","), ...csvRows].join("\n");

      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="rapport-${(event.name || "event").replace(/\s+/g, "_")}.csv"`
      );
      return res.send(csvContent);
    }

    // --- GÉNÉRATION PDF ---
    const doc = new PDFDocument({ margin: 40, layout: "portrait", size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="rapport-${(event.name || "event").replace(/\s+/g, "_")}.pdf"`
    );

    doc.pipe(res);

    // --- HEADER DESIGN ---
    doc.rect(0, 0, 595, 80).fill("#1e293b");
    
    const logoPath = path.join(__dirname, "../assets/logo.png");
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 40, 15, { width: 50 });
    }

    doc
      .fillColor("#ffffff")
      .font("Helvetica-Bold")
      .fontSize(22)
      .text("QR-EVENT", 100, 25)
      .fontSize(10)
      .font("Helvetica")
      .text("PLATEFORME ÉVÉNEMENTIELLE PROFESSIONNELLE", 100, 50);

    doc.moveDown(4);
    doc.fillColor("#1e293b");

    // Title
    doc.font("Helvetica-Bold").fontSize(20).text("Rapport d'Événement", { align: "center" });
    doc.fontSize(16).fillColor("#3b82f6").text(event.name || "N/A", { align: "center" });
    doc.moveDown(1.5);

    // Details & Stats
    const startY = doc.y;
    doc.fillColor("#1e293b");
    
    doc.font("Helvetica-Bold").fontSize(14).text("Détails de l'Événement", 40, startY);
    doc.rect(40, doc.y + 2, 240, 1).fill("#cbd5e1");
    doc.moveDown(0.8);
    doc.font("Helvetica").fontSize(10).fillColor("#475569");
    doc.text(`Date: ${event.startDate ? new Date(event.startDate).toLocaleDateString("fr-FR") : "N/A"}`);
    doc.text(`Lieu: ${event.city || "N/A"}${event.neighborhood ? ", " + event.neighborhood : ""}`);
    doc.text(`Catégorie: ${event.category?.name || "N/A"}`);
    doc.text(`Prix: ${event.price > 0 ? `${event.price} FCFA` : "Gratuit"}`);

    doc.font("Helvetica-Bold").fontSize(14).text("Statistiques", 320, startY);
    doc.rect(320, doc.y + 2, 240, 1).fill("#cbd5e1");
    doc.moveDown(0.8);
    doc.font("Helvetica").fontSize(10).fillColor("#475569");
    doc.text(`Total Inscrits: ${totalRegistered}`, 320);
    doc.text(`Total Présents: ${totalValidated}`, 320);
    doc.text(`Taux de Participation: ${participationRate.toFixed(1)}%`, 320);

    doc.moveDown(4);

    // Participants Table
    doc.font("Helvetica-Bold").fontSize(14).fillColor("#1e293b").text("Liste des Participants", 40);
    doc.moveDown(0.8);

    const colX = {
      nom: 40,
      prenom: 120,
      email: 210,
      phone: 360,
      profession: 450,
      statut: 530
    };

    doc.fontSize(9).font("Helvetica-Bold").fillColor("#1e293b");
    doc.text("NOM", colX.nom);
    doc.text("PRÉNOM", colX.prenom, doc.y - 9);
    doc.text("EMAIL", colX.email, doc.y - 9);
    doc.text("TÉLÉPHONE", colX.phone, doc.y - 9);
    doc.text("PROFESSION", colX.profession, doc.y - 9);
    doc.text("STATUT", colX.statut, doc.y - 9);

    doc.moveDown(0.5);
    doc.strokeColor("#cbd5e1").lineWidth(1).moveTo(40, doc.y).lineTo(560, doc.y).stroke();
    doc.moveDown(0.8);

    doc.font("Helvetica").fontSize(8);
    inscriptions.forEach((ins, index) => {
      if (doc.y > 750) {
        doc.addPage();
        doc.font("Helvetica-Bold").fontSize(9).fillColor("#1e293b");
        doc.text("NOM", colX.nom, 40);
        doc.text("PRÉNOM", colX.prenom, 40);
        doc.text("EMAIL", colX.email, 40);
        doc.text("TÉLÉPHONE", colX.phone, 40);
        doc.text("PROFESSION", colX.profession, 40);
        doc.text("STATUT", colX.statut, 40);
        doc.strokeColor("#cbd5e1").moveTo(40, 55).lineTo(560, 55).stroke();
        doc.font("Helvetica").fontSize(8).y = 65;
      }

      const p = ins.participant || {};
      const names = (p.nom || "").split(" ");
      const nom = names[0] || "N/A";
      const prenom = names.slice(1).join(" ") || "N/A";
      
      const rowY = doc.y;
      if (index % 2 === 0) {
        doc.rect(35, rowY - 5, 530, 18).fill("#f8fafc");
        doc.fillColor("#1e293b");
      }

      doc.text(nom, colX.nom, rowY, { width: 75, truncate: true });
      doc.text(prenom, colX.prenom, rowY, { width: 85, truncate: true });
      doc.text(p.email || "N/A", colX.email, rowY, { width: 145, truncate: true });
      doc.text(p.phone || "N/A", colX.phone, rowY, { width: 85 });
      doc.text(p.profession || "N/A", colX.profession, rowY, { width: 75, truncate: true });
      
      const statusColor = ins.isValidated ? "#10b981" : "#64748b";
      doc.fillColor(statusColor).font("Helvetica-Bold").text(ins.isValidated ? "PRÉSENT" : "INSCRIT", colX.statut, rowY);
      doc.fillColor("#1e293b").font("Helvetica");

      doc.moveDown(1.5);
    });

    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);
      doc.fillColor("#94a3b8").fontSize(8).text(
        `Page ${i + 1} sur ${range.count} - Généré le ${new Date().toLocaleString("fr-FR")}`,
        0,
        810,
        { align: "center" }
      );
    }

    doc.end();
  } catch (error) {
    console.error("Erreur génération rapport:", error);
    next(error);
  }
};

/**
 * POST /events/:id/like
 */
const toggleLikeEvent = async (req, res, next) => {
  try {
    requireAuthUser(req);
    const eventId = req.params.id;
    const userId = req.user.id;

    if (!isValidObjectId(eventId)) return res.status(400).json({ error: "ID d'événement invalide." });

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ error: "Événement non trouvé." });

    const likeIndex = event.likes.indexOf(userId);
    if (likeIndex === -1) {
      // Like
      event.likes.push(userId);
    } else {
      // Unlike
      event.likes.splice(likeIndex, 1);
    }

    await event.save();
    res.json({ likes: event.likes });
  } catch (error) {
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
  toggleLikeEvent,
};
