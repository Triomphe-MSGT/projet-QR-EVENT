const cloudinary = require("cloudinary").v2;
// `multer-storage-cloudinary` can export in different shapes depending on version.
// Normalize to a constructor called `CloudinaryStorage`.
const _multerStorageCloudinary = require("multer-storage-cloudinary");
const CloudinaryStorage =
  (_multerStorageCloudinary &&
    (_multerStorageCloudinary.CloudinaryStorage ||
      _multerStorageCloudinary.default ||
      _multerStorageCloudinary)) ||
  null;
const multer = require("multer");

// Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Fonction pour créer un storage Cloudinary dynamique
const createStorage = (folderName) => {
  return new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => ({
      folder: `qrevent/${folderName}`,
      allowed_formats: ["jpeg", "jpg", "png", "webp"],
      transformation: [
        { width: 1024, height: 1024, crop: "limit", quality: "auto:good" },
      ],
    }),
  });
};

// Filtre MIME
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  allowedTypes.includes(file.mimetype)
    ? cb(null, true)
    : cb(new Error("Format invalide"), false);
};

// Fonction qui crée un upload Multer fonctionnel
const createUpload = (folderName) => {
  return multer({
    storage: createStorage(folderName),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter,
  });
};

module.exports = createUpload;
