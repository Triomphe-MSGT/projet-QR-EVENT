// backend/controllers/events.js
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
const Event = require("../models/event");
const User = require("../models/user");
const Category = require("../models/category");
const Inscription = require("../models/inscription");
const qrCodeService = require("../services/qrCodeService"); // ✅ Vérifiez le chemin

// --- Obtenir tous les événements ---
const getAllEvents = async (req, res, next) => {
  try {
    const events = await Event.find()
      .populate("organizer", "nom email")
      .populate("category", "name emoji")
      .sort({ startDate: 1 });
    res.json(events);
  } catch (error) {
    next(error);
  }
};

// --- Obtenir un événement par ID ---
const getEventById = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "ID d'événement invalide" });
    }
    const event = await Event.findById(req.params.id)
      .populate("organizer", "nom email")
      .populate("category", "name emoji")
      .populate("participants", "nom email role sexe profession"); // Peuple avec sexe/profession

    if (!event) return res.status(404).json({ error: "Événement non trouvé" });
    res.json(event);
  } catch (error) {
    next(error);
  }
};

// --- Créer un nouvel événement ---
const createEvent = async (req, res, next) => {
  try {
    const { body, user } = req; // user vient de userExtractor { id, role }

    const category = await Category.findById(body.category);
    if (!category) return res.status(400).json({ error: "Catégorie invalide" });

    const newEvent = new Event({
      ...body,
      organizer: user.id,
      imageUrl: req.file
        ? path.join("uploads", "events", req.file.filename).replace(/\\/g, "/")
        : null,
    });

    const savedEvent = await newEvent.save();
    category.events.push(savedEvent._id);
    await category.save();

    res.status(201).json(savedEvent);
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};

// --- Mettre à jour un événement ---
const updateEvent = async (req, res, next) => {
  try {
    const { body, user } = req;
    const eventId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ error: "ID d'événement invalide" });
    }

    const eventToUpdate = await Event.findById(eventId);
    if (!eventToUpdate)
      return res.status(404).json({ error: "Événement non trouvé" });

    const isOwner = eventToUpdate.organizer.toString() === user.id;
    const isAdmin = user.role === "administrateur";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: "Action non autorisée." });
    }

    // Gestion de la catégorie
    if (body.category && body.category !== eventToUpdate.category.toString()) {
      await Category.findByIdAndUpdate(eventToUpdate.category, {
        $pull: { events: eventId },
      });
      await Category.findByIdAndUpdate(body.category, {
        $push: { events: eventId },
      });
    }

    // Gestion de l'image
    if (req.file) {
      if (
        eventToUpdate.imageUrl &&
        !eventToUpdate.imageUrl.startsWith("http") &&
        fs.existsSync(path.resolve(__dirname, "..", eventToUpdate.imageUrl))
      ) {
        try {
          fs.unlinkSync(path.resolve(__dirname, "..", eventToUpdate.imageUrl));
        } catch (e) {
          console.error("Erreur suppression ancienne image:", e);
        }
      }
      body.imageUrl = path
        .join("uploads", "events", req.file.filename)
        .replace(/\\/g, "/");
    } else if (body.image === null || body.image === "") {
      if (
        eventToUpdate.imageUrl &&
        !eventToUpdate.imageUrl.startsWith("http") &&
        fs.existsSync(path.resolve(__dirname, "..", eventToUpdate.imageUrl))
      ) {
        try {
          fs.unlinkSync(path.resolve(__dirname, "..", eventToUpdate.imageUrl));
        } catch (e) {
          console.error("Erreur suppression image:", e);
        }
      }
      body.imageUrl = null;
    } else {
      delete body.imageUrl;
    }

    const updatedEvent = await Event.findByIdAndUpdate(eventId, body, {
      new: true,
      runValidators: true,
    })
      .populate("organizer", "nom email")
      .populate("category", "name emoji");

    if (!updatedEvent)
      return res
        .status(404)
        .json({ error: "Événement non trouvé après mise à jour." });
    res.json(updatedEvent);
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ error: error.message });
    }
    console.error("Erreur lors de la mise à jour event:", error);
    next(error);
  }
};

