const Category = require("../models/category");

/**
 * 🟢 Obtenir toutes les catégories
 * Accessible uniquement aux administrateurs
 */
const getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().populate("events", "title date");
    res.json(categories);
  } catch (error) {
    next(error);
  }
};

/**
 * 🟢 Obtenir une catégorie par ID
 */
const getCategoryById = async (req, res, next) => {
  try {
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

/**
 * 🟢 Créer une nouvelle catégorie
 */
const createCategory = async (req, res, next) => {
  try {
    const { name, emoji, description } = req.body;

    // Vérifie si la catégorie existe déjà
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ error: "Cette catégorie existe déjà." });
    }

    const newCategory = new Category({ name, emoji, description });
    const savedCategory = await newCategory.save();

    res.status(201).json(savedCategory);
  } catch (error) {
    next(error);
  }
};

/**
 * 🟡 Mettre à jour une catégorie
 */
const updateCategory = async (req, res, next) => {
  try {
    const { name, emoji, description } = req.body;

    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      { name, emoji, description },
      { new: true, runValidators: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ error: "Catégorie non trouvée" });
    }

    res.json(updatedCategory);
  } catch (error) {
    next(error);
  }
};

/**
 * 🔴 Supprimer une catégorie
 */
const deleteCategory = async (req, res, next) => {
  try {
    const deletedCategory = await Category.findByIdAndDelete(req.params.id);

    if (!deletedCategory) {
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
};
