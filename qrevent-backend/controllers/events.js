// backend/controllers/events.js
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
const Event = require("../models/event");
const User = require("../models/user");
const Category = require("../models/category");
const Inscription = require("../models/inscription");
const qrCodeService = require("../services/qrCodeService");

// --- Obtenir tous les événements ---
const getAllEvents = async (req, res, next) => {
  try {
    const events = await Event.find()
      .populate("organizer", "nom email")
      .populate("category", "name emoji")
      .sort({ startDate: 1 });
    res.json(events);
  } catch (error) {
    next(error); // Passe l'erreur au gestionnaire global
  }
};

// --- Obtenir un événement par ID ---
const getEventById = async (req, res, next) => {
  try {
    const eventId = req.params.id;
    // Vérifie si l'ID est un ObjectId MongoDB valide
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ error: "ID d'événement invalide" });
    }

    const event = await Event.findById(eventId)
      .populate("organizer", "nom email")
      .populate("category", "name emoji")
      .populate("participants", "nom"); // Ajoute les participants

    if (!event) {
      return res.status(404).json({ error: "Événement non trouvé" });
    }
    res.json(event);
  } catch (error) {
    next(error);
  }
};

// --- Créer un nouvel événement ---
const createEvent = async (req, res, next) => {
  try {
    const { body, user } = req; // user contient { id: "...", role: "..." } du middleware

    // Vérifie si la catégorie existe
    const category = await Category.findById(body.category);
    if (!category) {
      return res.status(400).json({ error: "Catégorie invalide" });
    }

    const newEvent = new Event({
      ...body,
      organizer: user.id, // Utilise l'ID de l'utilisateur extrait du token
      // Sauvegarde un chemin relatif pour l'URL web
      imageUrl: req.file
        ? path.join("uploads", "events", req.file.filename).replace(/\\/g, "/")
        : null,
    });

    const savedEvent = await newEvent.save();

    // Ajoute la référence de l'événement à la catégorie
    category.events.push(savedEvent._id);
    await category.save();

    res.status(201).json(savedEvent);
  } catch (error) {
    // Gère spécifiquement les erreurs de validation Mongoose
    if (error.name === "ValidationError") {
      return res.status(400).json({ error: error.message });
    }
    next(error); // Passe les autres erreurs
  }
};

// --- Mettre à jour un événement ---
const updateEvent = async (req, res, next) => {
  try {
    const { body, user } = req;
    const eventId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ error: "ID d'événement invalide" });
    }

    const eventToUpdate = await Event.findById(eventId);
    if (!eventToUpdate) {
      return res.status(404).json({ error: "Événement non trouvé" });
    }

    // --- CORRECTION: Autorisation (Admin OU Organisateur propriétaire) ---
    const isOwner = eventToUpdate.organizer.toString() === user.id;
    const isAdmin = user.role === "administrateur";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: "Action non autorisée." });
    }

    // Si une nouvelle catégorie est fournie, on met à jour les références
    if (body.category && body.category !== eventToUpdate.category.toString()) {
      const oldCategoryId = eventToUpdate.category;
      const newCategoryId = body.category;

      // Retire l'event de l'ancienne catégorie
      await Category.findByIdAndUpdate(oldCategoryId, {
        $pull: { events: eventId },
      });
      // Ajoute l'event à la nouvelle catégorie
      await Category.findByIdAndUpdate(newCategoryId, {
        $push: { events: eventId },
      });
    }

    // Gère la mise à jour de l'image
    if (req.file) {
      // Supprime l'ancienne image si elle existe et n'est pas une URL externe
      if (
        eventToUpdate.imageUrl &&
        !eventToUpdate.imageUrl.startsWith("http") &&
        fs.existsSync(path.resolve(__dirname, "..", eventToUpdate.imageUrl))
      ) {
        try {
          fs.unlinkSync(path.resolve(__dirname, "..", eventToUpdate.imageUrl));
          console.log(`Ancienne image supprimée: ${eventToUpdate.imageUrl}`);
        } catch (unlinkErr) {
          console.error(
            "Erreur lors de la suppression de l'ancienne image:",
            unlinkErr
          );
        }
      } else if (eventToUpdate.imageUrl) {
        console.log(
          `Ancienne image non supprimée (URL externe ou fichier non trouvé): ${eventToUpdate.imageUrl}`
        );
      }
      body.imageUrl = path
        .join("uploads", "events", req.file.filename)
        .replace(/\\/g, "/");
      console.log(`Nouvelle image ajoutée: ${body.imageUrl}`);
    } else {
      // Si aucune nouvelle image n'est fournie, s'assurer de ne pas effacer l'ancienne par erreur
      // Si body.imageUrl est explicitement null ou '', alors on supprime l'ancienne.
      if (body.imageUrl === null || body.imageUrl === "") {
        if (
          eventToUpdate.imageUrl &&
          !eventToUpdate.imageUrl.startsWith("http") &&
          fs.existsSync(path.resolve(__dirname, "..", eventToUpdate.imageUrl))
        ) {
          try {
            fs.unlinkSync(
              path.resolve(__dirname, "..", eventToUpdate.imageUrl)
            );
            console.log(
              `Ancienne image supprimée (remplacée par null/vide): ${eventToUpdate.imageUrl}`
            );
          } catch (unlinkErr) {
            console.error(
              "Erreur lors de la suppression de l'ancienne image:",
              unlinkErr
            );
          }
        }
      } else {
        delete body.imageUrl;
      }
    }

    const updatedEvent = await Event.findByIdAndUpdate(eventId, body, {
      new: true,
      runValidators: true,
    })
      .populate("organizer", "nom email")
      .populate("category", "name emoji");

    if (!updatedEvent) {
      return res
        .status(404)
        .json({ error: "Événement non trouvé après mise à jour." });
    }

    res.json(updatedEvent);
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ error: error.message });
    }
    console.error("Erreur lors de la mise à jour de l'événement:", error);
    next(error);
  }
};

