const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

// --- Configuration des Styles ---
const FONT_REGULAR = "Helvetica";
const FONT_BOLD = "Helvetica-Bold";
const COLOR_PRIMARY = "#0866FF"; // Bleu Qr-Event
const COLOR_TEXT = "#333333";
const COLOR_LIGHT_TEXT = "#777777";
const COLOR_HEADER_BG = "#F0F2F5"; // Fond de tableau
const COLOR_BORDER = "#DDDDDD";
const LOGO_PATH = path.join(__dirname, "..", "assets", "logo.png"); // Chemin vers votre logo

async function generatePdfReport(event, inscriptions, stats, res) {
  const doc = new PDFDocument({
    size: "A4",
    margin: 50,
    bufferPages: true, // Important pour les en-têtes/pieds de page
  });

  // Pipe le PDF directement dans la réponse HTTP
  doc.pipe(res);

  // --- Enregistrement des Polices (PDFKit supporte Helvetica par défaut) ---
  doc.font(FONT_REGULAR);

  // --- En-tête de Page ---
  // S'applique à CHAQUE nouvelle page (y compris la première)
  doc.on("pageAdded", () => {
    // Logo
    if (fs.existsSync(LOGO_PATH)) {
      doc.image(LOGO_PATH, 50, 45, { width: 100 });
    }
    // Titre de page
    doc
      .font(FONT_REGULAR)
      .fontSize(10)
      .fillColor(COLOR_LIGHT_TEXT)
      .text("Rapport d'Événement Qr-Event", 50, 50, { align: "right" });
    // Ligne de séparation
    doc
      .strokeColor(COLOR_BORDER)
      .lineWidth(0.5)
      .moveTo(50, 80)
      .lineTo(550, 80)
      .stroke();
  });

  // Déclenche l'événement 'pageAdded' pour la première page
  doc.emit("pageAdded");

  // --- Titre Principal ---
  doc.moveDown(3);
  doc
    .font(FONT_BOLD)
    .fontSize(22)
    .fillColor(COLOR_PRIMARY)
    .text(event.name, { align: "center" });
  doc.moveDown(1.5);

  // --- Section 1: Statistiques Clés ---
  generateSectionHeader(doc, "Statistiques de Participation");
  generateStatsGrid(doc, stats);

  // --- Section 2: Démographie (Sexe) ---
  generateSectionHeader(doc, "Démographie (par Sexe)");
  generateStatsTable(
    doc,
    ["Sexe", "Inscrits", "Validés"],
    stats.statsSexRegistered,
    stats.statsSexValidated
  );

  // --- Section 3: Participants Validés ---
  const validatedParticipants = inscriptions
    .filter((i) => i.isValidated)
    .map((i) => i.participant)
    .filter(Boolean); // Filtre les participants nuls

  await generateParticipantTable(
    doc,
    `Participants Validés (${stats.totalValidated})`,
    ["Nom", "Email", "Sexe", "Profession"],
    validatedParticipants
  );

  // --- Section 4: Tous les Inscrits ---
  const allParticipants = inscriptions
    .map((i) => i.participant)
    .filter(Boolean);

  await generateParticipantTable(
    doc,
    `Liste de Tous les Inscrits (${stats.totalRegistered})`,
    ["Nom", "Email", "Sexe", "Profession"],
    allParticipants
  );

  // Finalise le document
  doc.end();
}

// --- Fonctions Utilitaires de Dessin ---

// Dessine un titre de section
function generateSectionHeader(doc, title) {
  doc
    .font(FONT_BOLD)
    .fontSize(16)
    .fillColor(COLOR_TEXT)
    .text(title, { align: "left" });
  doc.moveDown(0.5);
  doc
    .strokeColor(COLOR_PRIMARY)
    .lineWidth(1)
    .moveTo(doc.x, doc.y)
    .lineTo(doc.x + 100, doc.y)
    .stroke();
  doc.moveDown(1);
}

