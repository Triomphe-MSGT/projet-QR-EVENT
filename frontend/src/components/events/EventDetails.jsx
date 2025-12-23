import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../slices/axiosInstance";
import Button from "../ui/Button";
import ParticipationFormModal from "../../pages/participant/ParticipationFormModal";
import QrCodeDisplay from "../ui/QrCodeDisplay";
import LocalisationCart from "./Localisationcart";
import { useRegisterToEvent } from "../../hooks/useEvents";
import { useUserProfile } from "../../hooks/useUserProfile";
import {
  Loader2,
  AlertTriangle,
  Calendar,
  MapPin,
  Clock,
  Tag,
  CheckCircle,
  ArrowLeft,
  Share2,
  Zap,
  Users,
  Info,
  ShieldCheck
} from "lucide-react";

import { API_BASE_URL } from "../../slices/axiosInstance";
const STATIC_BASE_URL = API_BASE_URL.replace("/api", "");

const EventDetails = ({ event }) => {
  const navigate = useNavigate();
  const [coords, setCoords] = useState(null);
  const [loadingMap, setLoadingMap] = useState(true);
  const [errorMap, setErrorMap] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [qrCodeData, setQrCodeData] = useState(null);

  const { data: user } = useUserProfile();
  const registerMutation = useRegisterToEvent();

  const isAlreadyRegistered =
    user && event.participants?.some((p) => p === user.id || p._id === user.id);

  const canSeeParticipants = user && (
    user.role === 'Administrateur' || 
    user.id === (event.organizer?._id || event.organizer?.id || event.organizer)
  );

  useEffect(() => {
    const fetchCoords = async () => {
      setLoadingMap(true);
      setErrorMap("");

      const addressParts = [
        event.neighborhood,
        event.city,
        event.country,
      ];

      const fullAddress = addressParts.filter(Boolean).join(", ");

      if (!fullAddress) {
        setErrorMap("Adresse non spécifiée.");
        setLoadingMap(false);
        return;
      }

      try {
        const proxyRes = await api.get("/geocode", {
          params: { q: fullAddress },
        });

        if (proxyRes.data && proxyRes.data[0]?.geometry) {
          const [lng, lat] = proxyRes.data[0].geometry.coordinates;
          setCoords({ lat, lng });
        } else {
          throw new Error("Coordonnées introuvables.");
        }
      } catch (err) {
        console.error("❌ Geocoding failed:", err.message);
        setErrorMap("Impossible de localiser l'adresse.");
      } finally {
        setLoadingMap(false);
      }
    };

    if (event.city || event.neighborhood || event.country) {
      fetchCoords();
    } else {
      setLoadingMap(false);
      setErrorMap("Localisation non spécifiée.");
    }
  }, [event.city, event.neighborhood, event.country]);

  const handleParticipateSubmit = (formData) => {
    registerMutation.mutate(
      { eventId: event._id || event.id, formData },
      {
        onSuccess: (data) => {
          if (data.qrCode) {
            setQrCodeData(data.qrCode);
          }
          setIsModalOpen(false);
        },
        onError: (err) => {
          alert(`Erreur d'inscription: ${err.response?.data?.error || err.message}`);
        },
      }
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return { day: "?", month: "?", year: "?", full: "?" };
    const date = new Date(dateString);
    return {
      day: date.toLocaleDateString("fr-FR", { day: "numeric" }),
      month: date.toLocaleDateString("fr-FR", { month: "long" }),
      year: date.getFullYear(),
      full: date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    };
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    return `${STATIC_BASE_URL}/${imagePath}`;
  };

  const imageUrl = getImageUrl(event.imageUrl);
  const dateInfo = formatDate(event.startDate);

  return (
    <>
      <ParticipationFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleParticipateSubmit}
        eventName={event.name}
        isSubmitting={registerMutation.isPending}
        user={user}
      />
      
      <div className="min-h-screen bg-[#F0F2F5] dark:bg-gray-950 pb-20 font-sans">
        {/* Hero Section - Optimized for Desktop */}
        <div className="relative h-[40vh] md:h-[55vh] lg:h-[65vh] w-full overflow-hidden bg-gray-900">
          {imageUrl ? (
            <div className="absolute inset-0">
              <img
                src={imageUrl}
                alt={event.name}
                className="w-full h-full object-cover opacity-60 blur-[2px] scale-105"
              />
              <div className="absolute inset-0 bg-black/40"></div>
            </div>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-blue-700 to-indigo-900"></div>
          )}
          
          <div className="relative z-10 h-full max-w-7xl mx-auto px-4 flex flex-col justify-end pb-12 md:pb-20">
            {/* Navigation Overlay */}
            <div className="absolute top-6 left-4 right-4 flex justify-between items-center">
              <button 
                onClick={() => navigate(-1)}
                className="p-2.5 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-all border border-white/20 shadow-lg"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <button className="p-2.5 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-all border border-white/20 shadow-lg">
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
              <div className="max-w-4xl space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  {event.category && (
                    <span className="px-4 py-1.5 bg-blue-600 text-white text-[10px] font-black rounded-full shadow-lg">
                    {event.category.emoji} {event.category.name}
                  </span>
                  )}
                  <span className="px-4 py-1.5 bg-white/10 backdrop-blur-md text-white text-[10px] font-black rounded-full border border-white/10">
                  {event.price === 0 ? "Gratuit" : `${event.price} FCFA`}
                </span>
                {canSeeParticipants && (
                  <span className={`px-4 py-1.5 backdrop-blur-md text-white text-[10px] font-black rounded-full border border-white/10 ${event.visibility === 'private' ? 'bg-purple-600/50' : 'bg-green-600/50'}`}>
                    {event.visibility === 'private' ? 'Privé' : 'Public'}
                  </span>
                )}
                </div>
                
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight drop-shadow-2xl">
                {event.name}
              </h1>
                
                <div className="flex flex-wrap items-center gap-8 text-white/80 font-bold text-xs">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-400" />
                    <span>{dateInfo.full}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-400" />
                    <span>{event.city}, {event.neighborhood || "Cameroun"}</span>
                  </div>
                </div>
              </div>

              {/* Desktop Image Preview Card */}
              <div className="hidden lg:block w-80 h-48 rounded-2xl overflow-hidden border-4 border-white/20 shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-500">
                {imageUrl ? (
                  <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-blue-600 flex items-center justify-center text-white text-4xl font-black">
                    {event.name?.charAt(0)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="max-w-7xl mx-auto px-4 -mt-8 md:-mt-12 relative z-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            
            {/* Left Column: Details & Info */}
            <div className="lg:col-span-8 space-y-6">
              {/* About Section */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 md:p-10 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
                  <Info className="w-6 h-6 text-blue-600" />
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">À propos de l'événement</h2>
                </div>
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-[#1C1E21] dark:text-gray-300 text-base md:text-lg leading-relaxed whitespace-pre-wrap font-normal">
                    {event.description}
                  </p>
                </div>
                
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10 pt-8 border-t border-gray-100 dark:border-gray-700">
                  <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700">
                    <p className="text-[10px] font-black text-gray-400">Capacité</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">Illimitée</p>
                  </div>
                  {canSeeParticipants && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700">
                      <p className="text-[10px] font-black text-gray-400">Inscrits</p>
                      <p className="text-lg font-bold text-blue-600">{event.participants?.length || 0}</p>
                    </div>
                  )}
                  <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700">
                    <p className="text-[10px] font-black text-gray-400">Format</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{event.format || event.type || "Présentiel"}</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700">
                    <p className="text-[10px] font-black text-gray-400">Heure</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{event.time || "--:--"}</p>
                  </div>
                </div>
              </div>

              {/* Location Section */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 md:p-10 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
                  <MapPin className="w-6 h-6 text-blue-600" />
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Lieu de l'événement</h2>
                </div>
                
                <div className="relative h-72 md:h-96 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-inner">
                  {loadingMap ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
                      <Loader2 className="animate-spin h-8 w-8 text-blue-600 mb-2" />
                      <p className="text-gray-500 font-bold text-[10px]">Chargement de la carte...</p>
                    </div>
                  ) : errorMap ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50 dark:bg-red-900/10 p-6 text-center">
                      <AlertTriangle className="h-10 w-10 text-red-500 mb-3" />
                      <p className="text-red-600 font-semibold text-sm">{errorMap}</p>
                    </div>
                  ) : coords ? (
                    <LocalisationCart
                      location={{
                        address: event.neighborhood || event.city,
                        city: event.city,
                        country: event.country,
                        coords: coords,
                      }}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                      <p className="text-gray-500 font-bold text-[10px]">Carte non disponible</p>
                    </div>
                  )}
                </div>
                
                <div className="mt-6 flex items-center gap-4 p-5 bg-[#F0F2F5] dark:bg-gray-900/80 rounded-xl border border-gray-200 dark:border-gray-700">
                  <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-900 dark:text-white font-black tracking-tight">{event.city}</p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{event.neighborhood || "Quartier non spécifié"}, Cameroun</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Sidebar Actions */}
            <div className="lg:col-span-4 space-y-6">
              {/* Registration/Action Card */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 sticky top-24">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                    Billetterie & Accès
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-xs font-medium">
                    Réservez votre place en quelques secondes
                  </p>
                </div>

                <div className="space-y-5">
                  {/* QR Code or Success State */}
                  {qrCodeData ? (
                    <div className="flex flex-col items-center p-5 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800/50">
                      <div className="p-3 bg-white rounded-lg shadow-md mb-3">
                        <QrCodeDisplay value={qrCodeData} size={160} />
                      </div>
                      <p className="text-blue-600 dark:text-blue-400 font-black text-xs">Votre Billet QR est prêt</p>
                    </div>
                  ) : isAlreadyRegistered ? (
                    <div className="flex flex-col items-center p-6 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800/50 text-center">
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-md mb-3">
                        <CheckCircle className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="text-green-700 dark:text-green-400 font-black tracking-tight mb-1">Inscrit avec succès</h4>
                      <p className="text-green-600/70 dark:text-green-400/70 text-xs font-medium">Vous participez à cet événement</p>
                    </div>
                  ) : null}

                  {/* Action Button */}
                  {(() => {
                    const isExpired = (() => {
                      if (!event.startDate) return false;
                      const now = new Date();
                      const eventStart = new Date(event.startDate);
                      if (event.time) {
                        const [hours, minutes] = event.time.split(":");
                        eventStart.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                      } else {
                        eventStart.setHours(23, 59, 59, 999);
                      }
                      return now > eventStart;
                    })();

                    return (
                      <div className="space-y-4">
                        <Button
                          variant={isAlreadyRegistered || qrCodeData || isExpired ? "secondary" : "primary"}
                          size="lg"
                          onClick={() => {
                            if (!user) { navigate("/login"); return; }
                            if (!isAlreadyRegistered && !qrCodeData && !isExpired) {
                              setIsModalOpen(true);
                            }
                          }}
                          disabled={isAlreadyRegistered || !!qrCodeData || registerMutation.isPending || isExpired}
                          className={`w-full py-5 rounded-2xl text-lg font-black tracking-widest shadow-xl transition-all transform active:scale-95 ${
                            !isAlreadyRegistered && !qrCodeData && !isExpired 
                              ? "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20" 
                              : "bg-gray-100 dark:bg-gray-700 text-gray-400"
                          }`}
                        >
                          {registerMutation.isPending ? (
                            <Loader2 className="animate-spin w-5 h-5 mx-auto" />
                          ) : isAlreadyRegistered || qrCodeData ? (
                            "Voir mon billet"
                          ) : isExpired ? (
                            "Événement terminé"
                          ) : (
                            "Réserver ma place"
                          )}
                        </Button>

                        {isExpired && (
                          <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-800/50 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                            <p className="text-red-600 dark:text-red-400 text-xs font-black tracking-tight">Les inscriptions sont fermées</p>
                          </div>
                        )}

                          {!isExpired && !isAlreadyRegistered && !qrCodeData && (
                            <div className="flex items-center justify-center gap-2 text-gray-400">
                              <Users className="w-4 h-4" />
                              <span className="text-[10px] font-black">
                                {canSeeParticipants 
                                  ? `Rejoignez ${event.participants?.length || 0} participants` 
                                  : "Rejoignez l'événement"}
                              </span>
                            </div>
                          )}
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Organizer Card */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <p className="text-[10px] font-black text-gray-400 mb-4">Organisé par</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-lg font-bold text-blue-600 border border-blue-100 dark:border-blue-800/50">
                    {event.organizer?.name?.charAt(0) || "O"}
                  </div>
                  <div>
                    <h4 className="text-[#1C1E21] dark:text-white font-bold text-sm flex items-center gap-1">
                      {event.organizer?.name || "Organisateur"}
                      <ShieldCheck className="w-4 h-4 text-blue-500" />
                    </h4>
                    <p className="text-gray-500 dark:text-gray-400 text-[11px] font-medium">Organisateur vérifié</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fade-in-up 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
      `}</style>
    </>
  );
};

export default EventDetails;
