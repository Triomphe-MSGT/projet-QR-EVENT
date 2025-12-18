const axios = require("axios");
const logger = require("../utils/logger");

// Configuration Brevo
const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL;
const BREVO_SENDER_NAME = process.env.BREVO_SENDER_NAME || "QR-Event";

// Vérifier que les clés sont configurées
if (!BREVO_API_KEY || !BREVO_SENDER_EMAIL) {
  logger.warn(
    "⚠️ BREVO_API_KEY ou BREVO_SENDER_EMAIL manquant. Le mode STUB est activé."
  );
}

// Fonction générique pour envoyer un email via Brevo
const sendEmail = async (to, subject, text, html) => {
  // Mode STUB si la configuration manque
  if (!BREVO_API_KEY || !BREVO_SENDER_EMAIL) {
    logger.info(
      "📨 MODE STUB - Aucun email envoyé (configuration Brevo absente)"
    );
    logger.info("----- EMAIL SIMULÉ -----");
    logger.info(`À : ${to}`);
    logger.info(`Sujet : ${subject}`);
    logger.info(`Texte : ${text}`);
    logger.info("------------------------");
    return;
  }

  try {
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: BREVO_SENDER_NAME,
          email: BREVO_SENDER_EMAIL,
        },
        to: [
          {
            email: to,
          },
        ],
        subject,
        htmlContent: html || text,
        textContent: text,
      },
      {
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          "api-key": BREVO_API_KEY,
        },
      }
    );

    logger.info(`📧 Email envoyé à ${to} (ID: ${response.data.messageId})`);
    return response.data;
  } catch (error) {
    logger.error(
      "❌ Erreur envoi email Brevo:",
      error.response?.data || error.message
    );
    throw error;
  }
};

module.exports = { sendEmail };