// --- Supprimer un événement ---
const deleteEvent = async (req, res, next) => {
  try {
    const { user } = req;
    const eventId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ error: "ID d'événement invalide" });
    }
    const eventToDelete = await Event.findById(eventId);
    if (!eventToDelete)
      return res.status(404).json({ error: "Événement non trouvé" });

    const isOwner = eventToDelete.organizer.toString() === user.id;
    const isAdmin = user.role === "administrateur";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: "Action non autorisée." });
    }

    // Supprime l'image
    if (
      eventToDelete.imageUrl &&
      !eventToDelete.imageUrl.startsWith("http") &&
      fs.existsSync(path.resolve(__dirname, "..", eventToDelete.imageUrl))
    ) {
      try {
        fs.unlinkSync(path.resolve(__dirname, "..", eventToDelete.imageUrl));
      } catch (e) {
        console.error("Erreur suppression image:", e);
      }
    }

    // Supprime les inscriptions, retire l'événement des participants et de la catégorie
    await Inscription.deleteMany({ event: eventId });
    await User.updateMany(
      { _id: { $in: eventToDelete.participants } },
      { $pull: { participatedEvents: eventId } }
    );
    await Category.findByIdAndUpdate(eventToDelete.category, {
      $pull: { events: eventId },
    });
    await Event.findByIdAndDelete(eventId);

    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

// --- Inscription d'un participant ---
const registerToEvent = async (req, res, next) => {
  try {
    const eventId = req.params.id;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ error: "ID d'événement invalide" });
    }

    const participantUser = await User.findById(userId);
    const event = await Event.findById(eventId);

    if (!event) return res.status(404).json({ error: "Événement non trouvé" });
    if (!participantUser)
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    if (event.participants.includes(participantUser._id))
      return res.status(400).json({ error: "Vous êtes déjà inscrit" });

    const { nom, email, profession } = req.body;

    event.participants.push(participantUser._id);
    participantUser.participatedEvents.push(event._id);
    await event.save();
    await participantUser.save();

    if (event.qrOption) {
      const qrFormData = {
        nom: nom || participantUser.nom,
        email: email || participantUser.email,
        profession: profession || participantUser.profession,
      };

      const { qrCodeImage, token } =
        await qrCodeService.generateQRCodeForInscription(
          qrFormData,
          event,
          participantUser
        );
      const inscription = new Inscription({
        event: event._id,
        participant: participantUser._id,
        qrCodeToken: token,
        qrCodeImage: qrCodeImage,
      });
      await inscription.save();

      return res.status(201).json({
        message: "Inscription réussie avec QR code",
        qrCode: qrCodeImage,
      });
    }

    res.status(201).json({ message: "Inscription réussie" });
  } catch (error) {
    next(error);
  }
};

// --- Désinscription d'un participant ---
const unregisterFromEvent = async (req, res, next) => {
  try {
    const eventId = req.params.id;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ error: "ID d'événement invalide" });
    }

    await Event.findByIdAndUpdate(eventId, { $pull: { participants: userId } });
    await User.findByIdAndUpdate(userId, {
      $pull: { participatedEvents: eventId },
    });
    await Inscription.findOneAndDelete({ event: eventId, participant: userId });

    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

// --- Validation QR code ---
const validateQRCodeWithEventName = async (req, res, next) => {
  try {
    const { qrCodeToken, eventName } = req.body;
    const userValidating = await User.findById(req.user.id);

    if (!userValidating)
      return res
        .status(401)
        .json({ error: "Utilisateur validateur non trouvé." });

    const inscription = await Inscription.findOne({ qrCodeToken })
      .populate("participant", "nom email profession")
      .populate("event", "name organizer");

    if (!inscription)
      return res
        .status(404)
        .json({ error: "QR Code invalide ou inscription non trouvée." });

    const { participant, event } = inscription;

    if (event.name !== eventName)
      return res
        .status(400)
        .json({ error: "Ce QR code est pour un autre événement." });

    const isEventOwner =
      event.organizer.toString() === userValidating._id.toString();
    const isAdmin = userValidating.role === "administrateur";
    if (!isEventOwner && !isAdmin)
      return res.status(403).json({
        error: "Vous n'êtes pas autorisé à valider pour cet événement.",
      });

    if (inscription.isValidated)
      return res.status(409).json({ error: "Ce QR code a déjà été utilisé." });

    inscription.isValidated = true;
    inscription.validatedBy = userValidating._id;
    inscription.validatedAt = new Date();
    await inscription.save();

    res.json({
      message: "QR code validé avec succès",
      participant: {
        id: participant._id,
        nom: participant.nom,
        email: participant.email,
        profession: participant.profession,
      },
      event: { id: event._id, name: event.name },
    });
  } catch (error) {
    next(error);
  }
};

