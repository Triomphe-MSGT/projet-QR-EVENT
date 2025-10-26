// src/components/dashboard/OrganizerEventList.jsx
import React, { useState } from "react"; // <-- 1. Importer useState
import { Link, useNavigate } from "react-router-dom";
import { useDeleteEvent } from "../../hooks/useEvents"; // Hook pour la suppression
import { Edit, Trash2, PlusCircle, Eye, Users, Loader2 } from "lucide-react"; // <-- 2. Importer Users et Loader2
import Button from "../ui/Button";
import ParticipantManagementModal from "./ParticipantManagementModal"; // <-- 3. Importer la nouvelle modale

const OrganizerEventList = ({ events }) => {
  const navigate = useNavigate();
  const deleteMutation = useDeleteEvent();

  // --- 4. États pour la modale ---
  const [managingEvent, setManagingEvent] = useState(null); // Stocke l'événement dont on gère les participants

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

  // Ouvre la modale avec l'événement sélectionné
  const handleManageParticipants = (event) => {
    // Note: 'event' doit contenir la liste 'participants' peuplée.
    // Le hook useMyOrganizedEvents (appelé dans DashboardPage) doit s'assurer
    // que le backend peuple bien les participants.
    if (!event.participants) {
      console.error(
        "Données participants manquantes. Assurez-vous que l'API popule les participants."
      );
      alert("Impossible de charger la liste des participants.");
      return;
    }
    setManagingEvent(event);
  };

  return (
    <>
      {/* --- 5. Rendu conditionnel de la Modale --- */}
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
                key={event.id}
                className="p-4 bg-gray-50 dark:bg-gray-700/60 rounded-lg flex flex-col md:flex-row justify-between md:items-center gap-3 shadow-sm"
              >
                <Link to={`/events/${event.id}`} className="flex-grow group">
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

                <div className="flex-shrink-0 flex items-center gap-2 self-end md:self-center flex-wrap">
                  {/* --- 6. NOUVEAU BOUTON "Gérer Inscrits" --- */}
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

                  {/* Bouton Modifier */}
                  <Button
                    variant="outline_icon"
                    size="xs"
                    onClick={() => handleEdit(event.id)}
                    title="Modifier"
                  >
                    <Edit size={14} />
                  </Button>

                  {/* Bouton Supprimer */}
                  <Button
                    variant="danger_icon"
                    size="xs"
                    onClick={() => handleDelete(event.id, event.name)}
                    disabled={
                      deleteMutation.isPending &&
                      deleteMutation.variables === event.id
                    }
                    title="Supprimer"
                  >
                    {deleteMutation.isPending &&
                    deleteMutation.variables === event.id ? (
                      <Loader2 className="animate-spin w-4 h-4" />
                    ) : (
                      <Trash2 size={14} />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default OrganizerEventList;