// --- Supprimer un événement ---
const deleteEvent = async (req, res, next) => {
  try {
    const { user } = req;
    const eventId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ error: "ID d'événement invalide" });
    }

    const eventToDelete = await Event.findById(eventId);
    if (!eventToDelete) {
      return res.status(404).json({ error: "Événement non trouvé" });
    }

    const isOwner = eventToDelete.organizer.toString() === user.id;
    const isAdmin = user.role === "administrateur";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: "Action non autorisée." });
    }

    if (
      eventToDelete.imageUrl &&
      !eventToDelete.imageUrl.startsWith("http") &&
      fs.existsSync(path.resolve(__dirname, "..", eventToDelete.imageUrl))
    ) {
      try {
        fs.unlinkSync(path.resolve(__dirname, "..", eventToDelete.imageUrl));
        console.log(`Image supprimée: ${eventToDelete.imageUrl}`);
      } catch (unlinkErr) {
        console.error("Erreur lors de la suppression de l'image:", unlinkErr);
      }
    }

    await Inscription.deleteMany({ event: eventId });

    await User.updateMany(
      { _id: { $in: eventToDelete.participants } },
      { $pull: { participatedEvents: eventId } }
    );
    await Category.findByIdAndUpdate(eventToDelete.category, {
      $pull: { events: eventId },
    });

    // Supprime l'événement lui-même
    await Event.findByIdAndDelete(eventId);

    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

const registerToEvent = async (req, res, next) => {
  try {
    const eventId = req.params.id;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ error: "ID d'événement invalide" });
    }

    const participantUser = await User.findById(userId);
    const event = await Event.findById(eventId);

    if (!event) return res.status(404).json({ error: "Événement non trouvé" });
    if (!participantUser)
      return res.status(404).json({ error: "Utilisateur non trouvé" });

    // Vérifie s'il est déjà inscrit
    if (event.participants.includes(participantUser._id)) {
      return res.status(400).json({ error: "Vous êtes déjà inscrit" });
    }

    const { nom, email, profession } = req.body;

    event.participants.push(participantUser._id);
    participantUser.participatedEvents.push(event._id);

    await event.save();
    await participantUser.save();

    // Génère le QR code si l'option est activée
    if (event.qrOption) {
      const { qrCodeImage, token } =
        await qrCodeService.generateQRCodeForInscription(
          { nom, email, profession },
          event,
          participantUser
        );
      const inscription = new Inscription({
        event: event._id,
        participant: participantUser._id,
        qrCodeToken: token,
        qrCodeImage: qrCodeImage,
      });

      await inscription.save();

      return res.status(201).json({
        message: "Inscription réussie avec QR code",
        qrCode: qrCodeImage,
      });
    }

    res.status(201).json({ message: "Inscription réussie" });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};

