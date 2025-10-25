// src/components/admin/EventManagement.jsx
import React from "react";
import { useEvents, useDeleteEvent } from "../../hooks/useEvents"; // Hooks pour TOUS les événements
import { Link, useNavigate } from "react-router-dom";
import Button from "../ui/Button"; // ✅ Vérifiez le chemin
import { PlusCircle, Edit, Trash2, Loader2 } from "lucide-react";

const EventManagement = () => {
  // Récupère TOUS les événements
  const { data: events = [], isLoading, isError, error } = useEvents();
  const deleteEventMutation = useDeleteEvent();
  const navigate = useNavigate();

  const handleDelete = (eventId, eventName) => {
    if (window.confirm(`Supprimer l'événement "${eventName}" ?`)) {
      deleteEventMutation.mutate(eventId, {
        onError: (err) => alert(`Erreur: ${err.message}`),
      });
    }
  };

  // L'édition se fait via la page dédiée /createevent?edit=ID
  const handleEdit = (eventId) => navigate(`/createevent?edit=${eventId}`);

  const formatDate = (dateString) =>
    dateString
      ? new Date(dateString).toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "-";

  if (isLoading)
    return (
      <div className="text-center p-6">
        <Loader2 className="animate-spin inline-block mr-2" /> Chargement des
        événements...
      </div>
    );
  if (isError)
    return (
      <p className="text-center p-6 text-red-500">
        Erreur de chargement des événements: {error.message}
      </p>
    );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Gestion des Événements ({events.length})
        </h2>
        <Link to="/createevent">
          <Button size="sm" variant="primary">
            <PlusCircle size={16} className="mr-2" /> Ajouter un Événement
          </Button>
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Nom
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Ville
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Organisateur
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {events.map((event) => (
              <tr
                key={event.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                  <Link
                    to={`/events/${event.id}`}
                    className="hover:text-blue-600"
                  >
                    {event.name}
                  </Link>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {formatDate(event.startDate)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {event.city}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {event.organizer?.nom || "N/A"}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <Button
                    variant="outline_icon"
                    size="xs"
                    onClick={() => handleEdit(event.id)}
                    title="Modifier"
                  >
                    <Edit size={14} />
                  </Button>
                  <Button
                    variant="danger_icon"
                    size="xs"
                    onClick={() => handleDelete(event.id, event.name)}
                    title="Supprimer"
                    disabled={
                      deleteEventMutation.isPending &&
                      deleteEventMutation.variables === event.id
                    }
                  >
                    {deleteEventMutation.isPending &&
                    deleteEventMutation.variables === event.id ? (
                      <Loader2 className="animate-spin w-3.5 h-3.5" />
                    ) : (
                      <Trash2 size={14} />
                    )}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EventManagement;
