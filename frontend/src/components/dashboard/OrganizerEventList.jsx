// src/components/dashboard/OrganizerEventList.jsx (Complet et Corrigé)

import React, { useState } from "react"; // <-- 1. Importer useState
import { Link, useNavigate } from "react-router-dom";
import { useDeleteEvent } from "../../hooks/useEvents"; // Hook pour la suppression

import { useSelector } from "react-redux";
import {
  Edit,
  Trash2,
  PlusCircle,
  Eye,
  Users,
  Loader2,
  Download,
  AlertCircle,
} from "lucide-react";
// Assurez-vous que le chemin est correct
// --- FIN AJOUT ---

import Button from "../ui/Button";
import ParticipantManagementModal from "./ParticipantManagementModal"; // <-- 3. Importer la nouvelle modale
import { downloadEventReport } from "../../services/dashboardService";

const OrganizerEventList = ({ events }) => {
  const navigate = useNavigate();
  const deleteMutation = useDeleteEvent();
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.role === "Administrateur";

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

  const isDeletionAllowed = (event) => {
    if (isAdmin) return true;
    
    // Si pas de createdAt (vieux événements), on utilise l'ID pour extraire le timestamp
    const creationDate = event.createdAt 
      ? new Date(event.createdAt) 
      : new Date(parseInt((event._id || event.id).substring(0, 8), 16) * 1000);
      
    const now = new Date();
    const diffInHours = (now - creationDate) / (1000 * 60 * 60);
    return diffInHours <= 24;
  };

  const handleDelete = (event) => {
    const eventId = event._id || event.id;
    const eventName = event.name;

    if (!isDeletionAllowed(event)) {
      alert("Le délai de suppression de 24h est dépassé. Seul un administrateur peut supprimer cet événement.");
      return;
    }

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

  const [isChoiceModalOpen, setIsChoiceModalOpen] = useState(false);

  return (
    <>
      {/* Rendu conditionnel de la Modale de Gestion des Participants */}
      {managingEvent && (
        <ParticipantManagementModal
          event={managingEvent}
          onClose={() => setManagingEvent(null)}
        />
      )}

      {/* Modale de Choix de Visibilité */}
      {isChoiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 md:p-12 max-w-2xl w-full shadow-2xl border border-gray-100 dark:border-gray-700 animate-scale-up">
            <div className="text-center space-y-4 mb-10">
              <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                Quel type d'événement <br /> <span className="text-blue-600">souhaitez-vous créer ?</span>
              </h3>
              <p className="text-gray-500 dark:text-gray-400 font-medium">
                Choisissez la visibilité de votre événement. Vous pourrez la modifier plus tard.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button
                onClick={() => navigate("/createevent?visibility=public")}
                className="group p-8 bg-blue-50 dark:bg-blue-900/20 rounded-[2rem] border-2 border-transparent hover:border-blue-600 transition-all text-left"
              >
                <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Users className="w-7 h-7" />
                </div>
                <h4 className="text-xl font-black text-gray-900 dark:text-white mb-2">Événement Public</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                  Visible par tous les utilisateurs sur la plateforme et dans les résultats de recherche.
                </p>
              </button>

              <button
                onClick={() => navigate("/createevent?visibility=private")}
                className="group p-8 bg-purple-50 dark:bg-purple-900/20 rounded-[2rem] border-2 border-transparent hover:border-purple-600 transition-all text-left"
              >
                <div className="w-14 h-14 bg-purple-600 text-white rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Eye className="w-7 h-7" />
                </div>
                <h4 className="text-xl font-black text-gray-900 dark:text-white mb-2">Événement Privé</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                  Uniquement accessible via un lien direct. Non listé publiquement sur la plateforme.
                </p>
              </button>
            </div>

            <button
              onClick={() => setIsChoiceModalOpen(false)}
              className="mt-10 w-full py-4 text-sm font-black text-gray-400 hover:text-gray-600 uppercase tracking-widest transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Mes Événements Créés
          </h2>
          <Button 
            variant="primary" 
            size="sm" 
            className="w-full sm:w-auto"
            onClick={() => setIsChoiceModalOpen(true)}
          >
            <PlusCircle size={18} className="mr-2" />
            Créer un Nouvel Événement
          </Button>
        </div>

        <style>{`
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes scaleUp { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
          .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
          .animate-scale-up { animation: scaleUp 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
        `}</style>

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
            {events.map((event) => {
              const allowed = isDeletionAllowed(event);
              return (
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
                      variant={allowed ? "danger_icon" : "secondary"}
                      size="xs"
                      onClick={() => handleDelete(event)}
                      disabled={
                        (deleteMutation.isPending &&
                        deleteMutation.variables === (event._id || event.id))
                      }
                      title={allowed ? "Supprimer" : "Suppression verrouillée (24h dépassées)"}
                      className={!allowed ? "opacity-50 cursor-not-allowed grayscale" : ""}
                    >
                      {deleteMutation.isPending &&
                      deleteMutation.variables === (event._id || event.id) ? (
                        <Loader2 className="animate-spin w-4 h-4" />
                      ) : allowed ? (
                        <Trash2 size={14} />
                      ) : (
                        <AlertCircle size={14} className="text-gray-400" />
                      )}
                    </Button>
                  </div>
                  {/* --- FIN MODIFICATION --- */}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default OrganizerEventList;