const validateQRCodeWithEventName = async (req, res, next) => {
  try {
    const { qrCodeToken, eventName } = req.body;
    const userValidating = await User.findById(req.user.id);

    if (!userValidating)
      return res
        .status(401)
        .json({ error: "Utilisateur validateur non trouvé." });

    const inscription = await Inscription.findOne({ qrCodeToken })
      .populate("participant", "nom email profession")
      .populate("event", "name organizer");

    if (!inscription)
      return res
        .status(404)
        .json({ error: "QR Code invalide ou inscription non trouvée." });

    const { participant, event } = inscription;

    if (event.name !== eventName)
      return res
        .status(400)
        .json({ error: "Ce QR code est pour un autre événement." });

    const isEventOwner =
      event.organizer.toString() === userValidating._id.toString();
    const isAdmin = userValidating.role === "administrateur";
    if (!isEventOwner && !isAdmin)
      return res.status(403).json({
        error: "Vous n'êtes pas autorisé à valider pour cet événement.",
      });

    if (inscription.isValidated)
      return res.status(409).json({ error: "Ce QR code a déjà été utilisé." });

    inscription.isValidated = true;
    inscription.validatedBy = userValidating._id;
    inscription.validatedAt = new Date();
    await inscription.save();

    res.json({
      message: "QR code validé avec succès",
      participant: {
        id: participant._id,
        nom: participant.nom,
        email: participant.email,
        profession: participant.profession,
      },
      event: { id: event._id, name: event.name },
    });
  } catch (error) {
    next(error);
  }
};

// --- Ajouter un participant (par Admin/Organisateur) ---
const addParticipant = async (req, res, next) => {
  try {
    const { participantId } = req.body;
    const eventId = req.params.id;
    const user = req.user; // { id, role }

    if (
      !mongoose.Types.ObjectId.isValid(eventId) ||
      !mongoose.Types.ObjectId.isValid(participantId)
    ) {
      return res.status(400).json({ error: "ID invalide." });
    }

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ error: "Événement non trouvé" });

    const isOwner = event.organizer.toString() === user.id;
    const isAdmin = user.role === "administrateur";
    if (!isOwner && !isAdmin)
      return res.status(403).json({ error: "Action non autorisée." });

    const participant = await User.findById(participantId);
    if (!participant)
      return res.status(404).json({ error: "Utilisateur non trouvé" });

    // Ajoute seulement si pas déjà présent
    if (!event.participants.includes(participant._id)) {
      event.participants.push(participant._id);
      participant.participatedEvents.push(event._id);
      await event.save();
      await participant.save();
    }

    const populatedEvent = await Event.findById(eventId)
      .populate("participants", "nom email")
      .populate("organizer", "nom email");

    res.json(populatedEvent);
  } catch (error) {
    next(error);
  }
};

const removeParticipant = async (req, res, next) => {
  try {
    const { participantId } = req.params;
    const eventId = req.params.id;
    const user = req.user;

    if (
      !mongoose.Types.ObjectId.isValid(eventId) ||
      !mongoose.Types.ObjectId.isValid(participantId)
    ) {
      return res.status(400).json({ error: "ID invalide." });
    }

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ error: "Événement non trouvé" });

    const isOwner = event.organizer.toString() === user.id;
    const isAdmin = user.role === "administrateur";
    if (!isOwner && !isAdmin)
      return res.status(403).json({ error: "Action non autorisée." });

    // Retire le participant de l'événement
    await Event.findByIdAndUpdate(eventId, {
      $pull: { participants: participantId },
    });
    // Retire l'événement du participant
    await User.findByIdAndUpdate(participantId, {
      $pull: { participatedEvents: eventId },
    });

    res.status(204).end(); // Succès, pas de contenu
  } catch (error) {
    next(error);
  }
};

const getEventsByOrganizer = async (req, res, next) => {
  try {
    const organizerId = req.user.id;

    const events = await Event.find({ organizer: organizerId })
      .populate("category", "name emoji")
      .populate("participants", "nom email");

    res.json(events);
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};
