const mongoose = require("mongoose");
const Category = require("../models/category");

// Vérification ID valide
const validateId = (id) => mongoose.Types.ObjectId.isValid(id);

const getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().populate("events", "title date");
    res.json(categories);
  } catch (error) {
    next(error);
  }
};

const getCategoryById = async (req, res, next) => {
  try {
    if (!validateId(req.params.id)) {
      return res.status(400).json({ error: "ID invalide" });
    }

    const category = await Category.findById(req.params.id).populate(
      "events",
      "title date"
    );

    if (!category) {
      return res.status(404).json({ error: "Catégorie non trouvée" });
    }

    res.json(category);
  } catch (error) {
    next(error);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const { name, emoji, description } = req.body;

    const existing = await Category.findOne({ name });
    if (existing) {
      return res.status(400).json({ error: "Cette catégorie existe déjà." });
    }

    const category = new Category({ name, emoji, description });
    const saved = await category.save();

    res.status(201).json(saved);
  } catch (error) {
    next(error);
  }
};

const getCategoryByName = async (req, res, next) => {
  try {
    const category = await Category.findOne({ name: req.params.name }).populate(
      "events",
      "title date"
    );

    if (!category) {
      return res.status(404).json({ error: "Catégorie non trouvée" });
    }

    res.json(category);
  } catch (error) {
    next(error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    if (!validateId(req.params.id)) {
      return res.status(400).json({ error: "ID invalide" });
    }

    const { name, emoji, description } = req.body;

    // Vérifier si un autre document a déjà ce nom
    const existing = await Category.findOne({ name });
    if (existing && existing._id.toString() !== req.params.id) {
      return res.status(400).json({ error: "Cette catégorie existe déjà." });
    }

    const updated = await Category.findByIdAndUpdate(
      req.params.id,
      { name, emoji, description },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Catégorie non trouvée" });
    }

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    if (!validateId(req.params.id)) {
      return res.status(400).json({ error: "ID invalide" });
    }

    const deleted = await Category.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: "Catégorie non trouvée" });
    }

    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryByName,
};
