import React from "react";
import { API_BASE_URL } from "../../slices/axiosInstance";
import { Calendar, MapPin, ArrowRight, Zap } from "lucide-react";

const STATIC_BASE_URL = API_BASE_URL.replace("/api", "");

const EventCard = ({ event, handleDetails }) => {
  const formatDate = (dateString) => {
    if (!dateString) return "?";
    try {
      const date = new Date(dateString);
      return {
        day: date.toLocaleDateString("fr-FR", { day: "numeric" }),
        month: date.toLocaleDateString("fr-FR", { month: "short" }).replace('.', ''),
        year: date.getFullYear()
      };
    } catch {
      return { day: "?", month: "?", year: "?" };
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    return `${STATIC_BASE_URL}/${imagePath}`;
  };

  const imageUrl = getImageUrl(event.imageUrl);
  const date = formatDate(event.startDate);

  return (
    <div
      onClick={handleDetails}
      className="group relative bg-white dark:bg-gray-800 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100 dark:border-gray-700/50 flex flex-col h-full"
    >
      {/* Image Section */}
      <div className="relative h-64 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={event.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black text-6xl">
            {event.name?.charAt(0).toUpperCase() || "?"}
          </div>
        )}
        
        {/* Date Badge Overlay */}
        <div className="absolute top-4 left-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-2xl p-2 min-w-[60px] text-center shadow-lg border border-white/20">
          <span className="block text-2xl font-black text-blue-600 leading-none">{date.day}</span>
          <span className="block text-[10px] font-black text-gray-500 dark:text-gray-400 tracking-widest">{date.month}</span>
        </div>

        {/* Price Tag Overlay */}
        <div className="absolute top-4 right-4">
          <span className={`px-4 py-2 rounded-full text-xs font-black tracking-widest shadow-lg backdrop-blur-md border border-white/20 ${
            event.price === 0 
              ? "bg-green-500/90 text-white" 
              : "bg-white/90 dark:bg-gray-900/90 text-gray-900 dark:text-white"
          }`}>
            {event.price === 0 ? "Gratuit" : `${event.price} FCFA`}
          </span>
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      </div>

      {/* Content Section */}
      <div className="p-5 md:p-8 flex flex-col flex-grow relative">
        {/* Category Tag */}
        <div className="flex items-center gap-2 mb-3 md:mb-4">
          <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[9px] md:text-[10px] font-black rounded-full tracking-widest">
            #{event.category?.name || "Événement"}
          </span>
          {event.qrOption && (
            <span className="flex items-center gap-1 text-[9px] md:text-[10px] font-black text-amber-500 tracking-widest">
              <Zap className="w-3 h-3 fill-current" /> QR Entry
            </span>
          )}
        </div>

        <h3 className="text-lg md:text-2xl font-black text-gray-900 dark:text-white mb-2 md:mb-3 leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">
          {event.name}
        </h3>

        <p className="text-gray-500 dark:text-gray-400 text-xs md:text-base line-clamp-2 mb-4 md:mb-6 font-medium leading-relaxed">
          {event.description}
        </p>

        {/* Footer Info */}
        <div className="mt-auto pt-4 md:pt-6 border-t border-gray-50 dark:border-gray-700/50 flex items-center justify-between">
          <div className="flex items-center text-gray-400 dark:text-gray-500 text-[10px] md:text-xs font-bold">
            <MapPin className="w-3.5 h-3.5 mr-1 text-blue-500" />
            <span className="truncate max-w-[100px] md:max-w-[150px]">{event.city}</span>
          </div>
          
          <div className="flex items-center gap-1 text-blue-600 font-black text-xs md:text-sm group/btn">
            Détails 
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-1" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
