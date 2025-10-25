// src/components/events/EventCard.jsx
import React from "react";
import Button from "../ui/Button"; // ✅ Vérifiez ce chemin

const EventCard = ({ event, handleDetails }) => {
  const formatDate = (dateString) => {
    if (!dateString) return "?";
    try {
      return new Date(dateString).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
      });
    } catch {
      return "Date invalide";
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    return `http://localhost:3001/${imagePath}`; // URL vers votre backend
  };

  const imageUrl = getImageUrl(event.imageUrl);

  return (
    <div
      onClick={handleDetails}
      className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md cursor-pointer transition duration-300 hover:shadow-lg hover:scale-[1.02]"
    >
      <div className="flex flex-col sm:flex-row items-center gap-4">
        {/* Image / Initiale */}
        <div className="flex-shrink-0 w-full sm:w-24 h-32 sm:h-24 rounded-lg overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-3xl mb-3 sm:mb-0">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={event.name}
              className="w-full h-full object-cover"
            />
          ) : (
            event.name?.charAt(0).toUpperCase() || "?"
          )}
        </div>
        {/* Détails */}
        <div className="flex-grow text-center sm:text-left">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {event.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
            {event.description}
          </p>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-2 flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1">
            <span className="flex items-center">
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              {formatDate(event.startDate)}
            </span>
            <span className="flex items-center">
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              {event.city}
              {event.country ? `, ${event.country}` : ""}
              {event.neiborhood ? ` - ${event.neighborhood}` : ""}
            </span>
            {event.price > 0 && (
              <span className="flex items-center font-medium text-blue-600 dark:text-blue-400">
                💰 {event.price} FCFA
              </span>
            )}
            {event.price === 0 && (
              <span className="flex items-center font-medium text-green-600 dark:text-green-400">
                ✅ Gratuit
              </span>
            )}
          </div>
        </div>
        {/* Bouton visible seulement sur mobile/tablette */}
        <div className="w-full sm:hidden mt-3">
          <Button
            variant="primary"
            size="sm"
            onClick={handleDetails}
            className="w-full"
          >
            Voir Détails
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
