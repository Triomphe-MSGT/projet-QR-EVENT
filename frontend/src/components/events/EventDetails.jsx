import React, { useState, useEffect } from "react";
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
} from "lucide-react";

import { API_BASE_URL } from "../../slices/axiosInstance";
const STATIC_BASE_URL = API_BASE_URL.replace("/api", "");

const EventDetails = ({ event }) => {
  const [coords, setCoords] = useState(null);
  const [loadingMap, setLoadingMap] = useState(true);
  const [errorMap, setErrorMap] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [qrCodeData, setQrCodeData] = useState(null);

  const { data: user } = useUserProfile();
  const registerMutation = useRegisterToEvent();

  const isAlreadyRegistered =
    user && event.participants?.some((p) => p === user.id || p._id === user.id);

  // --- Geocoding Logic (Corrected) ---
  useEffect(() => {
    const fetchCoords = async () => {
      setLoadingMap(true);
      setErrorMap("");

      // 1. Build the full address from event data
      const addressParts = [
        event.neighborhood, // e.g., "Foto"
        event.city, // e.g., "Dschang"
        event.country, // e.g., "Cameroun"
      ];

      const fullAddress = addressParts.filter(Boolean).join(", ");

      if (!fullAddress) {
        setErrorMap("No address specified for this event.");
        setLoadingMap(false);
        return;
      }

      try {
        const proxyRes = await api.get("/geocode", {
          params: { q: fullAddress },
        });

        // 3. Get coordinates from the response
        if (proxyRes.data && proxyRes.data[0]?.geometry) {
          const [lng, lat] = proxyRes.data[0].geometry.coordinates;
          setCoords({ lat, lng });
        } else {
          throw new Error("No coordinates found for this address.");
        }
      } catch (err) {
        console.error("❌ Geocoding failed via proxy:", err.message);
        setErrorMap("Could not locate this address on the map.");
      } finally {
        setLoadingMap(false);
      }
    };

    if (event.city || event.neighborhood || event.country) {
      fetchCoords();
    } else {
      setLoadingMap(false);
      setErrorMap("Location not specified.");
    }
  }, [event.city, event.neighborhood, event.country]); // Re-run if any location part changes

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
            `Registration Error: ${err.response?.data?.error || err.message}`
          );
        },
      }
    );
  };

  const formatDate = (dateString) =>
    dateString
      ? new Date(dateString).toLocaleDateString("fr-FR", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "?";
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    return `${STATIC_BASE_URL}/${imagePath}`;
  };
  const imageUrl = getImageUrl(event.imageUrl);

  return (
    <>
      <ParticipationFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleParticipateSubmit}
        eventName={event.name}
        isSubmitting={registerMutation.isPending}
      />
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden animate-fade-in-up">
        {/* Header with image */}
        <div className="relative w-full h-64 md:h-96">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={event.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-5xl font-bold">
              {event.name?.charAt(0)}
            </div>
          )}
          <div
            className={`absolute inset-0 bg-gradient-to-t ${
              imageUrl
                ? "from-black/80 via-black/40 to-transparent"
                : "from-black/50 to-transparent"
            }`}
          ></div>
          <div className="absolute bottom-0 left-0 p-6 md:p-10 w-full">
            <div className="max-w-7xl mx-auto">
              {event.category && (
                <span className="inline-block px-3 py-1 text-xs font-semibold text-white bg-blue-600 rounded-full mb-3 shadow-sm">
                  {event.category.emoji} {event.category.name}
                </span>
              )}
              <h1 className="text-3xl md:text-5xl font-bold text-white drop-shadow-lg leading-tight mb-2">
                {event.name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-white/90 text-sm md:text-base font-medium">
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  {formatDate(event.startDate)}
                </div>
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  {event.city}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content Split Layout */}
        <div className="max-w-7xl mx-auto p-6 md:p-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left Column: Description & Map */}
          <div className="lg:col-span-2 space-y-10">
            {/* About section */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
                À propos de l'événement
              </h2>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed text-lg">
                {event.description}
              </p>
            </section>

            {/* Map section */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
                Localisation
              </h2>
              {loadingMap ? (
                <div className="h-80 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-xl">
                  <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
                  <p className="ml-2 text-gray-500">Chargement de la carte...</p>
                </div>
              ) : errorMap ? (
                <div className="h-80 flex items-center justify-center bg-red-50 dark:bg-red-900/30 rounded-xl p-4 border border-red-200 dark:border-red-800">
                  <AlertTriangle className="h-6 w-6 text-red-500 mr-2" />
                  <p className="text-red-500">{errorMap}</p>
                </div>
              ) : coords ? (
                <div className="rounded-xl overflow-hidden shadow-md border border-gray-200 dark:border-gray-700 h-80">
                  <LocalisationCart
                    location={{
                      address: event.neighborhood || event.city,
                      city: event.city,
                      country: event.country,
                      coords: coords,
                    }}
                  />
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-xl">
                  <p className="text-gray-500">Localisation non disponible.</p>
                </div>
              )}
            </section>
          </div>

          {/* Right Column: Sidebar (Details & Booking) */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Event Details Card */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 border border-gray-200 dark:border-gray-600 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                  Détails
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <Calendar className="w-5 h-5 mr-3 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Date</p>
                      <p className="text-gray-900 dark:text-gray-200">{formatDate(event.startDate)}</p>
                    </div>
                  </div>
                  {event.time && (
                    <div className="flex items-start">
                      <Clock className="w-5 h-5 mr-3 text-blue-600 dark:text-blue-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Heure</p>
                        <p className="text-gray-900 dark:text-gray-200">{event.time}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start">
                    <MapPin className="w-5 h-5 mr-3 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Lieu</p>
                      <p className="text-gray-900 dark:text-gray-200">{event.city}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{event.neighborhood}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Tag className="w-5 h-5 mr-3 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Prix</p>
                      <p className={`font-bold ${event.price === 0 ? "text-green-600" : "text-gray-900 dark:text-gray-200"}`}>
                        {event.price > 0 ? `${event.price} FCFA` : "Gratuit"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Booking Card */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 text-center">
                  Inscription
                </h3>
                
                <div className="flex flex-col items-center">
                  {qrCodeData ? (
                    <div className="mb-4 p-2 bg-white rounded-lg border border-gray-200 shadow-inner">
                       <QrCodeDisplay value={qrCodeData} size={160} />
                       <p className="text-center text-xs text-gray-500 mt-2 font-medium">Votre billet d'entrée</p>
                    </div>
                  ) : isAlreadyRegistered ? (
                    <div className="text-center p-4 mb-4 bg-green-50 dark:bg-green-900/20 rounded-lg w-full">
                      <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                      <p className="font-bold text-green-700 dark:text-green-400">
                        Vous participez !
                      </p>
                    </div>
                  ) : null}

                  {(() => {
                    const isExpired = event.startDate && new Date() > new Date(event.startDate);
                    
                    return (
                      <>
                        <Button
                          variant={
                            isAlreadyRegistered || qrCodeData || isExpired ? "secondary" : "primary"
                          }
                          size="lg"
                          onClick={() =>
                            !isAlreadyRegistered && !qrCodeData && !isExpired && setIsModalOpen(true)
                          }
                          disabled={
                            isAlreadyRegistered ||
                            !!qrCodeData ||
                            registerMutation.isPending ||
                            isExpired
                          }
                          className="w-full py-4 text-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
                        >
                          {registerMutation.isPending
                            ? "Traitement..."
                            : isAlreadyRegistered || qrCodeData
                            ? "Voir mon Billet"
                            : isExpired
                            ? "Inscriptions Fermées"
                            : "Réserver ma place"}
                        </Button>
                        
                        {isExpired && (
                          <p className="text-red-500 font-semibold mt-3 text-center text-sm">
                            Cet événement est passé.
                          </p>
                        )}
                        {!isExpired && !isAlreadyRegistered && !qrCodeData && (
                           <p className="text-center text-xs text-gray-500 mt-3">
                             Places limitées. Réservez vite !
                           </p>
                        )}
                      </>
                    );
                  })()}

                  {registerMutation.error && (
                    <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg w-full text-center">
                      {registerMutation.error.response?.data?.error ||
                        registerMutation.error.message}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EventDetails;
