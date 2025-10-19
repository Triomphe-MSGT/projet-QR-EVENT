const express = require("express");
const router = express.Router();

const {
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getAllUsers,
} = require("../controllers/userController");

const { userExtractor, authorize } = require("../utils/middleware");
const { login, register } = require("../controllers/auth/authController");
const createUpload = require("../utils/multerConfig");
const upload = createUpload("users");

/* ------------------ ROUTES PUBLIQUES ------------------ */
router.post("/register", upload.single("image"), register);
router.post("/login", login);

/* ------------------ ROUTES PRIVÉES ------------------ */
router.get(
  "/",
  userExtractor,
  authorize(["administrateur", "organisateur"]),
  getAllUsers
);
router.get(
  "/:id",
  userExtractor,
  authorize(["administrateur", "organisateur"]),
  getUserById
);
router.post(
  "/",
  userExtractor,
  authorize(["administrateur", "organisateur"]),
  upload.single("image"),
  createUser
);
router.put("/:id", userExtractor, upload.single("image"), updateUser);
router.delete("/:id", userExtractor, authorize(["administrateur"]), deleteUser);

module.exports = router;
