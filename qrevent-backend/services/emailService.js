const nodemailer = require("nodemailer");
const logger = require("../utils/logger");

let transporter = null;

// Initialisation du transporteur SEULEMENT si SMTP est configuré

if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true pour 465, false pour les autres ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false, // Aide parfois sur certains serveurs cloud
    },
    connectionTimeout: 10000, // 10 secondes
  });

  logger.info("📧 SMTP Gmail chargé avec succès.");
} else {
  console.warn(
    "⚠️ EMAIL_USER ou EMAIL_PASS manquant. Le mode STUB est activé."
  );
}

// 2️Fonction générique pour envoyer un email

const sendEmail = async (to, subject, text, html) => {
  // Mode STUB (aucun envoi réel)
  if (!transporter) {
    logger.info(
      "📨 MODE STUB - Aucun email envoyé (configuration SMTP absente)"
    );
    logger.info("----- EMAIL SIMULÉ -----");
    logger.info(`À : ${to}`);
    logger.info(`Sujet : ${subject}`);
    logger.info(`Texte : ${text}`);
    logger.info("------------------------");
    return;
  }

  const mailOptions = {
    from: `"Qr-Event" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text: text || undefined,
    html: html || undefined,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info(`📧 Email envoyé à ${to} (ID: ${info.messageId})`);
  } catch (error) {
    logger.error("❌ Erreur envoi email :", error);
    throw error;
  }
};

module.exports = { sendEmail };
