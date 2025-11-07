const express = require("express");
const router = express.Router();

const {
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getAllUsers,
  getMe,
  updateMe,
  uploadUserAvatar,
  getMyEvents,
  upgradeToOrganizer,
  changeMyPassword,
  deleteMe,
} = require("../controllers/userController");

const { userExtractor, authorize } = require("../utils/middleware");
const createUpload = require("../utils/multerConfig");
const upload = createUpload("users");

// --- Route publique pour les visiteurs ---
router.get(
  "/me",
  (req, res, next) => {
    const authHeader = req.headers.authorization;

    // 🚫 Si pas de token → on renvoie une réponse "visiteur"
    if (!authHeader) {
      return res.json({
        message: "aucun utililisateur n'est connecté",
        user: null,
        role: null,
      });
    }

    next();
  },
  userExtractor,
  getMe
);

// --- Routes protégées pour les utilisateurs connectés ---

// PUT /api/users/me
router.put("/me", userExtractor, updateMe);

// GET /api/users/me/events
router.get("/me/events", userExtractor, getMyEvents);

// POST /api/users/avatar
router.post(
  "/avatar",
  userExtractor,
  upload.single("avatar"),
  uploadUserAvatar
);

// --- Routes réservées aux administrateurs et organisateurs ---

// GET /api/users/
router.get(
  "/",
  userExtractor,
  authorize(["administrateur", "Organisateur"]),
  getAllUsers
);

// GET /api/users/:id
router.get(
  "/:id",
  userExtractor,
  authorize(["administrateur", "Organisateur"]),
  getUserById
);

// POST /api/users/
router.post(
  "/",
  userExtractor,
  authorize(["administrateur", "Organisateur"]),
  upload.single("image"),
  createUser
);
router.post(
  "/me/upgrade-organizer",
  userExtractor,
  authorize(["Participant"]),
  upgradeToOrganizer
);
// PUT /api/users/:id
router.put(
  "/:id",
  userExtractor,
  authorize(["administrateur", "Organisateur"]),
  upload.single("image"),
  updateUser
);

router.post("/me/change-password", userExtractor, changeMyPassword);

// DELETE /api/users/me
router.delete("/me", userExtractor, deleteMe);
// DELETE /api/users/:id
router.delete("/:id", userExtractor, authorize(["administrateur"]), deleteUser);

module.exports = router;
