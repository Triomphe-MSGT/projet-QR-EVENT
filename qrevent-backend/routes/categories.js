const express = require("express");
const {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categories");

const { userExtractor, authorize } = require("../utils/middleware");

const router = express.Router();

// Toutes les routes sont protégées par le rôle administrateur
router.use(userExtractor, authorize("administrateur"));

router.get("/", getAllCategories);
router.get("/:id", getCategoryById);
router.post("/", createCategory);
router.put("/:id", updateCategory);
router.delete("/:id", deleteCategory);

module.exports = router;
