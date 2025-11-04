// qrevent-backend/utils/config.js
require("dotenv").config();

// --- Variables critiques ---
const MONGODB_URI =
  process.env.NODE_ENV === "test"
    ? process.env.TEST_MONGODB_URI
    : process.env.MONGODB_URI;

// Utilise la clé 'JWT_SECRET' de votre .env
const JWT_SECRET = process.env.JWT_SECRET;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

// --- Variables Cloudinary ---
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

// --- Autres ---
const PORT = process.env.PORT || 3001;
const GEOAPIFY_KEY = process.env.GEOAPIFY_KEY;

// --- Vérifications de sécurité ---
if (!MONGODB_URI) {
  console.error("ERREUR CRITIQUE: MONGODB_URI n'est pas défini dans .env");
  process.exit(1);
}
if (!JWT_SECRET) {
  // Vérifie la bonne variable
  console.error("ERREUR CRITIQUE: JWT_SECRET n'est pas défini dans .env");
  process.exit(1);
}
if (!GOOGLE_CLIENT_ID) {
  console.warn(
    "ATTENTION: GOOGLE_CLIENT_ID n'est pas défini. Google Login échouera."
  );
}
if (!CLOUDINARY_API_KEY) {
  console.warn(
    "ATTENTION: Clés Cloudinary non définies. L'upload d'images échouera."
  );
}

module.exports = {
  MONGODB_URI,
  PORT,
  JWT_SECRET, // Exporte la bonne clé
  GOOGLE_CLIENT_ID,
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  GEOAPIFY_KEY,
};
