const nodemailer = require("nodemailer");
const logger = require("../utils/logger");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (to, subject, text, html) => {
  if (!process.env.EMAIL_USER) {
    logger.warn("EMAIL_USER non défini. E-mail non envoyé (logué en console).");
    logger.info(`--- EMAIL STUB ---`);
    logger.info(`À: ${to}`);
    logger.info(`Sujet: ${subject}`);
    logger.info(`Corps: ${text}`);
    logger.info(`--------------------`);
    return;
  }

  const mailOptions = {
    from: `"Qr-Event" <${process.env.EMAIL_USER}>`,
    to: to,
    subject: subject,
    text: text,
    html: html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info(`E-mail envoyé avec succès à ${to}. ID: ${info.messageId}`);
  } catch (error) {
    logger.error(`Échec de l'envoi d'e-mail à ${to}:`, error);
    throw error;
  }
};

module.exports = {
  sendEmail,
};
