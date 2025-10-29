import React, { useState, useEffect } from "react";
import axios from "axios"; // For geocoding via proxy
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
        // 2. Send the full address to the geocoding proxy
        console.log(`[Geocoding] Searching for: "${fullAddress}"`);
        const proxyRes = await axios.get("http://localhost:4000/geocode", {
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
      { eventId: event.id, formData },
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
    return `http://localhost:3001/${imagePath}`;
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
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        {/* Header with image */}
        <div className="relative w-full h-60 md:h-80">
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
                ? "from-black/70 via-black/30 to-transparent"
                : "from-black/40 to-transparent"
            }`}
          ></div>
          <div className="absolute bottom-0 left-0 p-6">
            <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
              {event.name}
            </h1>
            {event.category && (
              <span className="mt-1 inline-block px-3 py-1 text-xs font-semibold text-white bg-black/40 rounded-full">
                {event.category.emoji} {event.category.name}
              </span>
            )}
          </div>
        </div>

        {/* Main content */}
        <div className="p-6 space-y-8">
          {/* About section */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              À propos de l'événement
            </h2>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {event.description}
            </p>
          </section>

          {/* Details (Date, Location, Price) */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm border-t border-b border-gray-200 dark:border-gray-700 py-4">
            <div className="flex items-center text-gray-700 dark:text-gray-300">
              <Calendar className="w-5 h-5 mr-3 shrink-0 text-blue-500" />
              <span className="font-medium">{formatDate(event.startDate)}</span>
            </div>
            <div className="flex items-center text-gray-700 dark:text-gray-300">
              <MapPin className="w-5 h-5 mr-3 shrink-0 text-blue-500" />
              <span className="font-medium">{event.city}</span>
            </div>
            {event.time && (
              <div className="flex items-center text-gray-700 dark:text-gray-300">
                <Clock className="w-5 h-5 mr-3 shrink-0 text-blue-500" />
                <span className="font-medium">{event.time}</span>
              </div>
            )}
            <div className="flex items-center text-gray-700 dark:text-gray-300 font-semibold">
              <Tag className="w-5 h-5 mr-3 shrink-0 text-blue-500" />
              <span>{event.price > 0 ? `${event.price} FCFA` : "Gratuit"}</span>
            </div>
          </section>

          {/* Registration & QR Code section */}
          <section className="flex flex-col items-center pt-4">
            <div className="w-40 h-40 p-1 bg-white flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg mb-4">
              {qrCodeData ? (
                <QrCodeDisplay value={qrCodeData} size={150} />
              ) : isAlreadyRegistered ? (
                <div className="text-center p-4">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                  <p className="mt-2 font-semibold text-green-600">
                    Déjà Inscrit
                  </p>
                </div>
              ) : (
                <div className="text-center text-gray-400 dark:text-gray-500 text-sm p-4">
                  Votre QR code apparaîtra ici après inscription
                </div>
              )}
            </div>
            <Button
              variant={
                isAlreadyRegistered || qrCodeData ? "secondary" : "primary"
              }
              size="lg"
              onClick={() =>
                !isAlreadyRegistered && !qrCodeData && setIsModalOpen(true)
              }
              disabled={
                isAlreadyRegistered ||
                !!qrCodeData ||
                registerMutation.isPending
              }
              className="w-full max-w-xs"
            >
              {registerMutation.isPending
                ? "Traitement..."
                : isAlreadyRegistered || qrCodeData
                ? "Participation Confirmée"
                : "Participer & Obtenir le QR Code"}
            </Button>
            {registerMutation.error && (
              <p className="text-red-500 text-sm mt-2">
                Erreur:{" "}
                {registerMutation.error.response?.data?.error ||
                  registerMutation.error.message}
              </p>
            )}
          </section>

          {/* Map section */}
          <section className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Localisation
            </h2>
            {loadingMap ? (
              <div className="h-64 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg">
                <Loader2 className="animate-spin h-6 w-6 text-gray-500" />
                <p className="ml-2 text-gray-500">Chargement de la carte...</p>
              </div>
            ) : errorMap ? (
              <div className="h-64 flex items-center justify-center bg-red-50 dark:bg-red-900/30 rounded-lg p-4">
                <AlertTriangle className="h-6 w-6 text-red-500 mr-2" />
                <p className="text-red-500">{errorMap}</p>
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
              <div className="h-64 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg">
                <p className="text-gray-500">Localisation non disponible.</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
};

export default EventDetails;