// --- Ajouter un participant (par Admin/Organisateur) ---
const addParticipant = async (req, res, next) => {
  try {
    const { participantId } = req.body;
    const eventId = req.params.id;
    const user = req.user;

    if (
      !mongoose.Types.ObjectId.isValid(eventId) ||
      !mongoose.Types.ObjectId.isValid(participantId)
    ) {
      return res.status(400).json({ error: "ID invalide." });
    }

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ error: "Événement non trouvé" });

    const isOwner = event.organizer.toString() === user.id;
    const isAdmin = user.role === "administrateur";
    if (!isOwner && !isAdmin)
      return res.status(403).json({ error: "Action non autorisée." });

    const participant = await User.findById(participantId);
    if (!participant)
      return res.status(404).json({ error: "Utilisateur non trouvé" });

    if (event.participants.includes(participant._id)) {
      return res
        .status(400)
        .json({ error: "Cet utilisateur est déjà inscrit." });
    }

    event.participants.push(participant._id);
    participant.participatedEvents.push(event._id);
    await event.save();
    await participant.save();

    if (event.qrOption) {
      const { qrCodeImage, token } =
        await qrCodeService.generateQRCodeForInscription(
          {
            nom: participant.nom,
            email: participant.email,
            profession: participant.profession,
          },
          event,
          participant
        );
      const inscription = new Inscription({
        event: event._id,
        participant: participant._id,
        qrCodeToken: token,
        qrCodeImage: qrCodeImage,
      });
      await inscription.save();
    }

    const populatedEvent = await Event.findById(eventId)
      .populate("participants", "nom email role sexe profession") // Peuple avec les nouveaux champs
      .populate("organizer", "nom email")
      .populate("category", "name emoji"); // Ne pas oublier la catégorie

    res.json(populatedEvent);
  } catch (error) {
    next(error);
  }
};

// --- Supprimer un participant (par Admin/Organisateur) ---
const removeParticipant = async (req, res, next) => {
  try {
    const { participantId } = req.params;
    const eventId = req.params.id;
    const user = req.user;

    if (
      !mongoose.Types.ObjectId.isValid(eventId) ||
      !mongoose.Types.ObjectId.isValid(participantId)
    ) {
      return res.status(400).json({ error: "ID invalide." });
    }

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ error: "Événement non trouvé" });

    const isOwner = event.organizer.toString() === user.id;
    const isAdmin = user.role === "administrateur";
    if (!isOwner && !isAdmin)
      return res.status(403).json({ error: "Action non autorisée." });

    await Event.findByIdAndUpdate(eventId, {
      $pull: { participants: participantId },
    });
    await User.findByIdAndUpdate(participantId, {
      $pull: { participatedEvents: eventId },
    });
    await Inscription.findOneAndDelete({
      event: eventId,
      participant: participantId,
    });

    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

// --- Obtenir les événements créés par l'organisateur connecté ---
const getEventsByOrganizer = async (req, res, next) => {
  try {
    const organizerId = req.user.id;

    const events = await Event.find({ organizer: organizerId })
      .populate("category", "name emoji")
      // ✅ C'EST CETTE LIGNE QUI AJOUTE SEXE ET PROFESSION
      .populate("participants", "nom email role sexe profession")
      .sort({ startDate: -1 });

    res.json(events);
  } catch (error) {
    console.error("❌ Erreur getEventsByOrganizer:", error);
    next(error);
  }
};
const getValidatedAttendees = async (req, res, next) => {
  try {
    const eventId = req.params.id;
    const userId = req.user.id; // ID de l'organisateur/admin connecté

    // 1. Vérifier que l'ID de l'événement est valide
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ error: "ID d'événement invalide" });
    }

    // 2. Trouver l'événement
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: "Événement non trouvé" });
    }

    // 3. Sécurité : Vérifier que l'utilisateur est l'organisateur OU un admin
    const isOwner = event.organizer.toString() === userId;
    const isAdmin = req.user.role === "administrateur";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        error:
          "Action non autorisée. Seul l'organisateur ou un admin peut voir cette liste.",
      });
    }

    // 4. Trouver toutes les inscriptions pour cet événement qui sont validées
    const inscriptions = await Inscription.find({
      event: eventId,
      isValidated: true, // Ne prend que les tickets scannés
    }).populate({
      // 5. Remplir les détails du participant
      path: "participant",
      select: "nom email sexe profession", // Sélectionne les champs demandés
    });

    // 6. Extraire les participants de la liste des inscriptions
    const attendees = inscriptions.map(
      (inscription) => inscription.participant
    );

    res.json(attendees);
  } catch (error) {
    next(error);
  }
};

