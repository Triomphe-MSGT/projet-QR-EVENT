import { useNavigate } from "react-router-dom";
import EventCard from "./EventCard";

const EventListWithPagination = ({
  currentEvents,
  currentPage,
  totalPages,
  setCurrentPage,
}) => {
  const navigate = useNavigate();

  const handleDetails = (id) => {
    navigate(`/events/${id}`);
  };

  return (
    <div className="transition-colors duration-500">
      {/* Titre */}
      <h2 className="text-2xl font-bold text-[#050505] dark:text-[#E4E6EB] mb-4">
        Liste des Événements
      </h2>

      {/* Liste d'événements */}
      <div className="space-y-4">
        {currentEvents && currentEvents.length > 0 ? (
          currentEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              handleDetails={() => handleDetails(event.id)}
            />
          ))
        ) : (
          <p className="text-center text-[#65676B] dark:text-[#B0B3B8]">
            Aucun événement trouvé.
          </p>
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center mt-6 space-x-2">
        {/* Bouton Précédent */}
        <button
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
          className="
            px-4 py-2 rounded-lg font-medium
            bg-[#E4E6EB] dark:bg-[#3A3B3C] 
            text-[#050505] dark:text-[#E4E6EB]
            hover:bg-[#D8DADF] dark:hover:bg-[#4E4F50]
            disabled:opacity-50
            transition-colors duration-300
          "
        >
          Précédent
        </button>

        {/* Numéros de page */}
        <span className="flex space-x-1">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors duration-300 ${
                currentPage === i + 1
                  ? "bg-[#0866FF] text-white shadow-md"
                  : "bg-[#E4E6EB] dark:bg-[#3A3B3C] text-[#050505] dark:text-[#E4E6EB] hover:bg-[#D8DADF] dark:hover:bg-[#4E4F50]"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </span>

        {/* Bouton Suivant */}
        <button
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="
            px-4 py-2 rounded-lg font-medium
            bg-[#E4E6EB] dark:bg-[#3A3B3C] 
            text-[#050505] dark:text-[#E4E6EB]
            hover:bg-[#D8DADF] dark:hover:bg-[#4E4F50]
            disabled:opacity-50
            transition-colors duration-300
          "
        >
          Suivant
        </button>
      </div>
    </div>
  );
};

export default EventListWithPagination;
