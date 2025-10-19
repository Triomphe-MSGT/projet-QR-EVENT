const mongoose = require("mongoose");

const inscriptionSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    participant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Le jeton secret encodé dans le QR code
    qrCodeToken: {
      type: String,
      required: true,
      unique: true,
    },
    // Pour empêcher une double utilisation
    isValidated: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
); // Ajoute createdAt et updatedAt automatiquement

module.exports = mongoose.model("Inscription", inscriptionSchema);
