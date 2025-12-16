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

    const format = req.query.format || "csv"; // Par défaut CSV pour rétrocompatibilité

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

    // --- 2. Utilisateurs ---
    const allUsers = await User.find({})
      .select("nom email role sexe profession phone") // Ajout de 'phone'
      .lean();

    // --- GÉNÉRATION PDF ---
    if (format === "pdf") {
      const PDFDocument = require("pdfkit");
      const path = require("path");
      const fs = require("fs");

      const doc = new PDFDocument({ margin: 30, layout: "landscape", size: "A4" }); // Landscape pour plus d'espace

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="rapport_admin_${new Date()
          .toISOString()
          .split("T")[0]}.pdf"`
      );

      doc.pipe(res);

      // --- LOGO ---
      const logoPath = path.join(__dirname, "../assets/logo.png");
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 30, 25, { width: 50 });
      }

      // Header
      doc
        .font("Helvetica-Bold")
        .fontSize(20)
        .text("Rapport Global Administrateur", { align: "center" });
      doc.moveDown(1.5);

      // Stats
      doc.font("Helvetica-Bold").fontSize(14).text("Statistiques Globales");
      doc.moveDown(0.4);
      doc.font("Helvetica").fontSize(11);
      doc.text(`Total Utilisateurs: ${totalUsers}`);
      doc.text(`  - Participants: ${participantCount}`);
      doc.text(`  - Organisateurs: ${organizerCount}`);
      doc.text(`  - Administrateurs: ${adminCount}`);
      doc.moveDown(0.5);
      doc.text(`Total Événements: ${totalEvents}`);
      doc.text(`Total Inscriptions: ${totalRegistrations}`);
      doc.text(`Tickets Validés: ${qrValidated}`);
      doc.text(`Moyenne inscriptions / événement: ${avgPerEvent}`);
      doc.moveDown();

      // Users List
      doc.addPage();
      doc.font("Helvetica-Bold").fontSize(14).text(`Liste des Utilisateurs (${totalUsers})`);
      doc.moveDown(0.6);

      // En-têtes de colonnes (Ajustement pour Landscape A4 ~841pts de large, marges 30 => ~780pts utilisables)
      const colX = {
        nom: 30,
        email: 180,
        role: 340,
        sexe: 430,
        phone: 490,
        profession: 600
      };
      
      doc.font("Helvetica-Bold").fontSize(10);
      doc.text("Nom", colX.nom, doc.y, { width: 140 });
      doc.text("Email", colX.email, doc.y, { width: 150 });
      doc.text("Rôle", colX.role, doc.y, { width: 80 });
      doc.text("Sexe", colX.sexe, doc.y, { width: 50 });
      doc.text("Téléphone", colX.phone, doc.y, { width: 100 });
      doc.text("Profession", colX.profession, doc.y, { width: 150 });
      doc.moveDown(0.5);
      doc
        .strokeColor("#aaaaaa")
        .lineWidth(0.5)
        .moveTo(30, doc.y)
        .lineTo(810, doc.y) // Largeur landscape
        .stroke();
      doc.moveDown(0.6);
      doc.font("Helvetica").fontSize(9);

      allUsers.forEach((u) => {
        const startY = doc.y;
        doc.text(u.nom || "N/A", colX.nom, startY, { width: 140 });
        doc.text(u.email || "N/A", colX.email, startY, { width: 150 });
        doc.text(u.role || "N/A", colX.role, startY, { width: 80 });
        doc.text(u.sexe || "N/A", colX.sexe, startY, { width: 50 });
        doc.text(u.phone || "N/A", colX.phone, startY, { width: 100 });
        doc.text(u.profession || "N/A", colX.profession, startY, { width: 150 });
        
        // Saut de ligne manuel si nécessaire ou juste moveDown standard
        doc.y = startY; // Réinitialise Y pour le prochain moveDown si text() l'a bougé différemment (mais ici on utilise des colonnes fixes)
        // Pour être sûr d'avancer correctement, on peut prendre le max de hauteur, mais ici on simplifie
        doc.moveDown(1.2); 
      });

      doc.end();
      return;
    }

    // --- GÉNÉRATION CSV (Par défaut) ---
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

    const userFields = [
      { label: "Nom", value: "nom" },
      { label: "Email", value: "email" },
      { label: "Rôle", value: "role" },
      { label: "Sexe", value: "sexe" },
      { label: "Téléphone", value: "phone" }, // Ajout
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