const generateEventReport = async (req, res, next) => {
  try {
    const eventId = req.params.id;
    const userId = req.user.id;

    // 1. Récupérer l'événement
    const event = await Event.findById(eventId).populate("category", "name");
    if (!event) {
      return res.status(404).json({ error: "Événement non trouvé" });
    }

    // 2. Sécurité : Vérifier les droits
    const isOwner = event.organizer.toString() === userId;
    const isAdmin = req.user.role === "administrateur";
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: "Action non autorisée." });
    }

    // 3. Récupérer TOUTES les inscriptions (pour les stats complètes)
    const inscriptions = await Inscription.find({ event: eventId }).populate(
      "participant",
      "nom email sexe profession"
    );

    // 4. Calculer les statistiques
    const totalRegistered = inscriptions.length;
    const validatedInscriptions = inscriptions.filter((i) => i.isValidated);
    const totalValidated = validatedInscriptions.length;
    const participationRate =
      totalRegistered > 0 ? (totalValidated / totalRegistered) * 100 : 0;

    // Stats par Sexe
    const statsSexRegistered = inscriptions.reduce((acc, i) => {
      const sexe = i.participant?.sexe || "Inconnu";
      acc[sexe] = (acc[sexe] || 0) + 1;
      return acc;
    }, {});
    const statsSexValidated = validatedInscriptions.reduce((acc, i) => {
      const sexe = i.participant?.sexe || "Inconnu";
      acc[sexe] = (acc[sexe] || 0) + 1;
      return acc;
    }, {});

    // Stats par Profession (Top 5)
    const statsProfRegistered = inscriptions.reduce((acc, i) => {
      const prof = i.participant?.profession || "Inconnu";
      acc[prof] = (acc[prof] || 0) + 1;
      return acc;
    }, {});

    // 5. Générer le HTML pour le PDF
    const htmlContent = getReportHTML(
      event,
      inscriptions,
      validatedInscriptions,
      {
        totalRegistered,
        totalValidated,
        participationRate,
        statsSexRegistered,
        statsSexValidated,
        statsProfRegistered,
      }
    );

    // 6. Lancer Puppeteer pour convertir le HTML en PDF
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"], // Nécessaire pour Render/Linux
    });
    const page = await browser.newPage();

    // Injecter Chart.js dans la page
    await page.addScriptTag({ path: require.resolve("chart.js/auto") });

    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    // Exécuter le JS dans la page pour dessiner le graphique
    await page.evaluate(() => {
      const ctx = document
        .getElementById("participationChart")
        .getContext("2d");
      // Les données sont passées via un script dans getReportHTML
      new Chart(ctx, window.chartConfig);
    });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true, // Important pour les couleurs des graphiques
      margin: { top: "40px", right: "40px", bottom: "40px", left: "40px" },
    });

    await browser.close();

    // 7. Envoyer le PDF
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="rapport-${event.name.replace(/ /g, "_")}.pdf"`
    );
    res.send(pdfBuffer);
  } catch (error) {
    console.error("❌ Erreur génération PDF:", error);
    next(error);
  }
};
// --- FIN NOUVELLE FONCTION ---

// --- FONCTION UTILITAIRE (à mettre dans le même fichier) ---
// Crée le HTML qui sera transformé en PDF
function getReportHTML(event, inscriptions, validatedInscriptions, stats) {
  // Fonction pour générer une ligne de tableau
  const createRow = (participant) => `
    <tr>
      <td>${participant?.nom || "N/A"}</td>
      <td>${participant?.email || "N/A"}</td>
      <td>${participant?.sexe || "N/A"}</td>
      <td>${participant?.profession || "N/A"}</td>
    </tr>
  `;

  // Fonction pour générer les stats par sexe
  const createSexStats = (registered, validated) => {
    const allSexes = new Set([
      ...Object.keys(registered),
      ...Object.keys(validated),
    ]);
    let rows = "";
    allSexes.forEach((sexe) => {
      rows += `<tr>
        <td>${sexe}</td>
        <td>${registered[sexe] || 0}</td>
        <td>${validated[sexe] || 0}</td>
      </tr>`;
    });
    return rows;
  };

  // Configuration du graphique (la "courbe")
  const chartConfig = {
    type: "doughnut", // Un "doughnut" est visuel
    data: {
      labels: ["Participants Validés", "Inscrits (non-validés)"],
      datasets: [
        {
          label: "Taux de Participation",
          data: [
            stats.totalValidated,
            stats.totalRegistered - stats.totalValidated,
          ],
          backgroundColor: [
            "rgba(54, 162, 235, 0.8)", // Bleu
            "rgba(201, 203, 207, 0.5)", // Gris
          ],
          borderColor: ["rgba(54, 162, 235, 1)", "rgba(201, 203, 207, 1)"],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "top" },
        title: { display: true, text: "Répartition des Inscriptions" },
      },
    },
  };

  return `
    <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; font-size: 10px; line-height: 1.4; color: #333; }
          .container { width: 100%; margin: 0 auto; }
          h1, h2, h3 { color: #000; font-weight: 600; }
          h1 { font-size: 24px; text-align: center; border-bottom: 2px solid #eee; padding-bottom: 10px; margin-bottom: 20px; }
          h2 { font-size: 18px; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-top: 25px; margin-bottom: 10px; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; background: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
          .info-grid p { margin: 0; }
          .info-grid strong { color: #555; }
          .chart-container { width: 80%; max-width: 400px; margin: 20px auto; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: 600; }
          tr:nth-child(even) { background-color: #f9f9f9; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Rapport d'Événement</h1>
          
          <h2>Détails de l'Événement</h2>
          <div class="info-grid">
            <p><strong>Nom:</strong> ${event.name}</p>
            <p><strong>Catégorie:</strong> ${event.category?.name || "N/A"}</p>
            <p><strong>Date de début:</strong> ${new Date(
              event.startDate
            ).toLocaleDateString("fr-FR")}</p>
            <p><strong>Ville:</strong> ${event.city}</p>
            <p><strong>Lieu:</strong> ${event.neighborhood || "N/A"}</p>
            <p><strong>Prix:</strong> ${
              event.price > 0 ? `${event.price} FCFA` : "Gratuit"
            }</p>
          </div>
          <p><strong>Description:</strong> ${event.description}</p>

          <h2>Statistiques de Participation</h2>
          <div class="info-grid">
            <p><strong>Total Inscrits:</strong> ${stats.totalRegistered}</p>
            <p><strong>Total Validés (Présents):</strong> ${
              stats.totalValidated
            }</p>
            <p><strong>Taux de Participation:</strong> ${stats.participationRate.toFixed(
              1
            )}%</p>
          </div>
          
          <div class="chart-container">
            <canvas id="participationChart"></canvas>
          </div>
          
          <h2>Statistiques Démographiques</h2>
          <table>
            <thead>
              <tr><th>Sexe</th><th>Inscrits</th><th>Validés</th></tr>
            </thead>
            <tbody>
              ${createSexStats(
                stats.statsSexRegistered,
                stats.statsSexValidated
              )}
            </tbody>
          </table>

          <h2>Liste des Participants Validés (${stats.totalValidated})</h2>
          <table>
            <thead>
              <tr><th>Nom</th><th>Email</th><th>Sexe</th><th>Profession</th></tr>
            </thead>
            <tbody>
              ${validatedInscriptions
                .map((i) => createRow(i.participant))
                .join("")}
            </tbody>
          </table>
          
          <h2>Liste de Tous les Inscrits (${stats.totalRegistered})</h2>
          <table>
            <thead>
              <tr><th>Nom</th><th>Email</th><th>Sexe</th><th>Profession</th></tr>
            </thead>
            <tbody>
              ${inscriptions.map((i) => createRow(i.participant)).join("")}
            </tbody>
          </table>
        </div>
        
        <script>
          window.chartConfig = ${JSON.stringify(chartConfig)};
        </script>
      </body>
    </html>
  `;
}
module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  registerToEvent,
  unregisterFromEvent,
  validateQRCodeWithEventName,
  addParticipant,
  removeParticipant,
  getEventsByOrganizer,
  validateQRCodeWithEventName,
  getValidatedAttendees,
  generateEventReport,
};