// Dessine la grille de stats principales
function generateStatsGrid(doc, stats) {
  const y = doc.y;
  const col1X = 50;
  const col2X = 300;

  doc.font(FONT_BOLD).fontSize(14).fillColor(COLOR_PRIMARY);
  doc.text(`${stats.participationRate.toFixed(1)}%`, col1X, y);
  doc.font(FONT_REGULAR).fontSize(12).fillColor(COLOR_TEXT);
  doc.text("Taux de Participation", col1X, y + 20);

  doc.font(FONT_BOLD).fontSize(14).fillColor(COLOR_TEXT);
  doc.text(stats.totalRegistered.toString(), col2X, y);
  doc.font(FONT_REGULAR).fontSize(12);
  doc.text("Total Inscrits", col2X, y + 20);

  doc.moveDown(2);
  const y2 = doc.y;

  doc.font(FONT_BOLD).fontSize(14).fillColor(COLOR_TEXT);
  doc.text(stats.totalValidated.toString(), col2X, y2);
  doc.font(FONT_REGULAR).fontSize(12);
  doc.text("Total Validés (Présents)", col2X, y2 + 20);

  doc.moveDown(3);
}

// Dessine un petit tableau pour les stats (sexe, profession)
function generateStatsTable(doc, headers, registeredData, validatedData) {
  const tableTop = doc.y;
  const colX = [50, 200, 350];
  const allKeys = new Set([
    ...Object.keys(registeredData),
    ...Object.keys(validatedData),
  ]);
  let y = tableTop;

  // En-tête
  doc.font(FONT_BOLD).fontSize(10);
  headers.forEach((header, i) => {
    doc.text(header, colX[i], y);
  });
  y += 20;

  // Lignes
  doc.font(FONT_REGULAR).fontSize(10);
  allKeys.forEach((key) => {
    doc.text(key, colX[0], y);
    doc.text(registeredData[key] || "0", colX[1], y, {
      width: 150,
      align: "left",
    });
    doc.text(validatedData[key] || "0", colX[2], y, {
      width: 150,
      align: "left",
    });
    y += 20;
  });

  doc.y = y + 20; // Positionne le curseur après le tableau
}

// Dessine le grand tableau des participants
async function generateParticipantTable(doc, title, headers, data) {
  // S'assure qu'on commence sur une nouvelle page si pas assez de place
  if (doc.y > 550) {
    doc.addPage();
  }

  doc
    .font(FONT_BOLD)
    .fontSize(16)
    .fillColor(COLOR_TEXT)
    .text(title, { align: "left" });
  doc.moveDown(1);

  const tableTop = doc.y;
  const colX = [50, 200, 360, 440];
  const colWidths = [140, 150, 70, 110];

  // En-tête de tableau
  doc.rect(50, tableTop, 500, 25).fill(COLOR_HEADER_BG);

  doc.fillColor(COLOR_TEXT).font(FONT_BOLD).fontSize(10);
  headers.forEach((header, i) => {
    doc.text(header, colX[i], tableTop + 8);
  });
  doc.y = tableTop + 30; // Positionne le curseur après l'en-tête

  // Lignes de tableau
  doc.font(FONT_REGULAR).fontSize(9);

  for (const item of data) {
    // Si la prochaine ligne dépasse la page, crée une nouvelle page
    if (doc.y > 700) {
      doc.addPage();
      doc.y = 150; // Marge en haut (après le logo)
      // Redessine l'en-tête sur la nouvelle page
      doc.rect(50, doc.y - 12, 500, 25).fill(COLOR_HEADER_BG);
      doc.fillColor(COLOR_TEXT).font(FONT_BOLD).fontSize(10);
      headers.forEach((header, i) => doc.text(header, colX[i], doc.y));
      doc.y += 20;
    }

    const y = doc.y;
    doc.fillColor(COLOR_TEXT).text(item?.nom || "N/A", colX[0], y, {
      width: colWidths[0],
      lineBreak: false,
      ellipsis: true,
    });
    doc.text(item?.email || "N/A", colX[1], y, {
      width: colWidths[1],
      lineBreak: false,
      ellipsis: true,
    });
    doc.text(item?.sexe || "N/A", colX[2], y, { width: colWidths[2] });
    doc.text(item?.profession || "N/A", colX[3], y, {
      width: colWidths[3],
      lineBreak: false,
      ellipsis: true,
    });

    doc.moveDown(1); // Ajoute un espacement

    // Ligne de séparation
    doc
      .strokeColor(COLOR_BORDER)
      .lineWidth(0.5)
      .moveTo(50, doc.y)
      .lineTo(550, doc.y)
      .stroke();
    doc.moveDown(0.5);
  }
}

module.exports = { generatePdfReport };
