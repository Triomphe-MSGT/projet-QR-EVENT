const Event = require("../models/event");
const Inscription = require("../models/inscription");
const mongoose = require("mongoose");
const User = require("../models/user");
const { Parser } = require("json2csv");

const getOrganizerStats = async (req, res, next) => {
  try {
    const organizerId = req.user.id;

    const organizerEvents = await Event.find({ organizer: organizerId }).select("_id");
    const eventIds = organizerEvents.map((e) => e._id);

    const totalEvents = eventIds.length;

    const totalRegistrations = await Inscription.countDocuments({
      event: { $in: eventIds },
    });

    const qrValidated = await Inscription.countDocuments({
      event: { $in: eventIds },
      isValidated: true,
    });

    res.json({
      totalEvents,
      totalRegistrations,
      qrValidated,
    });
  } catch (error) {
    console.error("❌ Error fetching organizer stats:", error);
    next(error);
  }
};

const getAdminStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const participantCount = await User.countDocuments({ role: "Participant" });
    const organizerCount = await User.countDocuments({ role: "Organisateur" });
    const adminCount = await User.countDocuments({ role: "Administrateur" });

    const totalEvents = await Event.countDocuments();
    const totalRegistrations = await Inscription.countDocuments();
    const qrValidated = await Inscription.countDocuments({ isValidated: true });

    const avgPerEvent = totalEvents > 0 ? (totalRegistrations / totalEvents).toFixed(1) : 0;

    res.json({
      totalUsers,
      participantCount,
      organizerCount,
      adminCount,
      totalEvents,
      totalRegistrations,
      qrValidated,
      avgPerEvent,
    });
  } catch (error) {
    console.error("❌ Erreur stats admin:", error);
    next(error);
  }
};

const generateAdminReport = async (req, res, next) => {
  try {
    // --- Vérification du rôle ---
    if (req.user.role !== "Administrateur") {
      return res.status(403).json({ error: "Accès refusé" });
    }

    // --- 1. Données statistiques ---
    const totalUsers = await User.countDocuments();
    const participantCount = await User.countDocuments({ role: "Participant" });
    const organizerCount = await User.countDocuments({ role: "Organisateur" });
    const adminCount = await User.countDocuments({ role: "Administrateur" });
    const totalEvents = await Event.countDocuments();
    const totalRegistrations = await Inscription.countDocuments();
    const qrValidated = await Inscription.countDocuments({ isValidated: true });

    const avgPerEvent =
      totalEvents > 0 ? (totalRegistrations / totalEvents).toFixed(1) : 0;

    const statsData = [
      { Statistique: "Total Utilisateurs", Valeur: totalUsers },
      { Statistique: "Participants", Valeur: participantCount },
      { Statistique: "Organisateurs", Valeur: organizerCount },
      { Statistique: "Administrateurs", Valeur: adminCount },
      { Statistique: "Total Événements", Valeur: totalEvents },
      { Statistique: "Total Inscriptions", Valeur: totalRegistrations },
      { Statistique: "Tickets Validés", Valeur: qrValidated },
      { Statistique: "Moyenne inscriptions / événement", Valeur: avgPerEvent },
    ];

    const statsParser = new Parser({ fields: ["Statistique", "Valeur"], delimiter: ";" });
    const statsCsv = statsParser.parse(statsData);

    // --- 2. Utilisateurs ---
    const allUsers = await User.find({})
      .select("nom email role sexe profession")
      .lean();

    const userFields = [
      { label: "Nom", value: "nom" },
      { label: "Email", value: "email" },
      { label: "Rôle", value: "role" },
      { label: "Sexe", value: "sexe" },
      { label: "Profession", value: "profession" },
    ];

    const userParser = new Parser({ fields: userFields, delimiter: ";" });
    const usersCsv = userParser.parse(allUsers);

    // --- 3. Combiner en un seul fichier ---
    const combinedCsv =
      `RAPPORT GLOBAL QR-EVENT\n\n` +
      `${statsCsv}\n\n\n` +
      `LISTE DE TOUS LES UTILISATEURS\n\n` +
      `${usersCsv}\n`;

    // --- 4. Envoi du fichier ---
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="rapport_admin_${new Date().toISOString().split("T")[0]}.csv"`
    );

    res.status(200).send(combinedCsv);
  } catch (error) {
    console.error("❌ Erreur génération rapport admin:", error);
    next(error);
  }
};

module.exports = {
  getOrganizerStats,
  getAdminStats,
  generateAdminReport,
};
