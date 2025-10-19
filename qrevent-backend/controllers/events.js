const Event = require("../models/event");
const User = require("../models/user");
const Category = require("../models/category");
const Inscription = require("../models/inscription"); // Le modèle de ticket
const qrCodeService = require("../services/qrCodeService");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

// --- Obtenir tous les événements ---
const getAllEvents = async (req, res, next) => {
  try {
    const events = await Event.find()
      .populate("organizer", "nom email role")
      .populate("category", "name emoji")
      .populate("participants", "nom email role");

    res.json(events);
  } catch (error) {
    next(error);
  }
};

// --- Obtenir un événement par ID ---
const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate("organizer", "nom email role")
      .populate("category", "name emoji")
      .populate("participants", "nom email role");

    if (!event) return res.status(404).json({ error: "Événement non trouvé" });

    res.json(event);
  } catch (error) {
    next(error);
  }
};

// --- Créer un nouvel événement ---
const createEvent = async (req, res, next) => {
  try {
    const { body, user } = req;

    const category = await Category.findById(body.category);
    if (!category) return res.status(400).json({ error: "Catégorie invalide" });

    const event = new Event({
      ...body,
      organizer: user._id,
      imageUrl: req.file ? req.file.path.replace(/\\/g, "/") : null,
    });

    const savedEvent = await event.save();
    category.events.push(savedEvent._id);
    await category.save();

    res.status(201).json(savedEvent);
  } catch (error) {
    next(error);
  }
};

// --- Mettre à jour un événement ---
const updateEvent = async (req, res, next) => {
  try {
    const { body, user } = req;
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: "Événement non trouvé" });

    // Vérifie les droits
    if (
      user.role === "organisateur" &&
      event.organizer.toString() !== user._id.toString()
    )
      return res.status(403).json({ error: "Action non autorisée." });

    if (req.file) body.imageUrl = req.file.path.replace(/\\/g, "/");

    const updatedEvent = await Event.findByIdAndUpdate(req.params.id, body, {
      new: true,
      runValidators: true,
    });
    res.json(updatedEvent);
  } catch (error) {
    next(error);
  }
};

// --- Supprimer un événement ---
const deleteEvent = async (req, res, next) => {
  try {
    const { user } = req;
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: "Événement non trouvé" });

    if (
      user.role === "organisateur" &&
      event.organizer.toString() !== user._id.toString()
    )
      return res.status(403).json({ error: "Action non autorisée." });

    // Supprime l'image
    if (event.imageUrl && fs.existsSync(event.imageUrl)) {
      fs.unlinkSync(path.resolve(event.imageUrl));
    }

    // Supprime les inscriptions liées
    await Inscription.deleteMany({ event: event._id });

    // Retire l'événement des participants
    await User.updateMany(
      { _id: { $in: event.participants } },
      { $pull: { participatedEvents: event._id } }
    );

    // Supprime l'événement
    await Event.findByIdAndDelete(event._id);

    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

// --- Inscription d'un participant ---
const registerToEvent = async (req, res, next) => {
  try {
    const participant = req.user; // utilisateur connecté
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: "Événement non trouvé" });

    // Vérifie s'il est déjà inscrit
    if (event.participants.includes(participant._id))
      return res.status(400).json({ error: "Vous êtes déjà inscrit" });

    const { nom, email, profession, don } = req.body;

    if (!nom || !email || !profession || don !== true) {
      return res.status(400).json({
        error:
          "Tous les champs du formulaire sont requis et don doit être true",
      });
    }

    // Ajoute participant à l'événement et à sa liste de participations
    event.participants.push(participant._id);
    participant.participatedEvents.push(event._id);
    await event.save();
    await participant.save();

    // Génération QR code si activé
    if (event.qrOption) {
      const participantFormData = { nom, email, profession, don };
      const { qrCodeImage, token } =
        await qrCodeService.generateQRCodeForInscription(
          participantFormData,
          event,
          participant
        );

      // Sauvegarde dans la collection Inscription
      const inscription = new Inscription({
        event: event._id,
        participant: participant._id,
        qrCodeToken: token,
      });
      await inscription.save();

      return res.status(201).json({
        message: "Inscription réussie avec QR code",
        qrCode: qrCodeImage,
      });
    }

    res.status(201).json({ message: "Inscription réussie sans QR code" });
  } catch (error) {
    next(error);
  }
};

