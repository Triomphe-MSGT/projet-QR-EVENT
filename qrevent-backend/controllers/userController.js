const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

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
      image: req.file ? req.file.path.replace(/\\/g, "/") : null,
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
        image: req.file ? req.file.path.replace(/\\/g, "/") : targetUser.image,
      };

      const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        updateData,
        { new: true }
      );
      return res.json(updatedUser);
    }

    // Règle : administrateur ou organisateur peuvent tout modifier
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
        image: req.file ? req.file.path.replace(/\\/g, "/") : targetUser.image,
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

    // Supprimer la photo du dossier si elle existe
    if (deletedUser.image && fs.existsSync(deletedUser.image)) {
      fs.unlinkSync(path.resolve(deletedUser.image));
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
};
