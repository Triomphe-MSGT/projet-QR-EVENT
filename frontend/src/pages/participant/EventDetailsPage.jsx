import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import EventDetails from "../../components/events/EventDetails";
import MainLayout from "../../components/layouts/MainLayout";
import { getEventById } from "../../services/eventService";

const EventDetailsPage = () => {
  const { id } = useParams();

  const {
    data: event,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["event", id],
    queryFn: () => getEventById(id),
    staleTime: 1000 * 60 * 5, // 5 minutes de cache, c'est parfait
  });

  if (isLoading)
    return (
      <MainLayout>
        <p className="text-center py-10 text-gray-500">
          Chargement de l'événement...
        </p>
      </MainLayout>
    );

  if (isError)
    return (
      <MainLayout>
        <p className="text-center py-10 text-red-500">
          Erreur lors du chargement de l'événement.
        </p>
      </MainLayout>
    );

  if (!event)
    return (
      <MainLayout>
        <div className="text-center py-10 text-gray-500">
          Aucun événement trouvé.
        </div>
      </MainLayout>
    );

  // ✅ On passe l'objet 'event' entier directement.
  // C'est plus propre et plus robuste.
  return (
    <MainLayout>
      <EventDetails event={event} />
    </MainLayout>
  );
};

export default EventDetailsPage;
