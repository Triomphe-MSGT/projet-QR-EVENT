// src/components/dashboard/OrganizerEventList.jsx (Complet et Corrigé)

import React, { useState } from "react"; // <-- 1. Importer useState
import { Link, useNavigate } from "react-router-dom";
import { useDeleteEvent } from "../../hooks/useEvents"; // Hook pour la suppression

// --- AJOUT ---
// Importer les icônes nécessaires et le service de téléchargement
import {
  Edit,
  Trash2,
  PlusCircle,
  Eye,
  Users,
  Loader2,
  Download,
} from "lucide-react";
// Assurez-vous que le chemin est correct
// --- FIN AJOUT ---

import Button from "../ui/Button";
import ParticipantManagementModal from "./ParticipantManagementModal"; // <-- 3. Importer la nouvelle modale
import { downloadEventReport } from "../../services/dashboardService";

const OrganizerEventList = ({ events }) => {
  const navigate = useNavigate();
  const deleteMutation = useDeleteEvent();

  const [managingEvent, setManagingEvent] = useState(null); // Stocke l'événement dont on gère les participants

  // --- AJOUT ---
  // Nouvel état pour suivre le téléchargement
  const [downloadingId, setDownloadingId] = useState(null); // Stocke l'ID de l'événement en cours de téléchargement
  // --- FIN AJOUT ---

  const formatDate = (dateString) => {
    if (!dateString) return "?";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleDelete = (eventId, eventName) => {
    if (window.confirm(`Supprimer l'événement "${eventName}" ?`)) {
      deleteMutation.mutate(eventId, {
        onError: (err) => alert(`Erreur: ${err.message}`),
      });
    }
  };

  const handleEdit = (eventId) => {
    navigate(`/createevent?edit=${eventId}`);
  };

  const handleManageParticipants = (event) => {
    if (!event.participants) {
      console.error(
        "Données participants manquantes. Assurez-vous que l'API popule les participants."
      );
      alert("Impossible de charger la liste des participants.");
      return;
    }
    setManagingEvent(event);
  };

  // --- AJOUT ---
  // Fonction pour gérer le téléchargement du rapport
  // Fonction pour gérer le téléchargement du rapport
  const handleDownload = async (e, eventId, eventName) => {
    e.stopPropagation(); // Empêche le clic de se propager au <Link>
    
    // Demander le format à l'utilisateur (simple prompt pour l'instant, pourrait être une modale)
    const format = window.prompt("Choisissez le format du rapport (pdf ou csv) :", "pdf");
    if (!format || (format !== "pdf" && format !== "csv")) {
      if (format) alert("Format invalide. Veuillez choisir 'pdf' ou 'csv'.");
      return;
    }

    setDownloadingId(eventId); // Active le loader pour ce bouton
    try {
      await downloadEventReport(eventId, eventName, format);
    } catch (error) {
      console.error("Échec du téléchargement du rapport:", error);
      alert("Le téléchargement du rapport a échoué.");
    }
    setDownloadingId(null); // Désactive le loader
  };
  // --- FIN AJOUT ---

  return (
    <>
      {/* Rendu conditionnel de la Modale */}
      {managingEvent && (
        <ParticipantManagementModal
          event={managingEvent}
          onClose={() => setManagingEvent(null)}
        />
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Mes Événements Créés
          </h2>
          <Link to="/createevent">
            <Button variant="primary" size="sm" className="w-full sm:w-auto">
              <PlusCircle size={18} className="mr-2" />
              Créer un Nouvel Événement
            </Button>
          </Link>
        </div>

        {!events || events.length === 0 ? (
          <div className="text-center py-10 px-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
              Aucun événement trouvé
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Vous n'avez pas encore créé d'événement.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <div
                key={event._id || event.id}
                className="p-4 bg-gray-50 dark:bg-gray-700/60 rounded-lg flex flex-col md:flex-row justify-between md:items-center gap-3 shadow-sm"
              >
                <Link to={`/events/${event._id || event.id}`} className="flex-grow group">
                  <h3 className="font-semibold text-gray-800 dark:text-white group-hover:text-blue-600">
                    {event.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(event.startDate)} - {event.city} -
                    <span className="font-medium text-blue-600 dark:text-blue-400">
                      {" "}
                      {event.participants?.length || 0} inscrit(s)
                    </span>
                  </p>
                </Link>

                {/* --- MODIFIÉ : Ajout du bouton Télécharger --- */}
                <div className="flex-shrink-0 flex items-center gap-2 self-end md:self-center flex-wrap">
                  {/* Bouton "Gérer Inscrits" */}
                  <Button
                    variant="secondary"
                    size="xs"
                    onClick={() => handleManageParticipants(event)}
                    title="Gérer les inscrits"
                    className="bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-300"
                  >
                    <Users size={14} className="mr-1" />
                    Gérer Inscrits
                  </Button>

                  {/* Bouton Télécharger Rapport */}
                  {/* --- MODIFIÉ : Bouton de Rapport plus visible --- */}
                  <Button
                    variant="secondary" // Utilise le même style que "Gérer"
                    size="xs"
                    onClick={(e) => handleDownload(e, event._id || event.id, event.name)}
                    disabled={downloadingId === (event._id || event.id)}
                    title="Télécharger le rapport PDF"
                    // Couleur verte distincte pour le rapport
                    className="bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-300"
                  >
                    {downloadingId === (event._id || event.id) ? (
                      <Loader2 className="animate-spin w-4 h-4 mr-1" />
                    ) : (
                      <Download size={14} className="mr-1" />
                    )}
                    Rapport
                  </Button>

                  {/* Bouton Modifier */}
                  <Button
                    variant="outline_icon"
                    size="xs"
                    onClick={() => handleEdit(event._id || event.id)}
                    title="Modifier"
                  >
                    <Edit size={14} />
                  </Button>

                  {/* Bouton Supprimer */}
                  <Button
                    variant="danger_icon"
                    size="xs"
                    onClick={() => handleDelete(event._id || event.id, event.name)}
                    disabled={
                      deleteMutation.isPending &&
                      deleteMutation.variables === (event._id || event.id)
                    }
                    title="Supprimer"
                  >
                    {deleteMutation.isPending &&
                    deleteMutation.variables === (event._id || event.id) ? (
                      <Loader2 className="animate-spin w-4 h-4" />
                    ) : (
                      <Trash2 size={14} />
                    )}
                  </Button>
                </div>
                {/* --- FIN MODIFICATION --- */}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default OrganizerEventList;
