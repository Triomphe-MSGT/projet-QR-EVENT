import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useUserEvents } from "../../hooks/userProfileHooks";

const UserEventsList = () => {
  const { data: eventsData, isLoading, isError, error } = useUserEvents();

  // État local pour afficher ou non la modale QR
  // `selectedQr` contient le token du QR à agrandir, sinon null.
  const [selectedQr, setSelectedQr] = useState(null);

  const formatDate = (dateString) => {
    if (!dateString) return "Date inconnue";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Gestion des états de chargement et d’erreur simples
  if (isLoading)
    return (
      <p className="text-center text-gray-500 dark:text-gray-400">
        Chargement...
      </p>
    );
  if (isError)
    return <p className="text-center text-red-500">Erreur: {error.message}</p>;

  // Détection de la présence d'événements
  const hasOrganizedEvents = eventsData?.organized?.length > 0;
  const hasParticipatedEvents = eventsData?.participated?.length > 0;

  return (
    <div className="space-y-6">
      {/* ────── Modale QR Code ──────
          S'affiche lorsqu'un QR code est sélectionné.
          Permet un aperçu plein écran du ticket. */}
      {selectedQr && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm"
          onClick={() => setSelectedQr(null)} // Ferme la modale en cliquant en dehors
        >
          <div
            className="relative bg-white p-6 rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()} // Empêche la propagation du clic
          >
            <button
              onClick={() => setSelectedQr(null)}
              className="absolute -top-3 -right-3 bg-white rounded-full p-1 text-gray-700 hover:bg-gray-200"
            >
              <X size={24} />
            </button>
            <h3 className="text-center font-bold text-lg mb-4">
              Votre Ticket d'Entrée
            </h3>
            <QrCodeDisplay value={selectedQr} size={256} />
          </div>
        </div>
      )}

      {/* ────── Section : Événements Participés ──────
          Liste des événements auxquels l'utilisateur est inscrit,
          avec possibilité d'afficher le QR code associé. */}
      {hasParticipatedEvents && (
        <section>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">
            Mes Participations
          </h3>
          <div className="space-y-3">
            {eventsData.participated.map((event) => (
              <div
                key={event._id || event.id}
                className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg flex items-center gap-4"
              >
                <div className="flex-grow">
                  <Link to={`/events/${event.id}`}>
                    <p className="font-semibold text-gray-900 dark:text-white hover:text-blue-600">
                      {event.name}
                    </p>
                  </Link>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {formatDate(event.startDate)} - {event.city}
                  </p>
                </div>

                {/* Bouton QR Code — uniquement si le ticket contient un token */}
                {event.qrCodeToken && (
                  <button
                    onClick={() => setSelectedQr(event.qrCodeToken)}
                    className="p-1 bg-white rounded-md shadow-sm hover:scale-110 transition-transform"
                    title="Agrandir le QR Code"
                  >
                    <QrCodeDisplay value={event.qrCodeToken} size={48} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ────── Section : Événements Organisés ──────
          Affiche les événements créés par l’utilisateur (en tant qu’organisateur). */}
      {hasOrganizedEvents && (
        <section>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">
            Événements que j'organise
          </h3>
          <div className="space-y-3">
            {eventsData.organized.map((event) => (
              <Link
                to={`/events/${event.id}`}
                key={event._id || event.id}
                className="block bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition"
              >
                <p className="font-semibold text-gray-900 dark:text-white">
                  {event.name}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {formatDate(event.startDate)} - {event.city}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ────── Message vide ──────
          Affiché si l'utilisateur n’a ni organisé ni participé à un événement. */}
      {!hasOrganizedEvents && !hasParticipatedEvents && (
        <p className="text-center text-gray-500 dark:text-gray-400 py-4">
          Vous n'êtes associé à aucun événement pour le moment.
        </p>
      )}
    </div>
  );
};

export default UserEventsList;
