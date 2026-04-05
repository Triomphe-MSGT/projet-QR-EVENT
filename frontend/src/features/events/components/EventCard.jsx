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

  return (    <div
      onClick={handleDetails}
      className="group bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-orange-200 hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer h-full"
    >
      <div className="h-44 md:h-52 overflow-hidden relative bg-slate-100">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={event.name} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400 font-bold text-4xl">
            {event.name?.charAt(0).toUpperCase() || "?"}
          </div>
        )}
        <div className="absolute top-3 left-3 px-3 py-1 bg-white/95 backdrop-blur-md rounded-lg text-[10px] font-bold uppercase text-slate-900 border border-slate-100 shadow-sm">
          {event.category?.name || "Événement"}
        </div>
        
        <div className="absolute top-3 right-3 flex flex-col gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleLike}
            className={`p-2 rounded-lg backdrop-blur-md border shadow-sm transition-all active:scale-90 ${
              isLiked
                ? "bg-red-500 text-white border-red-500"
                : "bg-white/90 text-slate-600 border-white hover:text-red-500"
            }`}
          >
            <Heart size={14} className={isLiked ? "fill-current" : ""} />
          </button>
          <button
            onClick={handleShare}
            className="p-2 bg-white/90 backdrop-blur-md border border-white rounded-lg shadow-sm text-slate-600 hover:text-blue-600 transition-all active:scale-90"
          >
            <Share2 size={14} />
          </button>
        </div>
      </div>
      
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div className="space-y-4">
          <h3 className="text-base md:text-lg font-bold text-slate-900 line-clamp-2 leading-tight group-hover:text-orange-600 transition-colors">
            {event.name}
          </h3>
          <div className="space-y-2.5">
            <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
              <Calendar size={14} className="text-orange-500 flex-shrink-0" />
              <span>{date.day} {date.month} {date.year}</span>
            </div>
            <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
              <MapPin size={14} className="text-orange-500 flex-shrink-0" />
              <span className="truncate">{event.location || event.city || "Lieu à confirmer"}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-5 mt-5 border-t border-slate-50">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">À partir de</span>
            <span className="text-lg font-bold text-slate-900">
              {event.price > 0 ? `${event.price.toLocaleString()} FCFA` : "Gratuit"}
            </span>
          </div>
          <div className="flex items-center gap-1 text-orange-600 font-bold text-xs uppercase tracking-wider">
            Réserver
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