// --- Validation QR code ---
const validateQRCodeWithEventName = async (req, res, next) => {
  try {
    const { qrCodeToken, nom, email, profession, don, eventName } = req.body;
    const userOrganizer = req.user;

    // Cherche l'inscription correspondant au token
    let inscription = await Inscription.findOne({ qrCodeToken })
      .populate("participant")
      .populate("event");

    let participant, event;

    if (inscription) {
      participant = inscription.participant;
      event = inscription.event;

      // Vérifie que l'événement correspond
      if (event.name !== eventName)
        return res
          .status(400)
          .json({ error: "QR code pour un autre événement" });

      // Vérifie si le QR code est déjà validé
      if (inscription.isValidated)
        return res.status(409).json({ error: "QR code déjà utilisé" });

      // Vérifie les infos
      if (
        participant.nom !== nom ||
        participant.email !== email ||
        participant.profession !== profession ||
        don !== true
      ) {
        return res.status(400).json({ error: "Infos utilisateur incorrectes" });
      }

      inscription.isValidated = true;
      await inscription.save();
    } else {
      // Si pas d'inscription, cherche le participant ajouté par l'organisateur
      event = await Event.findOne({ name: eventName }).populate("participants");
      if (!event)
        return res.status(404).json({ error: "Événement non trouvé" });

      participant = event.participants.find(
        (p) => p.qrCodeToken === qrCodeToken
      );
      if (!participant)
        return res.status(404).json({ error: "QR Code invalide" });
    }

    // Vérifie que l'organisateur est bien celui de l'événement ou admin
    if (
      userOrganizer.role !== "administrateur" &&
      event.organizer.toString() !== userOrganizer._id.toString()
    ) {
      return res.status(403).json({ error: "Action non autorisée" });
    }

    res.json({
      message: "QR code validé avec succès",
      participant: {
        id: participant._id,
        nom: participant.nom,
        email: participant.email,
        profession: participant.profession,
      },
      event: {
        id: event._id,
        name: event.name,
      },
    });
  } catch (error) {
    next(error);
  }
};

// --- Ajouter un participant à un événement (Organisateur/Administrateur) ---
const addParticipant = async (req, res, next) => {
  try {
    const { participantId } = req.body;
    const { id: eventId } = req.params;
    const user = req.user;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ error: "Événement non trouvé" });

    // Seul l'organisateur de l'événement ou l'administrateur peut ajouter
    if (
      user.role === "organisateur" &&
      event.organizer.toString() !== user._id.toString()
    ) {
      return res.status(403).json({ error: "Action non autorisée." });
    }

    const participant = await User.findById(participantId);
    if (!participant)
      return res.status(404).json({ error: "Utilisateur non trouvé" });

    if (!event.participants.includes(participant._id)) {
      event.participants.push(participant._id);
      participant.participatedEvents.push(event._id);
      await event.save();
      await participant.save();
    }

    const populatedEvent = await Event.findById(eventId)
      .populate("participants", "nom email role")
      .populate("organizer", "nom email");

    res.json(populatedEvent);
  } catch (error) {
    next(error);
  }
};

// --- Supprimer un participant d'un événement (Organisateur/Administrateur) ---
const removeParticipant = async (req, res, next) => {
  try {
    const { participantId } = req.body;
    const { id: eventId } = req.params;
    const user = req.user;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ error: "Événement non trouvé" });

    // Vérification des droits
    if (
      user.role === "organisateur" &&
      event.organizer.toString() !== user._id.toString()
    ) {
      return res.status(403).json({ error: "Action non autorisée." });
    }

    await Event.findByIdAndUpdate(eventId, {
      $pull: { participants: participantId },
    });
    await User.findByIdAndUpdate(participantId, {
      $pull: { participatedEvents: eventId },
    });

    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

const getEventsByOrganizer = async (req, res, next) => {
  try {
    const organizer = req.user;

    // Vérifie que l'utilisateur est bien un organisateur
    if (organizer.role !== "organisateur") {
      return res.status(403).json({ error: "Action non autorisée." });
    }

    const events = await Event.find({ organizer: organizer._id })
      .populate("category", "name emoji")
      .populate("participants", "nom email role");

    res.json({
      organizer: {
        id: organizer._id,
        nom: organizer.nom,
        email: organizer.email,
      },
      events,
    });
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
