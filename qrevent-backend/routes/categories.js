const express = require("express");
const {
  getAllCategories,
  getCategoryById,
  getCategoryByName, // On ajoute cette fonction
  createCategory,
  updateCategory,
  deleteCategory,
  checkSimilarity,
} = require("../controllers/categories");

const { userExtractor, authorize } = require("../utils/middleware");

const router = express.Router();

// --- Routes pour tous les utilisateurs connectés ---
router.get("/", userExtractor, getAllCategories);
router.get("/id/:id", userExtractor, getCategoryById);

router.get("/name/:name", userExtractor, getCategoryByName);

// --- Routes pour Administrateur et Organisateur ---
router.post("/check-similarity", userExtractor, authorize(["Administrateur", "Organisateur"]), checkSimilarity);
router.post("/", userExtractor, authorize(["Administrateur", "Organisateur"]), createCategory);

// --- Routes pour Administrateur seulement ---
router.put("/:id", userExtractor, authorize("Administrateur"), updateCategory);
router.delete(
  "/:id",
  userExtractor,
  authorize("Administrateur"),
  deleteCategory
);

module.exports = router;
