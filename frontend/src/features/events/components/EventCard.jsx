import React from "react";
import { useSelector } from "react-redux";
import { API_BASE_URL } from "../../../slices/axiosInstance";
import { Calendar, MapPin, ArrowRight, Zap, Heart, Share2, Clock } from "lucide-react";
import { useToggleLikeEvent } from "../../../hooks/useEvents";
import CategoryIcon from "../../../components/ui/CategoryIcon";

const STATIC_BASE_URL = API_BASE_URL.replace("/api", "");

/**
 * Composant EventCard : Affiche un résumé d'un événement sous forme de carte.
 * Utilisé dans les listes d'événements et les résultats de recherche.
 */
const EventCard = ({ event, handleDetails }) => {
  const { user } = useSelector((state) => state.auth);
  const toggleLikeMutation = useToggleLikeEvent();

  // État local du "like" basé sur les données de l'événement
  const isLiked = event.likes?.includes(user?.id || user?._id);

  /**
   * Formate la date pour l'affichage (Jour, Mois, Année)
   */
  const formatDate = (dateString) => {
    if (!dateString) return { day: "?", month: "?", year: "?" };
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
   * Construit l'URL complète de l'image
   */
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    return `${STATIC_BASE_URL}/${imagePath}`;
  };

  // --- Actions ---
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
        alert("Lien copié !");
      }
    } catch (err) {
      console.error("Partage échoué:", err);
    }
  };

  const imageUrl = getImageUrl(event.imageUrl || event.coverImage);
  const date = formatDate(event.startDate || event.date);

  return (
    <div
      onClick={handleDetails}
      className="group bg-white rounded-2xl md:rounded-3xl overflow-hidden border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] transition-all duration-500 hover:-translate-y-1.5 flex flex-col cursor-pointer h-full mx-auto w-full max-w-[280px] md:max-w-none"
    >
      {/* Zone Image / Media */}
      <div className="h-40 md:h-56 overflow-hidden relative bg-slate-50">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={event.name} 
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-300 font-black text-5xl">
            {event.name?.charAt(0).toUpperCase() || "?"}
          </div>
        )}
        
        {/* Badge Catégorie */}
        <div className="absolute top-4 left-4 px-3 py-1.5 bg-white/95 backdrop-blur-md rounded-xl text-[10px] font-black uppercase text-orange-600 shadow-sm border border-orange-50 flex items-center gap-2">
          <CategoryIcon iconName={event.category?.icon} emoji={event.category?.emoji} className="w-3 h-3" />
          {event.category?.name || "Event"}
        </div>
        
        {/* Boutons d'Interaction Rapide (Like/Share) */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-10 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
          <button
            onClick={handleLike}
            className={`p-2.5 rounded-xl backdrop-blur-md border shadow-lg transition-all active:scale-90 ${
              isLiked
                ? "bg-red-500 text-white border-red-500"
                : "bg-white/90 text-slate-600 border-white hover:text-red-500"
            }`}
          >
            <Heart size={16} className={isLiked ? "fill-current" : ""} />
          </button>
          <button
            onClick={handleShare}
            className="p-2.5 bg-white/90 backdrop-blur-md border border-white rounded-xl shadow-lg text-slate-600 hover:text-blue-600 transition-all active:scale-90"
          >
            <Share2 size={16} />
          </button>
        </div>
      </div>
      
      {/* Zone Infos Textuelles */}
      <div className="p-4 md:p-6 flex-1 flex flex-col justify-between">
        <div className="space-y-3 md:space-y-4">
          <h3 className="text-sm md:text-lg font-bold text-slate-500 line-clamp-2 leading-tight group-hover:text-orange-600 transition-colors">
            {event.name || event.title}
          </h3>
          
          <div className="space-y-2.5">
            <div className="flex items-center gap-3 text-xs md:text-sm font-medium text-slate-400">
              <Calendar size={14} className="text-orange-500 flex-shrink-0" />
              <span className="capitalize">{date.day} {date.month} {date.year}</span>
            </div>
            <div className="flex items-center gap-3 text-xs md:text-sm font-medium text-slate-400">
              <MapPin size={14} className="text-orange-500 flex-shrink-0" />
              <span className="truncate">{event.location || event.city || "Lieu à définir"}</span>
            </div>
          </div>
        </div>

        {/* Footer de la carte : Prix & CTA */}
        <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-50">
          <div className="flex flex-col">
            <span className="text-[8px] md:text-[10px] font-black text-slate-300 uppercase tracking-widest">À partir de</span>
            <span className="text-base md:text-lg font-black text-slate-500">
              {event.price > 0 ? `${event.price.toLocaleString()} F` : "Gratuit"}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-orange-600 font-black text-[10px] uppercase tracking-widest group-hover:gap-2.5 transition-all">
            Réserver
            <ArrowRight size={14} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
