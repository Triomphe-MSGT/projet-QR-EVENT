const Event = require("../models/event");
const Inscription = require("../models/inscription");
const mongoose = require("mongoose");
const User = require("../models/user");
const { Parser } = require("json2csv"); // Assurez-vous d'avoir fait 'npm install json2csv'

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

// --- MODIFIÉ : Génération du rapport CSV complet ---
const generateAdminReport = async (req, res, next) => {
  try {
    // --- 1. Récupérer les données statistiques ---
    const totalUsers = await User.countDocuments();
    const participantCount = await User.countDocuments({ role: "Participant" });
    const organizerCount = await User.countDocuments({ role: "Organisateur" });
    const adminCount = await User.countDocuments({ role: "administrateur" });
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
      { Statistique: "Tickets Validés (Scannés)", Valeur: qrValidated },
      { Statistique: "Moy. Inscriptions/Événement", Valeur: avgPerEvent },
    ];

    // --- 2. Récupérer la liste des utilisateurs ---
    // On utilise .lean() pour de meilleures performances (objets JS simples)
    const allUsers = await User.find({})
      .select("nom email role sexe profession")
      .lean();

    // --- 3. Créer le CSV pour les statistiques ---
    const statsFields = ["Statistique", "Valeur"];
    const statsParser = new Parser({ fields: statsFields, delimiter: ";" });
    const statsCsv = statsParser.parse(statsData);

    // --- 4. Créer le CSV pour la liste des utilisateurs ---
    const userFields = [
      { label: "Nom", value: "nom" },
      { label: "Email", value: "email" },
      { label: "Rôle", value: "role" },
      { label: "Sexe", value: "sexe" },
      { label: "Profession", value: "profession" },
    ];
    const userParser = new Parser({ fields: userFields, delimiter: ";" });
    const usersCsv = userParser.parse(allUsers);

    // --- 5. Combiner les deux CSV en un seul fichier texte ---
    const combinedCsv = `RAPPORT DE STATISTIQUES GLOBAL
${statsCsv}

\n\n
LISTE DE TOUS LES UTILISATEURS
${usersCsv}
`;

    // --- 6. Envoyer le fichier CSV combiné ---
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="rapport_admin_complet_${
        new Date().toISOString().split("T")[0]
      }.csv"`
    );
    // Envoyer la chaîne de caractères combinée
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
