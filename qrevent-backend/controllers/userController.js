const User = require("../models/user");
const bcrypt = require("bcrypt");
const Event = require("../models/event");
const Inscription = require("../models/inscription");

// -----------------------------------------------------
// GET : tous les utilisateurs (admin uniquement)
// -----------------------------------------------------
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-passwordHash").lean();
    res.json(users);
  } catch (error) {
    next(error);
  }
};

// -----------------------------------------------------
// GET : utilisateur par ID
// -----------------------------------------------------
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-passwordHash")
      .lean();

    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
};

// -----------------------------------------------------
// POST : création de compte utilisateur
// -----------------------------------------------------
const createUser = async (req, res, next) => {
  try {
    const { nom, email, password, role, sexe, profession, phone } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
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

// -----------------------------------------------------
// PUT : mise à jour d’un utilisateur (Admin ou lui-même)
// -----------------------------------------------------
const updateUser = async (req, res, next) => {
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser)
      return res.status(404).json({ error: "Utilisateur non trouvé" });

    // ➤ Participant : peut seulement modifier son propre profil
    if (req.user.role === "Participant" && req.user.id !== targetUser.id) {
      return res.status(403).json({ error: "Accès refusé." });
    }

    const updateData = {
      nom: req.body.nom,
      email: req.body.email,
      role: req.body.role,
      sexe: req.body.sexe,
      profession: req.body.profession,
      phone: req.body.phone,
      image: req.file ? req.file.path : targetUser.image,
    };

    const updatedUser = await User.findByIdAndUpdate(
      targetUser.id,
      updateData,
      { new: true, runValidators: true }
    ).select("-passwordHash");

    res.json(updatedUser);
  } catch (error) {
    next(error);
  }
};

// -----------------------------------------------------
// DELETE : suppression d’un utilisateur (Admin uniquement)
// -----------------------------------------------------
const deleteUser = async (req, res, next) => {
  try {
    if (req.user.role !== "administrateur") {
      return res.status(403).json({
        error: "Seul l'administrateur peut supprimer un utilisateur.",
      });
    }

    const deletedUser = await User.findByIdAndDelete(req.params.id);

    if (!deletedUser) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

// -----------------------------------------------------
// GET : profil connecté
// -----------------------------------------------------
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-passwordHash")
      .lean();

    if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });

    res.json(user);
  } catch (error) {
    next(error);
  }
};

// -----------------------------------------------------
// PUT : mise à jour du profil connecté
// -----------------------------------------------------
const updateMe = async (req, res, next) => {
  try {
    const { email } = req.body;
    const userId = req.user.id;

    if (email) {
      const exists = await User.findOne({ email });
      if (exists && exists._id.toString() !== userId) {
        return res.status(400).json({ error: "Cet email est déjà utilisé." });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      req.body,
      { new: true, runValidators: true }
    ).select("-passwordHash");

    res.json(updatedUser);
  } catch (error) {
    next(error);
  }
};

// -----------------------------------------------------
// POST : upload avatar utilisateur
// -----------------------------------------------------
const uploadUserAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Aucun fichier fourni" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });

    // Mise à jour avatar
    user.image = req.file.path;
    await user.save();

    res.json({ image: user.image });
  } catch (error) {
    next(error);
  }
};

// -----------------------------------------------------
// GET : événements organisés + événements participés
// -----------------------------------------------------
const getMyEvents = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const organizedEvents = await Event.find({ organizer: userId })
      .populate("category", "name emoji")
      .populate("participants", "nom email role sexe profession")
      .sort({ startDate: -1 })
      .lean();

    const inscriptions = await Inscription.find({ participant: userId })
      .select("event qrCodeToken qrCodeImage")
      .populate({
        path: "event",
        populate: { path: "category", select: "name emoji" },
      })
      .lean();

    const participatedEvents = inscriptions
      .filter((i) => i.event)
      .map((i) => ({
        id: i.event._id,
        name: i.event.name,
        startDate: i.event.startDate,
        city: i.event.city,
        location: i.event.location,
        imageUrl: i.event.imageUrl,
        category: i.event.category,
        qrCodeToken: i.qrCodeToken,
        qrCodeImage: i.qrCodeImage,
      }));

    res.json({
      organized: organizedEvents,
      participated: participatedEvents,
    });
  } catch (error) {
    next(error);
  }
};

// -----------------------------------------------------
// POST : passer de participant → organisateur
// -----------------------------------------------------
const upgradeToOrganizer = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ error: "Utilisateur non trouvé." });

    if (user.role !== "Participant") {
      return res.status(400).json({
        error: "Seul un Participant peut devenir Organisateur.",
      });
    }

    const { profession, sexe, phone } = req.body;
    if (!profession || !sexe || !phone) {
      return res.status(400).json({
        error: "La profession, le sexe et le numéro de téléphone sont requis.",
      });
    }

    user.role = "Organisateur";
    user.profession = profession;
    user.sexe = sexe;
    user.phone = phone;

    const updated = await user.save();

    res.json({
      message: "Félicitations, vous êtes maintenant Organisateur !",
      user: updated.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

// -----------------------------------------------------
// PUT : changer mot de passe
// -----------------------------------------------------
const changeMyPassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword)
      return res.status(400).json({
        error: "L'ancien et le nouveau mot de passe sont requis.",
      });

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ error: "Le nouveau mot de passe doit faire au moins 6 caractères." });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "Utilisateur non trouvé." });

    const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: "L'ancien mot de passe est incorrect." });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Mot de passe mis à jour avec succès." });
  } catch (error) {
    next(error);
  }
};

// -----------------------------------------------------
// DELETE : supprimer mon compte
// -----------------------------------------------------
const deleteMe = async (req, res, next) => {
  try {
    const userId = req.user.id;

    await Inscription.deleteMany({ participant: userId });

    await Event.updateMany(
      { participants: userId },
      { $pull: { participants: userId } }
    );

    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).json({ error: "Utilisateur non trouvé." });
    }

    res.status(204).end();
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
  changeMyPassword,
  deleteMe,
};
