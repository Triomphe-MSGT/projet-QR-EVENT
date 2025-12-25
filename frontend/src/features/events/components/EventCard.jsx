import React from "react";
import { useSelector } from "react-redux";
import { API_BASE_URL } from "../../../slices/axiosInstance";
import { Calendar, MapPin, ArrowRight, Zap, Heart, Share2 } from "lucide-react";
import { useToggleLikeEvent } from "../../../hooks/useEvents";

const STATIC_BASE_URL = API_BASE_URL.replace("/api", "");

const EventCard = ({ event, handleDetails }) => {
  const { user } = useSelector((state) => state.auth);
  const toggleLikeMutation = useToggleLikeEvent();

  const isLiked = event.likes?.includes(user?.id || user?._id);
  const likesCount = event.likes?.length || 0;

  /**
   * Formats a date string into day, month, and year.
   * @param {string} dateString 
   * @returns {object} { day, month, year }
   */
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

  /**
   * Helper to get the full image URL.
   * @param {string} imagePath 
   * @returns {string|null}
   */
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    return `${STATIC_BASE_URL}/${imagePath}`;
  };

  const handleLike = (e) => {
    e.stopPropagation();
    if (!user) return;
    toggleLikeMutation.mutate(event.id || event._id);
  };

  const handleShare = async (e) => {
    e.stopPropagation();
    const shareData = {
      title: event.name,
      text: event.description,
      url: `${window.location.origin}/events/${event.id || event._id}`,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        alert("Lien copié dans le presse-papier !");
      }
    } catch (err) {
      console.error("Erreur de partage:", err);
    }
  };

  const imageUrl = getImageUrl(event.imageUrl);
  const date = formatDate(event.startDate);

  return (
    <div
      onClick={handleDetails}
      className="group relative bg-white dark:bg-gray-800 rounded-3xl md:rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 md:hover:-translate-y-2 border border-gray-100 dark:border-gray-700/50 flex flex-col h-full cursor-pointer"
    >
      {/* Image Section */}
      <div className="relative h-48 md:h-64 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={event.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black text-5xl md:text-6xl">
            {event.name?.charAt(0).toUpperCase() || "?"}
          </div>
        )}
        
        {/* Action Buttons Overlay */}
        <div className="absolute top-3 md:top-4 right-3 md:right-4 flex flex-col gap-2 z-10">
          <button
            onClick={handleLike}
            className={`p-2 md:p-2.5 rounded-xl md:rounded-2xl backdrop-blur-md border border-white/20 shadow-lg transition-all active:scale-90 ${
              isLiked
                ? "bg-red-500 text-white border-red-400"
                : "bg-white/90 dark:bg-gray-900/90 text-gray-600 dark:text-gray-400 hover:text-red-500"
            }`}
          >
            <Heart size={16} className={isLiked ? "fill-current" : ""} />
          </button>
          <button
            onClick={handleShare}
            className="p-2 md:p-2.5 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border border-white/20 rounded-xl md:rounded-2xl shadow-lg text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-all active:scale-90"
          >
            <Share2 size={16} />
          </button>
        </div>

        {/* Date Badge Overlay */}
        <div className="absolute top-3 md:top-4 left-3 md:left-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-xl md:rounded-2xl p-1.5 md:p-2 min-w-[50px] md:min-w-[60px] text-center shadow-lg border border-white/20">
          <span className="block text-xl md:text-2xl font-black text-blue-600 leading-none">{date.day}</span>
          <span className="block text-[8px] md:text-[10px] font-black text-gray-500 dark:text-gray-400 tracking-widest uppercase">{date.month}</span>
        </div>

        {/* Price Tag Overlay */}
        <div className="absolute bottom-3 md:bottom-4 left-3 md:left-4">
          <span className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full text-[8px] md:text-[10px] font-black tracking-widest shadow-lg backdrop-blur-md border border-white/20 ${
            event.price === 0 
              ? "bg-green-500/90 text-white" 
              : "bg-white/90 dark:bg-gray-900/90 text-gray-900 dark:text-white"
          }`}>
            {event.price === 0 ? "GRATUIT" : `${event.price} FCFA`}
          </span>
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      </div>

      {/* Content Section */}
      <div className="p-4 md:p-8 flex flex-col flex-grow relative">
        {/* Category Tag & Likes */}
        <div className="flex items-center justify-between mb-2 md:mb-4">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 md:px-2.5 md:py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[8px] md:text-[10px] font-black rounded-full tracking-widest uppercase">
              #{event.category?.name || "Événement"}
            </span>
            {event.qrOption && (
              <span className="flex items-center gap-1 text-[8px] md:text-[10px] font-black text-amber-500 tracking-widest uppercase">
                <Zap className="w-2.5 h-2.5 fill-current" /> QR
              </span>
            )}
          </div>
          {likesCount > 0 && (
            <div className="flex items-center gap-1 text-[9px] md:text-[10px] font-bold text-gray-400">
              <Heart size={8} className="fill-red-500 text-red-500" />
              {likesCount}
            </div>
          )}
        </div>

        <h3 className="text-base md:text-2xl font-black text-gray-900 dark:text-white mb-1 md:mb-3 leading-tight group-hover:text-blue-600 transition-colors line-clamp-2 tracking-tight">
          {event.name}
        </h3>

        <p className="text-gray-500 dark:text-gray-400 text-[10px] md:text-base line-clamp-2 mb-3 md:mb-6 font-medium leading-relaxed">
          {event.description}
        </p>

        {/* Footer Info */}
        <div className="mt-auto pt-3 md:pt-6 border-t border-gray-50 dark:border-gray-700/50 flex items-center justify-between">
          <div className="flex items-center text-gray-400 dark:text-gray-500 text-[9px] md:text-xs font-bold">
            <MapPin className="w-3 h-3 md:w-3.5 md:h-3.5 mr-1 text-blue-500" />
            <span className="truncate max-w-[80px] md:max-w-[150px]">{event.city}</span>
          </div>
          
          <div className="flex items-center gap-1 text-blue-600 font-black text-[10px] md:text-sm group/btn uppercase tracking-widest">
            Détails 
            <ArrowRight className="w-3 h-3 md:w-3.5 md:h-3.5 transition-transform group-hover/btn:translate-x-1" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
