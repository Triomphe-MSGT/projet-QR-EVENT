const express = require("express");
const router = express.Router();
const {
  login,
  googleLogin,
  register,
  forgotPassword,
  resetPassword,
} = require("../controllers/auth/authController");
const createUpload = require("../utils/multerConfig");

const upload = createUpload("users");

router.post("/register", upload.single("image"), register);

router.post("/login", login);

router.post("/google", googleLogin);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;
