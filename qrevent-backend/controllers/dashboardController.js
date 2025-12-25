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

    // --- 2. Utilisateurs avec statistiques ---
    const usersRaw = await User.find({})
      .select("nom email role sexe profession phone participatedEvents")
      .lean();

    const allUsers = await Promise.all(
      usersRaw.map(async (u) => {
        const organizedCount = await Event.countDocuments({ organizer: u._id });
        const names = (u.nom || "").split(" ");
        const nom = names[0] || "N/A";
        const prenom = names.slice(1).join(" ") || "N/A";
        
        return {
          ...u,
          nom,
          prenom,
          organizedCount,
          participatedCount: u.participatedEvents?.length || 0,
        };
      })
    );

    // --- GÉNÉRATION PDF ---
    if (format === "pdf") {
      const PDFDocument = require("pdfkit");
      const path = require("path");
      const fs = require("fs");

      const doc = new PDFDocument({ margin: 30, layout: "landscape", size: "A4" });

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="rapport_admin_${new Date().toISOString().split("T")[0]}.pdf"`
      );

      doc.pipe(res);

      // --- HEADER DESIGN ---
      doc.rect(0, 0, 842, 80).fill("#1e293b"); // Fond sombre pour le header
      
      const logoPath = path.join(__dirname, "../assets/logo.png");
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 40, 15, { width: 50 });
      }

      doc
        .fillColor("#ffffff")
        .font("Helvetica-Bold")
        .fontSize(22)
        .text("QR-EVENT", 100, 25)
        .fontSize(10)
        .font("Helvetica")
        .text("PLATEFORME ÉVÉNEMENTIELLE PROFESSIONNELLE", 100, 50);

      doc
        .fillColor("#ffffff")
        .fontSize(16)
        .font("Helvetica-Bold")
        .text("RAPPORT GLOBAL ADMINISTRATEUR", 0, 30, { align: "right", indent: 40 });

      doc.moveDown(4);
      doc.fillColor("#1e293b");

      // Stats Section
      doc.font("Helvetica-Bold").fontSize(16).text("Statistiques Globales", 40);
      doc.rect(40, doc.y + 5, 760, 2).fill("#3b82f6");
      doc.moveDown(1.5);

      const statsY = doc.y;
      doc.font("Helvetica-Bold").fontSize(11);
      doc.text("UTILISATEURS", 40, statsY);
      doc.text("ÉVÉNEMENTS & INSCRIPTIONS", 440, statsY);
      
      doc.font("Helvetica").fontSize(10);
      doc.text(`Total Utilisateurs: ${totalUsers}`, 40, statsY + 20);
      doc.text(`• Participants: ${participantCount}`, 50, statsY + 35);
      doc.text(`• Organisateurs: ${organizerCount}`, 50, statsY + 50);
      doc.text(`• Administrateurs: ${adminCount}`, 50, statsY + 65);

      doc.text(`Total Événements: ${totalEvents}`, 440, statsY + 20);
      doc.text(`Total Inscriptions: ${totalRegistrations}`, 440, statsY + 35);
      doc.text(`Tickets Validés: ${qrValidated}`, 440, statsY + 50);
      doc.text(`Moyenne inscriptions / événement: ${avgPerEvent}`, 440, statsY + 65);

      doc.moveDown(6);

      // Users List
      doc.addPage();
      doc.rect(0, 0, 842, 50).fill("#3b82f6");
      doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(14).text("LISTE DÉTAILLÉE DES UTILISATEURS", 40, 18);
      
      doc.moveDown(3);
      doc.fillColor("#1e293b");

      // Table Headers
      const colX = {
        nom: 40,
        prenom: 130,
        email: 230,
        role: 380,
        phone: 460,
        profession: 560,
        org: 680,
        part: 740
      };
      
      doc.font("Helvetica-Bold").fontSize(9);
      doc.text("NOM", colX.nom);
      doc.text("PRÉNOM", colX.prenom, doc.y - 9);
      doc.text("EMAIL", colX.email, doc.y - 9);
      doc.text("RÔLE", colX.role, doc.y - 9);
      doc.text("TÉLÉPHONE", colX.phone, doc.y - 9);
      doc.text("PROFESSION", colX.profession, doc.y - 9);
      doc.text("ORG.", colX.org, doc.y - 9);
      doc.text("PART.", colX.part, doc.y - 9);
      
      doc.moveDown(0.5);
      doc.strokeColor("#cbd5e1").lineWidth(1).moveTo(40, doc.y).lineTo(800, doc.y).stroke();
      doc.moveDown(0.8);

      doc.font("Helvetica").fontSize(8);
      allUsers.forEach((u, index) => {
        if (doc.y > 530) {
          doc.addPage();
          doc.font("Helvetica-Bold").fontSize(9);
          doc.text("NOM", colX.nom, 40);
          doc.text("PRÉNOM", colX.prenom, 40);
          doc.text("EMAIL", colX.email, 40);
          doc.text("RÔLE", colX.role, 40);
          doc.text("TÉLÉPHONE", colX.phone, 40);
          doc.text("PROFESSION", colX.profession, 40);
          doc.text("ORG.", colX.org, 40);
          doc.text("PART.", colX.part, 40);
          doc.strokeColor("#cbd5e1").moveTo(40, 55).lineTo(800, 55).stroke();
          doc.font("Helvetica").fontSize(8).y = 65;
        }

        const startY = doc.y;
        if (index % 2 === 0) {
          doc.rect(35, startY - 5, 770, 20).fill("#f8fafc");
          doc.fillColor("#1e293b");
        }

        doc.text(u.nom || "N/A", colX.nom, startY, { width: 85, truncate: true });
        doc.text(u.prenom || "N/A", colX.prenom, startY, { width: 95, truncate: true });
        doc.text(u.email || "N/A", colX.email, startY, { width: 145, truncate: true });
        doc.text(u.role || "N/A", colX.role, startY, { width: 75 });
        doc.text(u.phone || "N/A", colX.phone, startY, { width: 95 });
        doc.text(u.profession || "N/A", colX.profession, startY, { width: 115, truncate: true });
        doc.text(u.organizedCount.toString(), colX.org, startY, { width: 40, align: "center" });
        doc.text(u.participatedCount.toString(), colX.part, startY, { width: 40, align: "center" });
        
        doc.moveDown(1.8);
      });

      // Footer with page numbers
      const range = doc.bufferedPageRange();
      for (let i = range.start; i < range.start + range.count; i++) {
        doc.switchToPage(i);
        doc.fillColor("#94a3b8").fontSize(8).text(
          `Page ${i + 1} sur ${range.count} - Généré le ${new Date().toLocaleString("fr-FR")}`,
          0,
          570,
          { align: "center" }
        );
      }

      doc.end();
      return;
    }

    // --- GÉNÉRATION CSV ---
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
      { label: "Prénom", value: "prenom" },
      { label: "Email", value: "email" },
      { label: "Rôle", value: "role" },
      { label: "Sexe", value: "sexe" },
      { label: "Téléphone", value: "phone" },
      { label: "Profession", value: "profession" },
      { label: "Événements Organisés", value: "organizedCount" },
      { label: "Événements Participés", value: "participatedCount" },
    ];

    const userParser = new Parser({ fields: userFields, delimiter: ";" });
    const usersCsv = userParser.parse(allUsers);

    const combinedCsv =
      `RAPPORT GLOBAL QR-EVENT\n` +
      `Généré le: ${new Date().toLocaleString("fr-FR")}\n\n` +
      `STATISTIQUES GÉNÉRALES\n` +
      `${statsCsv}\n\n` +
      `LISTE DES UTILISATEURS\n` +
      `${usersCsv}\n`;

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="rapport_admin_${new Date().toISOString().split("T")[0]}.csv"`
    );

    // Ajouter le BOM UTF-8 pour Excel
    res.status(200).send("\uFEFF" + combinedCsv);
  } catch (error) {
    console.error("❌ Erreur génération rapport admin:", error);
    next(error);
  }
};
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
