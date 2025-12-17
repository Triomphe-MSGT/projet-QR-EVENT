// src/components/events/EventList.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import EventCard from "./EventCard";

const EventList = ({
  currentEvents,
  currentPage,
  totalPages,
  setCurrentPage,
}) => {
  const navigate = useNavigate();
  const handleDetails = (id) => navigate(`/events/${id}`);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
        Événements à venir
      </h2>
      {currentEvents?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
          {currentEvents.map((event) => (
            <EventCard
              key={event._id || event.id}
              event={event}
              handleDetails={() => handleDetails(event._id || event.id)}
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 dark:text-gray-400 py-8">
          Aucun événement trouvé pour ces critères.
        </p>
      )}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-8 space-x-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-lg font-medium bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 transition"
          >
            Précédent
          </button>
          <span className="text-gray-600 dark:text-gray-400">
            Page {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-lg font-medium bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 transition"
          >
            Suivant
          </button>
        </div>
      )}
    </div>
  );
};

export default EventList;
