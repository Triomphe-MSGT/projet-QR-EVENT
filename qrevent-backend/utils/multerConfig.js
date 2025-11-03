const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

// 1. Configuration de Cloudinary avec vos clés d'environnement
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. Fonction pour créer un stockage dynamique DANS Cloudinary
const createStorage = (folderName) => {
  return new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      // 3. Le dossier dans Cloudinary où les images seront sauvegardées
      folder: `qrevent/${folderName}`, // ex: "qrevent/events" ou "qrevent/users"

      // 4. Formats autorisés
      allowed_formats: ["jpeg", "jpg", "png", "webp"],

      // 5. Optimisation automatique !
      // Cloudinary va redimensionner et compresser l'image pour vous.
      transformation: [
        { width: 1024, height: 1024, crop: "limit", quality: "auto:good" },
      ],
    },
  });
};

// 6. Filtre de fichier (identique)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]; // Ajout de webp
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Seuls les formats JPEG, JPG, PNG et WEBP sont autorisés"),
      false
    );
  }
};

// 7. Crée le middleware d'upload
const createUpload = (folderName) => {
  return multer({
    storage: createStorage(folderName), // Utilise le stockage Cloudinary
    limits: { fileSize: 1024 * 1024 * 5 }, // 5MB (identique)
    fileFilter,
  });
};

module.exports = createUpload;
