import React, { useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../../components/layouts/MainLayout";
import QrCodeDisplay from "../../components/ui/QrCodeDisplay";
import { useUserEvents } from "../../hooks/useUserProfile";

const UserQrCodesPage = () => {
  const { data: eventsData, isLoading, isError, error } = useUserEvents();

  // État pour gérer l'ouverture/fermeture de la modale et le QR code sélectionné
  const [selectedQr, setSelectedQr] = useState(null); // Stockera l'image Base64

  // Filtre les événements auxquels l'utilisateur participe ET qui ont une image QR code
  const eventsWithQrCodes =
    eventsData?.participated?.filter((event) => event.qrCodeImage) || [];

  const formatDate = (dateString) => {
    if (!dateString) return "Date inconnue";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
          Chargement de vos QR codes...
        </div>
      </MainLayout>
    );
  }

  if (isError) {
    return (
      <MainLayout>
        <div className="p-8 text-center text-red-500">
          Erreur : {error.message}
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto p-4 sm:p-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Mes QR Codes d'Entrée
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Présentez le QR code correspondant à l'entrée de l'événement pour
          validation.
        </p>

        {eventsWithQrCodes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {eventsWithQrCodes.map((event) => (
              <div
                key={event._id || event.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col items-center text-center"
              >
                {/* Affiche la petite image du QR code sur la carte */}
                <div className="mb-4">
                  <QrCodeDisplay value={event.qrCodeImage} size={160} />
                </div>

                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                  {event.name}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {formatDate(event.startDate)}
                </p>

                {/* Bouton pour ouvrir la modale d'affichage en grand */}
                <button
                  onClick={() => setSelectedQr(event.qrCodeImage)}
                  className="mt-4 w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition-colors"
                >
                  Afficher pour Scan
                </button>

                <Link
                  to={`/events/${event.id}`}
                  className="mt-2 text-sm text-blue-600 hover:underline dark:text-blue-400"
                >
                  Voir les détails
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">
              Aucun QR code trouvé
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Participez à un événement avec l'option QR code activée pour
              obtenir votre ticket d'entrée.
            </p>
          </div>
        )}
      </div>

      {/* --- MODALE D'AFFICHAGE EN GRAND FORMAT --- */}
      {/* S'affiche uniquement si 'selectedQr' n'est pas nul */}
      {selectedQr && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setSelectedQr(null)} // Clique n'importe où sur le fond noir pour fermer
        >
          {/* Conteneur blanc pour le QR code */}
          <div
            className="bg-white p-6 md:p-10 rounded-xl"
            onClick={(e) => e.stopPropagation()} // Empêche la fermeture si on clique sur le QR
          >
            {/* Affiche le QR code en grand (300px) */}
            <QrCodeDisplay value={selectedQr} size={300} />
            <p className="text-center text-gray-700 mt-4 font-medium">
              Présentez ce code à l'organisateur.
            </p>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default UserQrCodesPage;
