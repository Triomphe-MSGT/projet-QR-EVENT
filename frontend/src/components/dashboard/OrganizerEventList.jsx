// src/components/dashboard/OrganizerEventList.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDeleteEvent } from "../../hooks/useEvents"; // ✅ Hook pour la suppression
import { Edit, Trash2, PlusCircle, Eye } from "lucide-react"; // Ajout icônes
import Button from "../ui/Button"; // ✅ Assurez-vous que le chemin est correct

const OrganizerEventList = ({ events }) => {
  const navigate = useNavigate();
  const deleteMutation = useDeleteEvent(); // Prépare la mutation

  const formatDate = (dateString) => {
    if (!dateString) return "?";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleDelete = (eventId, eventName) => {
    // Demande de confirmation
    if (
      window.confirm(
        `Êtes-vous sûr de vouloir supprimer l'événement "${eventName}" ? Cette action est irréversible et supprimera toutes les inscriptions associées.`
      )
    ) {
      // Appelle la mutation si confirmé
      deleteMutation.mutate(eventId, {
        onSuccess: () => {
          console.log(`Événement ${eventId} supprimé avec succès.`);
          // Le cache est invalidé par le hook, la liste se mettra à jour
        },
        onError: (err) => {
          alert(
            `Erreur lors de la suppression: ${
              err.response?.data?.error || err.message
            }`
          );
        },
      });
    }
  };

  // Redirige vers le formulaire en mode édition
  const handleEdit = (eventId) => {
    navigate(`/createevent?edit=${eventId}`);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          Mes Événements Créés
        </h2>
        {/* --- Bouton Ajouter --- */}
        <Link to="/createevent">
          <Button variant="primary" size="sm" className="w-full sm:w-auto">
            <PlusCircle size={18} className="mr-2" />
            Créer un Nouvel Événement
          </Button>
        </Link>
      </div>

      {/* --- Liste des Événements --- */}
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
              className="p-4 bg-gray-50 dark:bg-gray-700/60 rounded-lg flex flex-col md:flex-row justify-between md:items-center gap-3 shadow-sm hover:shadow-md transition"
            >
              {/* Infos principales (cliquables) */}
              <Link to={`/events/${event.id}`} className="flex-grow group">
                <h3 className="font-semibold text-gray-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  {event.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(event.startDate)} - {event.city} -{" "}
                  {event.participants?.length || 0} inscrit(s)
                </p>
                {event.qrOption && (
                  <span className="text-xs font-medium text-green-600 dark:text-green-400 ml-2">
                    (QR Activé)
                  </span>
                )}
              </Link>

              {/* --- ✅ BOUTONS D'ACTION CRUD AJOUTÉS ICI --- */}
              <div className="flex-shrink-0 flex items-center gap-2 self-end md:self-center">
                {/* Bouton Voir Détails (icône seulement) */}
                <Link to={`/events/${event.id}`}>
                  <Button
                    variant="secondary_icon" // Style pour icône seule
                    size="sm" // Taille légèrement plus grande pour clic facile
                    className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                    title="Voir les détails"
                  >
                    <Eye size={18} />
                  </Button>
                </Link>

                {/* Bouton Modifier (icône seulement) */}
                <Button
                  variant="outline_icon" // Style pour icône seule avec bordure
                  size="sm"
                  className="text-gray-500 hover:text-green-600 hover:border-green-500 dark:text-gray-400 dark:hover:text-green-400 dark:hover:border-green-400"
                  onClick={() => handleEdit(event.id)}
                  title="Modifier l'événement"
                >
                  <Edit size={16} />
                </Button>

                {/* Bouton Supprimer (icône seulement) */}
                <Button
                  variant="danger_icon" // Style pour icône danger seule
                  size="sm"
                  onClick={() => handleDelete(event.id, event.name)}
                  disabled={
                    deleteMutation.isPending &&
                    deleteMutation.variables === event.id
                  }
                  title="Supprimer l'événement"
                  className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 disabled:opacity-50"
                >
                  {/* Afficher une icône de chargement */}
                  {deleteMutation.isPending &&
                  deleteMutation.variables === event.id ? (
                    <div className="w-4 h-4 border-2 border-t-current border-gray-200 dark:border-gray-500 rounded-full animate-spin"></div>
                  ) : (
                    <Trash2 size={16} />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrganizerEventList;
