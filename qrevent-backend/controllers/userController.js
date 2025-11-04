// Fichier: qrevent-backend/controllers/userController.js

const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Event = require("../models/event");
const Inscription = require("../models/inscription");

// --- SUPPRIMÉ ---
// Nous n'utilisons plus 'fs' ou 'path' pour gérer les images
// const fs = require("fs");
// const path = require("path");
// --- FIN SUPPRESSION ---

const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-passwordHash");
    res.json(users);
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-passwordHash");
    if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });
    res.json(user);
  } catch (error) {
    next(error);
  }
};

const createUser = async (req, res, next) => {
  try {
    const { nom, email, password, role, sexe, profession, phone } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: "Cet email est déjà utilisé." });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = new User({
      nom,
      email,
      passwordHash,
      role,
      sexe,
      profession,
      phone,
      image: req.file ? req.file.path : null,
    });

    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser)
      return res.status(404).json({ error: "Utilisateur non trouvé" });

    if (req.user.role === "Participant") {
      if (req.user.id !== targetUser.id) {
        return res.status(403).json({ error: "Accès refusé." });
      }

      const updateData = {
        nom: req.body.nom || targetUser.nom,
        image: req.file ? req.file.path : targetUser.image,
      };

      const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        updateData,
        { new: true }
      );
      return res.json(updatedUser);
    }

    const { nom, email, role, sexe, profession, phone } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        nom,
        email,
        role,
        sexe,
        profession,
        phone,

        image: req.file ? req.file.path : targetUser.image,
      },
      { new: true, runValidators: true }
    );

    res.json(updatedUser);
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    if (req.user.role !== "administrateur") {
      return res.status(403).json({
        error: "Seul l'administrateur peut supprimer un utilisateur.",
      });
    }

    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser)
      return res.status(404).json({ error: "Utilisateur non trouvé" });

    // --- SUPPRESSION ---
    // La logique 'fs.unlinkSync' est supprimée.
    // TODO (Optionnel) : Appeler l'API Cloudinary pour supprimer l'image
    // si 'deletedUser.image' existe.
    // --- FIN SUPPRESSION ---

    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Token manquant ou invalide" });
    }

    const user = await User.findById(req.user.id).select("-passwordHash");
    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
};

const updateMe = async (req, res, next) => {
  try {
    const { nom, email, profession, phone, sexe } = req.body;
    const userId = req.user.id;

    if (email) {
      const existingUser = await User.findOne({ email: email });
      if (existingUser && existingUser._id.toString() !== userId) {
        return res.status(400).json({ error: "Cet email est déjà utilisé." });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { nom, email, profession, phone, sexe },
      { new: true, runValidators: true }
    ).select("-passwordHash");

    if (!updatedUser) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }
    res.json(updatedUser);
  } catch (error) {
    next(error);
  }
};

const uploadUserAvatar = async (req, res, next) => {
  try {
    const userId = req.user.id;
    if (!req.file) {
      return res.status(400).json({ error: "Aucun fichier fourni" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    // --- SUPPRESSION ---
    // La logique 'fs.unlinkSync' est supprimée.
    // TODO (Optionnel) : Supprimer l'ancienne image de Cloudinary
    // --- FIN SUPPRESSION ---

    // --- CORRECTION ---
    // On sauvegarde la nouvelle URL complète de Cloudinary
    user.image = req.file.path;
    // --- FIN CORRECTION ---

    const savedUser = await user.save();

    res.json({ image: savedUser.image }); // Renvoie la nouvelle URL
  } catch (error) {
    next(error);
  }
};

const getMyEvents = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Récupère les événements que l'utilisateur organise
    const organizedEvents = await Event.find({ organizer: userId })
      .populate("category", "name emoji")
      .populate("participants", "nom email role sexe profession") // ✅ Important pour le dashboard
      .sort({ startDate: -1 });

    // Récupère les inscriptions (billets) de l'utilisateur
    const inscriptions = await Inscription.find({
      participant: userId,
    })
      .select("event qrCodeToken qrCodeImage") // On prend l'ID de l'événement, le token et l'image
      .populate({
        path: "event", // On charge les détails de l'événement lié
        populate: {
          path: "category", // On charge la catégorie de cet événement
          select: "name emoji",
        },
      });

    // On transforme les inscriptions en une liste d'événements
    // Votre code ici est déjà correct (il crée un 'id' et passe 'imageUrl')
    const participatedEvents = inscriptions
      .map((inscription) => {
        if (!inscription.event) return null;

        const event = inscription.event;

        return {
          id: event._id.toString(),
          name: event.name,
          startDate: event.startDate,
          city: event.city,
          imageUrl: event.imageUrl,
          category: event.category,
          // ... (ajoutez 'location' si nécessaire)
          location: event.location,

          qrCodeToken: inscription.qrCodeToken,
          qrCodeImage: inscription.qrCodeImage,
        };
      })
      .filter((event) => event !== null); // On retire les inscriptions invalides

    res.json({
      organized: organizedEvents,
      participated: participatedEvents,
    });
  } catch (error) {
    next(error);
  }
};

const upgradeToOrganizer = async (req, res, next) => {
  try {
    const userId = req.user.id; // Vient du token (middleware userExtractor)
    const { profession, sexe, phone } = req.body;

    if (!profession || !sexe || !phone) {
      return res.status(400).json({
        error:
          "La profession et le sexe et le numero de telephone sont requis.",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé." });
    }

    if (user.role !== "Participant") {
      return res
        .status(400)
        .json({ error: "Seul un Participant peut devenir organisateur." });
    }

    // Mise à jour des informations
    user.role = "Organisateur";
    user.profession = profession;
    user.sexe = sexe;
    user.phone = phone;

    const updatedUser = await user.save();

    res.status(200).json({
      message: "Félicitations, vous êtes maintenant un organisateur!",
      user: updatedUser.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getMe,
  updateMe,
  uploadUserAvatar,
  getMyEvents,
  upgradeToOrganizer,
};
