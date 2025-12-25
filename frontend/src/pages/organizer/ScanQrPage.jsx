// src/pages/organizer/ScanQrPage.jsx
import React, { useState } from "react";
import MainLayout from "../../components/layout/MainLayout";
import QrScanner from "../../features/events/components/QrScanner";
import { useMyOrganizedEvents, useEvents } from "../../hooks/useEvents"; // Importer useEvents pour l'admin
import { useUserProfile } from "../../hooks/useUserProfile"; // Pour obtenir le rôle
import { Loader2, ArrowLeft } from "lucide-react";
import Button from "../../components/ui/Button";

const ScanQrPage = () => {
  const [selectedEventName, setSelectedEventName] = useState("");
  const [showScanner, setShowScanner] = useState(false);

  // 1. Récupérer le profil de l'utilisateur pour connaître son rôle
  const {
    data: user,
    isLoading: isLoadingUser,
    isError: isUserError,
    error: userError,
  } = useUserProfile();
  const isAdmin = user?.role === "administrateur"; // Vérifie si admin (minuscule)

  // 2. Charger les événements appropriés en fonction du rôle
  // Pour les organisateurs : seulement leurs événements
  const {
    data: organizedEvents = [],
    isLoading: isLoadingOrgEvents,
    isError: isOrgEventsError,
    error: orgEventsError,
  } = useMyOrganizedEvents({ enabled: !isAdmin && !!user }); // Ne charge que si c'est un Orga

  // Pour les admins : tous les événements (pour le sélecteur)
  const {
    data: allEvents = [],
    isLoading: isLoadingAllEvents,
    isError: isAllEventsError,
    error: allEventsError,
  } = useEvents({ enabled: isAdmin && !!user }); // Ne charge que si c'est un Admin

  // Combine les états de chargement et d'erreur
  const isLoading =
    isLoadingUser || (isAdmin ? isLoadingAllEvents : isLoadingOrgEvents);
  const isError =
    isUserError || (isAdmin ? isAllEventsError : isOrgEventsError);
  const error = userError || (isAdmin ? allEventsError : orgEventsError);

  // Détermine la liste d'événements à afficher dans le sélecteur
  const eventListForSelector = isAdmin ? allEvents : organizedEvents;

  // Gestion du chargement
  if (isLoading) {
    return (
      <MainLayout>
        <div className="p-8 text-center">
          <Loader2 className="animate-spin inline mr-2" /> Chargement...
        </div>
      </MainLayout>
    );
  }
  // Gestion des erreurs
  if (isError) {
    return (
      <MainLayout>
        <div className="p-8 text-center text-red-500">
          Erreur: {error.message}
        </div>
      </MainLayout>
    );
  }
  // Si pas d'événements (pour Orga ou Admin n'ayant rien créé)
  if (!isAdmin && organizedEvents.length === 0) {
    return (
      <MainLayout>
        <div className="p-8 text-center text-gray-600 dark:text-gray-400">
          Vous devez avoir créé au moins un événement pour utiliser le scanner.
        </div>
      </MainLayout>
    );
  }

  const handleStartScan = () => {
    if (selectedEventName) {
      setShowScanner(true);
    } else {
      alert("Veuillez sélectionner l'événement pour lequel vous scannez.");
    }
  };

  const handleStopScan = () => {
    setShowScanner(false);
  };

  return (
    <MainLayout>
      <div className="max-w-xl mx-auto p-4 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-900 dark:text-white">
          Scanner un Ticket d'Entrée
        </h1>

        {!showScanner ? (
          /* --- Étape 1 : Sélection de l'événement --- */
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow space-y-4 animate-fade-in">
            <label
              htmlFor="eventSelect"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {isAdmin
                ? "Pour quel événement validez-vous ce ticket ?"
                : "Choisissez l'événement à valider :"}
            </label>
            <select
              id="eventSelect"
              value={selectedEventName}
              onChange={(e) => setSelectedEventName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
            >
              <option value="" disabled>
                -- Sélectionner --
              </option>
              {/* Affiche la liste appropriée (tous les events pour l'admin, ses events pour l'orga) */}
              {eventListForSelector.map((event) => (
                <option key={event._id || event.id} value={event.name}>
                  {event.name} ({new Date(event.startDate).toLocaleDateString()}
                  )
                </option>
              ))}
            </select>
            <Button
              variant="primary"
              onClick={handleStartScan}
              disabled={!selectedEventName}
              className="w-full"
            >
              Démarrer le Scan pour "{selectedEventName || "..."}"
            </Button>
          </div>
        ) : (
          /* --- Étape 2 : Affichage du Scanner --- */
          <div className="animate-fade-in">
            <div className="text-center mb-4 p-3 bg-blue-50 dark:bg-blue-900/50 rounded-md border border-blue-200 dark:border-blue-700">
              <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Validation pour :{" "}
                <strong className="font-semibold">{selectedEventName}</strong>
              </p>
            </div>

            {/* Le composant scanner reçoit le nom de l'événement */}
            <QrScanner eventName={selectedEventName} />

            <Button
              variant="secondary"
              onClick={handleStopScan}
              className="w-full mt-6"
            >
              <ArrowLeft size={16} className="mr-2" /> Changer d'événement
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ScanQrPage;
