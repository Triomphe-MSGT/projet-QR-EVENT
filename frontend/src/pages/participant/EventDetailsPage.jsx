import React from "react";
import { useParams } from "react-router-dom";
import MainLayout from "../../components/layouts/MainLayout";
import EventDetails from "../../components/events/EventDetails";
import { useEventDetails } from "../../hooks/useEvents";

const EventDetailsPage = () => {
  const { id } = useParams();

  const { data: event, isLoading, isError, error } = useEventDetails(id);

  return (
    <MainLayout>
      <div className="p-4 md:p-6 max-w-4xl mx-auto">
        {isLoading && (
          <div className="text-center py-10 text-gray-500 dark:text-gray-400">
            Chargement de l'événement...
          </div>
        )}

        {isError && (
          <div className="text-center py-10 text-red-500">
            Erreur : {error?.message || "Impossible de charger cet événement."}
          </div>
        )}

        {event && <EventDetails event={event} />}
      </div>
    </MainLayout>
  );
};

export default EventDetailsPage;
