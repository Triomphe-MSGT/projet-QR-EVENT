import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../slices/axiosInstance";
import Button from "../../../components/ui/Button";
import ParticipationFormModal from "./ParticipationFormModal";
import QrCodeDisplay from "./QrCodeDisplay";
import LocalisationCart from "./Localisationcart";
import { useRegisterToEvent, useEvents } from "../../../hooks/useEvents";
import { useUserProfile } from "../../../hooks/useUserProfile";
import {
  Loader2,
  AlertTriangle,
  Calendar,
  MapPin,
  Share2,
  Users,
  Info,
  ShieldCheck,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";

import { API_BASE_URL } from "../../../slices/axiosInstance";
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

  const { data: allEvents } = useEvents();

  // Filter similar events based on category
  const similarEvents = useMemo(() => {
    if (!allEvents || !event.category) return [];
    const currentCategoryId =
      event.category._id || event.category.id || event.category;
    const currentEventId = event._id || event.id;

    return allEvents
      .filter((e) => {
        const eCategoryId = e.category?._id || e.category?.id || e.category;
        const eId = e._id || e.id;
        return eCategoryId === currentCategoryId && eId !== currentEventId;
      })
      .slice(0, 6);
  }, [allEvents, event]);

  const canSeeParticipants =
    user &&
    (user.role === "Administrateur" ||
      user.id ===
        (event.organizer?._id || event.organizer?.id || event.organizer));

  const organizerEventCount = useMemo(() => {
    if (!allEvents || !event.organizer) return 0;
    const organizerId =
      event.organizer._id || event.organizer.id || event.organizer;
    return allEvents.filter(
      (e) => (e.organizer?._id || e.organizer?.id || e.organizer) === organizerId
    ).length;
  }, [allEvents, event.organizer]);

  const isCertified = organizerEventCount >= 10;

  // Fetch coordinates for the map
  useEffect(() => {
    const fetchCoords = async () => {
      setLoadingMap(true);
      setErrorMap("");

      const addressParts = [event.neighborhood, event.city, event.country];
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
          alert(
            `Erreur d'inscription: ${
              err.response?.data?.error || err.message
            }`
          );
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
      full: date.toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    };
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    return `${STATIC_BASE_URL}/${imagePath}`;
  };

  const handleShare = async () => {
    const shareData = {
      title: event.name,
      text: event.description,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        alert("Lien de l'événement copié !");
      }
    } catch (err) {
      console.error("Erreur de partage:", err);
    }
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

      <div className="min-h-screen bg-slate-50 pb-32 md:pb-20 font-sans pt-28">
        {/* Hero Section */}
        <div className="relative h-[50vh] md:h-[60vh] lg:h-[70vh] w-full overflow-hidden bg-slate-900">
          {/* Static Navigation Buttons */}
          <div className="absolute top-6 left-0 right-0 z-[50] md:px-10 px-4 pointer-events-none">
            <div className="max-w-7xl mx-auto flex justify-between items-center w-full">
              <button
                onClick={() => navigate(-1)}
                className="p-3 bg-white/20 backdrop-blur-xl rounded-2xl text-white hover:bg-white hover:text-slate-900 transition-all border border-white/20 shadow-xl pointer-events-auto active:scale-90"
                title="Retour"
              >
                <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
              </button>
              <button
                onClick={handleShare}
                className="p-3 bg-white/20 backdrop-blur-xl rounded-2xl text-white hover:bg-white hover:text-slate-900 transition-all border border-white/20 shadow-xl pointer-events-auto active:scale-90"
                title="Partager"
              >
                <Share2 className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </div>
          </div>

          {imageUrl ? (
            <div className="absolute inset-0">
              <img
                src={imageUrl}
                alt={event.name}
                className="w-full h-full object-cover opacity-50 scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/30 to-transparent"></div>
            </div>
          ) : (
            <div className="absolute inset-0 bg-slate-800"></div>
          )}

          <div className="relative z-10 h-full max-w-7xl mx-auto px-4 flex flex-col justify-end pb-12 md:pb-24">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-10">
              <div className="max-w-4xl space-y-6">
                <div className="flex flex-wrap items-center gap-3">
                  {event.category && (
                    <span className="px-5 py-2 bg-white text-slate-900 text-xs font-bold uppercase rounded-xl shadow-md border border-slate-100">
                      {event.category.emoji} {event.category.name}
                    </span>
                  )}
                  <span className="px-5 py-2 bg-orange-500 text-white text-xs font-bold uppercase rounded-xl shadow-lg shadow-orange-500/20">
                    {event.price === 0 ? "Billet Gratuit" : `${event.price.toLocaleString()} FCFA`}
                  </span>
                </div>

                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-tight [text-wrap:balance]">
                  {event.name}
                </h1>

                <div className="flex flex-wrap items-center gap-10 text-white/90 font-bold text-sm md:text-base">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-6 h-6 text-orange-400" />
                    <span>{dateInfo.full}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-6 h-6 text-orange-400" />
                    <span>
                      {event.city}, {event.neighborhood || "Cameroun"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="max-w-7xl mx-auto px-4 -mt-12 md:-mt-20 relative z-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-14">
            {/* Left Column: Details & Info */}
            <div className="lg:col-span-8 space-y-10">
              {/* About Section */}
              <div className="bg-white rounded-[2.5rem] p-8 md:p-14 shadow-sm border border-slate-100">
                <div className="flex items-center gap-4 mb-10">
                  <div className="p-3 bg-slate-50 rounded-2xl">
                    <Info className="w-6 h-6 text-slate-900" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
                    Présentation de l'événement
                  </h2>
                </div>
                <div className="prose prose-lg max-w-none">
                  <p className="text-slate-800 text-lg md:text-xl leading-relaxed whitespace-pre-wrap font-book">
                    {event.description}
                  </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10 pt-8 border-t border-slate-100">
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center text-center">
                    <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase mb-1">
                      Capacité
                    </p>
                    <p className="text-xl font-bold text-slate-800">
                      Illimitée
                    </p>
                  </div>
                  {canSeeParticipants && (
                    <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100 flex flex-col items-center text-center">
                      <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase mb-1">
                        Inscrits
                      </p>
                      <p className="text-xl font-bold text-blue-600">
                        {event.participants?.length || 0}
                      </p>
                    </div>
                  )}
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center text-center">
                    <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase mb-1">
                      Format
                    </p>
                    <p className="text-xl font-bold text-slate-800">
                      {event.format || event.type || "Présentiel"}
                    </p>
                  </div>
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center text-center">
                    <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase mb-1">Heure</p>
                    <p className="text-xl font-bold text-slate-800">
                      {event.time || "--:--"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Location Section */}
              <div className="bg-white rounded-3xl p-6 md:p-10 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border border-slate-100">
                <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                  <div className="p-2 bg-orange-50 rounded-xl">
                    <MapPin className="w-5 h-5 text-orange-500" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">
                    Lieu de l'événement
                  </h2>
                </div>

                <div className="relative h-72 md:h-96 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-inner">
                  {loadingMap ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
                      <Loader2 className="animate-spin h-8 w-8 text-blue-600 mb-2" />
                      <p className="text-gray-500 font-bold text-[10px]">
                        Chargement de la carte...
                      </p>
                    </div>
                  ) : errorMap ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
                      <AlertTriangle className="h-10 w-10 text-slate-400 mb-3" />
                      <p className="text-slate-500 font-semibold text-sm">
                        {errorMap}
                      </p>
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
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
                      <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">
                        Carte non disponible
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex items-center gap-5 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="w-14 h-14 rounded-2xl bg-orange-500 flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/30">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-slate-800 font-bold text-lg tracking-tight">
                      {event.city}
                    </p>
                    <p className="text-slate-500 text-sm font-medium">
                      {event.neighborhood || "Quartier non spécifié"}, Cameroun
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Sidebar Actions */}
            <div className="lg:col-span-4 space-y-6">
              {/* Registration/Action Card */}
              <div className="bg-white rounded-3xl p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border border-slate-100 sticky top-24">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">
                    Billetterie & Accès
                  </h3>
                  <p className="text-slate-500 text-sm font-medium leading-relaxed">
                    Réservez votre place en quelques secondes
                  </p>
                </div>

                <div className="space-y-5">
                  {/* QR Code or Success State */}
                  {qrCodeData ? (
                    <div className="flex flex-col items-center p-6 bg-blue-50 rounded-2xl border border-blue-100">
                      <div className="p-3 bg-white rounded-xl shadow-sm mb-4">
                        <QrCodeDisplay value={qrCodeData} size={160} />
                      </div>
                      <p className="text-blue-600 font-black text-xs uppercase tracking-widest">
                        Votre Billet QR est prêt
                      </p>
                    </div>
                  ) : isAlreadyRegistered ? (
                    <div className="flex flex-col items-center p-6 bg-green-50 rounded-2xl border border-green-100 text-center">
                      <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30 mb-4">
                        <CheckCircle className="w-7 h-7 text-white" />
                      </div>
                      <h4 className="text-green-700 font-bold text-lg tracking-tight mb-1">
                        Inscrit avec succès
                      </h4>
                      <p className="text-green-600/80 text-sm font-medium">
                        Vous participez à cet événement
                      </p>
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
                        eventStart.setHours(
                          parseInt(hours),
                          parseInt(minutes),
                          0,
                          0
                        );
                      } else {
                        eventStart.setHours(23, 59, 59, 999);
                      }
                      return now > eventStart;
                    })();

                    return (
                      <div className="space-y-4">
                        <Button
                          variant={
                            isAlreadyRegistered || qrCodeData || isExpired
                              ? "secondary"
                              : "primary"
                          }
                          size="lg"
                          onClick={() => {
                            const token = localStorage.getItem("token");
                            if (!token) {
                              navigate("/login");
                              return;
                            }
                            if (
                              !isAlreadyRegistered &&
                              !qrCodeData &&
                              !isExpired
                            ) {
                              setIsModalOpen(true);
                            }
                          }}
                          disabled={
                            isAlreadyRegistered ||
                            !!qrCodeData ||
                            registerMutation.isPending ||
                            isExpired
                          }
                          className={`w-full py-5 rounded-2xl text-lg font-bold shadow-xl transition-all transform active:scale-95 ${
                            !isAlreadyRegistered && !qrCodeData && !isExpired
                              ? "bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/30"
                              : "bg-slate-100 text-slate-400"
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
                          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-slate-500" />
                            <p className="text-slate-600 text-xs font-bold uppercase tracking-widest">
                              Les inscriptions sont fermées
                            </p>
                          </div>
                        )}

                        {!isExpired && !isAlreadyRegistered && !qrCodeData && (
                          <div className="flex items-center justify-center gap-2 text-slate-400">
                            <Users className="w-4 h-4" />
                            <span className="text-[11px] font-bold">
                              {canSeeParticipants
                                ? `Rejoignez ${
                                    event.participants?.length || 0
                                  } participants`
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
              <div className="bg-white rounded-3xl p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 mb-5 uppercase tracking-widest">
                  Organisé par
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center text-xl font-black text-slate-600 border border-slate-100">
                    {event.organizer?.name?.charAt(0) || "O"}
                  </div>
                  <div>
                    <h4 className="text-slate-900 font-bold text-base flex items-center gap-1.5">
                      {event.organizer?.name || "Organisateur"}
                      {isCertified && (
                        <ShieldCheck className="w-5 h-5 text-blue-500" />
                      )}
                    </h4>
                    <div className="flex flex-col gap-0.5 mt-1">
                      <p className="text-slate-500 text-xs font-medium">
                        {isCertified
                          ? "Organisateur Certifié"
                          : "Organisateur Vérifié"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Events Section */}
        {similarEvents.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 mt-16 pb-12">
            <div className="flex items-center justify-between mb-8">
              <div className="space-y-2">
                <h2 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">
                  Événements similaires
                </h2>
                <p className="text-slate-500 text-base font-medium">
                  D'autres expériences qui pourraient vous plaire
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4 max-h-[600px] overflow-y-auto pr-2 no-scrollbar">
              {similarEvents.map((similarEvent) => (
                <div
                  key={similarEvent._id || similarEvent.id}
                  onClick={() => {
                    navigate(`/events/${similarEvent._id || similarEvent.id}`);
                    window.scrollTo(0, 0);
                  }}
                  className="flex gap-4 bg-white p-4 rounded-3xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border border-slate-100 active:scale-[0.98] transition-all cursor-pointer group hover:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1)] hover:-translate-y-1"
                >
                  <div className="w-28 h-28 rounded-2xl overflow-hidden shrink-0 shadow-inner relative">
                    {similarEvent.imageUrl ? (
                      <img
                        src={getImageUrl(similarEvent.imageUrl)}
                        alt={similarEvent.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
                        <span className="text-white font-black text-2xl uppercase">
                          {similarEvent.name?.charAt(0) || "?"}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col justify-between py-1 flex-1 min-w-0 pr-2">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between mb-1">
                        <span className="px-2 py-0.5 bg-orange-50 text-orange-600 text-[9px] font-black uppercase rounded-lg">
                          {similarEvent.category?.name || "Événement"}
                        </span>
                        <span className="text-[10px] font-black text-slate-800">
                          {similarEvent.price === 0
                            ? "GRATUIT"
                            : `${similarEvent.price} F`}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 line-clamp-1 tracking-tight group-hover:text-orange-500 transition-colors">
                        {similarEvent.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                        <MapPin className="w-3.5 h-3.5 text-orange-400" />
                        <span className="truncate">{similarEvent.city}</span>
                      </div>
                    </div>
                    <div className="flex items-center mt-2">
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Calendar className="w-3.5 h-3.5 text-blue-500" />
                        <span className="text-slate-600 font-bold text-[11px]">
                          {new Date(similarEvent.startDate).toLocaleDateString(
                            "fr-FR",
                            { day: "numeric", month: "long" }
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
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
