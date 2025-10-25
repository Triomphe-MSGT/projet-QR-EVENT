// src/components/events/EventDetails.jsx
import React, { useState, useEffect } from "react";
import axios from "axios"; // Gardé pour la géolocalisation via le proxy
import Button from "../ui/Button"; // ✅ Assurez-vous que le chemin est correct
import ParticipationFormModal from "../../pages/participant/ParticipationFormModal"; // ✅ Assurez-vous que le chemin est correct
import QrCodeDisplay from "../ui/QrCodeDisplay"; // ✅ Assurez-vous que le chemin est correct
import LocalisationCart from "./Localisationcart"; // ✅ Assurez-vous que le chemin est correct

// --- CORRECTION: Les hooks sont importés depuis leurs fichiers respectifs ---
import { useRegisterToEvent } from "../../hooks/useEvents";
import { useUserProfile } from "../../hooks/useUserProfile";

const EventDetails = ({ event }) => {
  const [coords, setCoords] = useState(null);
  const [loadingMap, setLoadingMap] = useState(true);
  const [errorMap, setErrorMap] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [qrCodeData, setQrCodeData] = useState(null);

  const { data: user } = useUserProfile();
  const registerMutation = useRegisterToEvent();

  // Vérifie si l'ID de l'utilisateur est dans la liste des participants
  const isAlreadyRegistered =
    user && event.participants?.some((p) => p === user.id || p._id === user.id);

  // --- CORRECTION: Géolocalisation via votre serveur proxy ---
  useEffect(() => {
    const fetchCoords = async () => {
      setLoadingMap(true);
      setErrorMap("");
      try {
        // On appelle votre serveur proxy qui tourne sur http://localhost:4000
        const proxyRes = await axios.get("http://localhost:4000/geocode", {
          params: {
            q: `${event.city}, Cameroun`, // Le proxy attend le paramètre 'q'
          },
        });

        // La réponse du proxy est un tableau, on prend le premier résultat
        if (proxyRes.data && proxyRes.data[0]?.geometry) {
          const [lng, lat] = proxyRes.data[0].geometry.coordinates;
          setCoords({ lat, lng });
        } else {
          throw new Error("Aucune coordonnée trouvée pour cette ville.");
        }
      } catch (err) {
        console.error("❌ Géolocalisation échouée via le proxy:", err.message);
        setErrorMap("Impossible de localiser cet endroit sur la carte.");
      } finally {
        setLoadingMap(false);
      }
    };
    if (event.city) fetchCoords();
  }, [event.city]); // Se déclenche uniquement si la ville de l'événement change

  // Soumission du formulaire d'inscription
  const handleParticipateSubmit = (formData) => {
    // Le hook s'occupe de la logique d'appel API
    registerMutation.mutate(
      { eventId: event.id, formData },
      {
        onSuccess: (data) => {
          if (data.qrCode) {
            setQrCodeData(data.qrCode); // Met à jour l'état avec le QR code reçu
          }
          setIsModalOpen(false); // Ferme la modale
        },
        onError: (err) => {
          // Affiche une alerte en cas d'échec
          alert(
            `Erreur d'inscription: ${err.response?.data?.error || err.message}`
          );
        },
      }
    );
  };

  // Fonctions utilitaires
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
        {/* En-tête avec image */}
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

        {/* Contenu principal */}
        <div className="p-6 space-y-8">
          {/* Description */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              À propos de l'événement
            </h2>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {event.description}
            </p>
          </section>

          {/* Détails (Date, Lieu, Prix) */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm border-t border-b border-gray-200 dark:border-gray-700 py-4">
            <div className="flex items-center text-gray-700 dark:text-gray-300">
              <svg
                className="w-5 h-5 mr-3 shrink-0 text-blue-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-medium">{formatDate(event.startDate)}</span>
            </div>
            <div className="flex items-center text-gray-700 dark:text-gray-300">
              <svg
                className="w-5 h-5 mr-3 shrink-0 text-blue-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-medium">{event.city}</span>
            </div>
            {event.time && (
              <div className="flex items-center text-gray-700 dark:text-gray-300">
                ⏰ <span className="ml-3 font-medium">{event.time}</span>
              </div>
            )}
            {event.price > 0 && (
              <div className="flex items-center text-gray-700 dark:text-gray-300 font-semibold">
                💰 <span className="ml-3">{event.price} FCFA</span>
              </div>
            )}
            {event.price === 0 && (
              <div className="flex items-center text-green-600 dark:text-green-400 font-semibold">
                ✅ <span className="ml-3">Gratuit</span>
              </div>
            )}
          </section>

          {/* Section Inscription & QR Code */}
          <section className="flex flex-col items-center pt-4">
            <div className="w-40 h-40 p-1 bg-white flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg mb-4">
              {qrCodeData ? (
                <QrCodeDisplay value={qrCodeData} size={150} />
              ) : isAlreadyRegistered ? (
                <div className="text-center p-4">
                  <svg
                    className="w-16 h-16 text-green-500 mx-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
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

          {/* Carte */}
          <section className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Localisation
            </h2>
            {loadingMap ? (
              <div className="h-64 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg">
                <p className="text-gray-500">Chargement de la carte...</p>
              </div>
            ) : errorMap ? (
              <div className="h-64 flex items-center justify-center bg-red-50 dark:bg-red-900/30 rounded-lg">
                <p className="text-red-500">{errorMap}</p>
              </div>
            ) : coords ? (
              <LocalisationCart
                location={{
                  address: event.city,
                  country: event.country,
                  neighborhood: event.neighborhood,
                  coords: coords,
                }}
              />
            ) : (
              <div className="h-64 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg">
                <p className="text-gray-500">
                  Localisation non disponible pour cet événement.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
};

export default EventDetails;
