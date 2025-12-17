// src/components/events/EventCard.jsx
import React from "react";
import Button from "../ui/Button"; // ✅ Vérifiez ce chemin
import { API_BASE_URL } from "../../slices/axiosInstance";
const STATIC_BASE_URL = API_BASE_URL.replace("/api", "");

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
    return `${STATIC_BASE_URL}/${imagePath}`; // URL vers votre backend
  };

  const imageUrl = getImageUrl(event.imageUrl);

  return (
    <div
      onClick={handleDetails}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-md cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col h-full group border border-gray-100 dark:border-gray-700"
    >
      {/* Image Container */}
      <div className="relative w-full h-48 overflow-hidden rounded-t-xl bg-gray-200 dark:bg-gray-700">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={event.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-4xl">
            {event.name?.charAt(0).toUpperCase() || "?"}
          </div>
        )}
        {event.price === 0 && (
          <span className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
            Gratuit
          </span>
        )}
        {event.price > 0 && (
          <span className="absolute top-3 right-3 bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm backdrop-blur-sm">
            {event.price} FCFA
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            {formatDate(event.startDate)}
          </span>
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {event.name}
        </h3>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4 flex-grow">
          {event.description}
        </p>

        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
          <svg
            className="w-4 h-4 mr-1.5 text-gray-400"
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
          <span className="truncate">
            {event.city}
            {event.neighborhood ? `, ${event.neighborhood}` : ""}
          </span>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
