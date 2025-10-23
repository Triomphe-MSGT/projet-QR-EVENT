// src/pages/participant/EventDetailsPage.jsx
import React from "react";
import { useParams } from "react-router-dom"; // Pour lire l'ID depuis l'URL
import MainLayout from "../../components/layouts/MainLayout";
import EventDetails from "../../components/events/EventDetails"; // Le composant d'affichage
import { useEventDetails } from "../../hooks/useEvents"; // Le bon hook pour un seul événement

/**
 * Page "Conteneur" : son seul rôle est de charger les données
 * pour UN SEUL événement et de les passer au composant d'affichage.
 */
const EventDetailsPage = () => {
  // 1. Récupère l'ID depuis l'URL (ex: /events/123)
  const { id } = useParams();

  // 2. Utilise le hook `useEventDetails` avec cet ID pour charger les données
  const { data: event, isLoading, isError, error } = useEventDetails(id);

  return (
    <MainLayout>
      <div className="p-4 md:p-6 max-w-4xl mx-auto">
        {/* Affiche un message de chargement */}
        {isLoading && (
          <div className="text-center py-10 text-gray-500 dark:text-gray-400">
            Chargement de l'événement...
          </div>
        )}

        {/* Affiche un message d'erreur */}
        {isError && (
          <div className="text-center py-10 text-red-500">
            Erreur : {error?.message || "Impossible de charger cet événement."}
          </div>
        )}

        {/* 3. Si les données sont chargées, les passe au composant d'affichage */}
        {event && <EventDetails event={event} />}
      </div>
    </MainLayout>
  );
};

export default EventDetailsPage;
