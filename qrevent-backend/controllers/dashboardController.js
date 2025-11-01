const Event = require("../models/event");
const Inscription = require("../models/inscription");
const mongoose = require("mongoose");
const User = require("../models/user");

const getOrganizerStats = async (req, res, next) => {
  try {
    const organizerId = req.user.id;

    const organizerEvents = await Event.find({ organizer: organizerId }).select(
      "_id"
    );
    const eventIds = organizerEvents.map((event) => event._id);

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
    // Statistiques sur les utilisateurs
    const totalUsers = await User.countDocuments();
    const participantCount = await User.countDocuments({ role: "Participant" });
    const organizerCount = await User.countDocuments({ role: "Organisateur" });
    const adminCount = await User.countDocuments({ role: "administrateur" });

    // Statistiques sur les événements (global)
    const totalEvents = await Event.countDocuments();

    // Statistiques sur les inscriptions (global)
    const totalRegistrations = await Inscription.countDocuments();
    const qrValidated = await Inscription.countDocuments({ isValidated: true });

    // Calcul de la moyenne (évite division par zéro)
    const avgPerEvent =
      totalEvents > 0 ? (totalRegistrations / totalEvents).toFixed(1) : 0;

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
    // 2. Récupérer les mêmes données que getAdminStats
    const totalUsers = await User.countDocuments();
    const participantCount = await User.countDocuments({ role: "Participant" });
    const organizerCount = await User.countDocuments({ role: "Organisateur" });
    const adminCount = await User.countDocuments({ role: "administrateur" });
    const totalEvents = await Event.countDocuments();
    const totalRegistrations = await Inscription.countDocuments();
    const qrValidated = await Inscription.countDocuments({ isValidated: true });
    const avgPerEvent =
      totalEvents > 0 ? (totalRegistrations / totalEvents).toFixed(1) : 0;

    // 3. Formater les données pour le CSV
    const statsData = [
      { Statistique: "Total Utilisateurs", Valeur: totalUsers },
      { Statistique: "Participants", Valeur: participantCount },
      { Statistique: "Organisateurs", Valeur: organizerCount },
      { Statistique: "Administrateurs", Valeur: adminCount },
      { Statistique: "Total Événements", Valeur: totalEvents },
      { Statistique: "Total Inscriptions", Valeur: totalRegistrations },
      { Statistique: "Tickets Validés (Scannés)", Valeur: qrValidated },
      { Statistique: "Moy. Inscriptions/Événement", Valeur: avgPerEvent },
    ];

    // 4. Définir les colonnes du CSV
    const fields = ["Statistique", "Valeur"];
    const json2csvParser = new Parser({ fields, delimiter: ";" }); // Utiliser ; pour Excel France
    const csv = json2csvParser.parse(statsData);

    // 5. Envoyer le fichier CSV
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="rapport_statistiques_admin_${
        new Date().toISOString().split("T")[0]
      }.csv"`
    );
    res.status(200).send(csv);
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
