import React, { useEffect, useState } from "react";
import LocalisationCart from "./Localisationcart";
import Button from "../ui/Button";
import axios from "axios";
import ParticipationFormModal from "../../pages/participant/ParticipationFormModal";
import QrCodeDisplay from "../ui/QrCodeDisplay";

const EventDetails = ({ imageUrl, name, description, date, localisation }) => {
  const [coords, setCoords] = useState(null);
  const [loadingMap, setLoadingMap] = useState(true);
  const [error, setError] = useState("");

  // --- NOUVEAUX ÉTATS ---
  // Gère l'ouverture et la fermeture de la modale du formulaire
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Stocke les données du QR Code une fois généré
  const [qrCodeData, setQrCodeData] = useState(null);
  // Gère l'état de soumission
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchCoords = async () => {
      setLoadingMap(true);
      setError("");
      try {
        const nominatimRes = await axios.get("http://localhost:4000/geocode", {
          params: { q: localisation },
        });
        if (
          nominatimRes.data &&
          nominatimRes.data.length > 0 &&
          nominatimRes.data[0].lat &&
          nominatimRes.data[0].lon
        ) {
          const { lat, lon } = nominatimRes.data[0];
          setCoords({ lat: parseFloat(lat), lng: parseFloat(lon) });
          return;
        }
        throw new Error("Coordonnées Nominatim invalides");
      } catch {
        try {
          const geoapifyKey = "9c75ef48a4494d958fbbb9e241db7bfc";
          const geoRes = await axios.get(
            "https://api.geoapify.com/v1/geocode/search",
            {
              params: {
                text: localisation,
                apiKey: geoapifyKey,
                lang: "fr",
              },
            }
          );
          if (
            geoRes.data.features &&
            geoRes.data.features.length > 0 &&
            geoRes.data.features[0].geometry
          ) {
            const [lng, lat] = geoRes.data.features[0].geometry.coordinates;
            setCoords({ lat, lng });
          } else {
            throw new Error("Aucune donnée Geoapify");
          }
        } catch (err2) {
          console.error(
            "❌ Impossible d’obtenir les coordonnées :",
            err2.message
          );
          setError("Erreur de géolocalisation pour cette ville.");
        }
      } finally {
        setLoadingMap(false);
      }
    };

    if (localisation) fetchCoords();
  }, [localisation]);

  // --- NOUVELLE FONCTION ---
  // Gère la soumission du formulaire de participation
  const handleParticipateSubmit = (formData) => {
    setIsSubmitting(true);
    console.log("Données du formulaire reçues :", formData);

    // Simulation d'un appel API
    setTimeout(() => {
      const dataToEncode = {
        eventName: name,
        eventDate: date,
        participant: formData,
      };

      // Nous stockons les données du QR Code sous forme de chaîne JSON
      setQrCodeData(JSON.stringify(dataToEncode));

      // Ferme la modale et termine la soumission
      setIsModalOpen(false);
      setIsSubmitting(false);

      // Ici, vous ajouteriez l'appel pour envoyer l'email avec le QR Code
      // et la logique pour rediriger vers le profil utilisateur.
    }, 1000);
  };

  return (
    <>
      {/* Fenêtre Modale pour le formulaire */}
      <ParticipationFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleParticipateSubmit}
        eventName={name}
        isSubmitting={isSubmitting}
      />

      <div className="max-w-3xl mx-auto bg-white dark:bg-[#242526] rounded-2xl shadow-lg dark:shadow-none overflow-hidden transition-colors duration-500">
        {/* Image */}
        <div className="relative w-full h-72">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-blue-500 flex items-center justify-center text-white text-lg rounded-t-2xl">
              {name}
            </div>
          )}

          <div
            className={`absolute inset-0 transition-colors duration-500 bg-gradient-to-t ${
              imageUrl ? "from-black/50 to-transparent" : ""
            } dark:from-black/60 dark:to-black/30`}
          ></div>

          <div className="absolute inset-0 flex items-center justify-center p-4">
            <h1 className="text-4xl font-extrabold text-white text-center drop-shadow-md">
              {name}
            </h1>
          </div>
        </div>

        {/* Contenu */}
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-[#E4E6EB] mb-2">
            {name}
          </h2>
          <p className="text-gray-600 dark:text-[#B0B3B8] mb-4">
            {description}
          </p>

          {/* Date & Localisation */}
          <div className="flex items-center text-sm text-gray-500 dark:text-[#B0B3B8] mb-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-medium">{date}</span>
          </div>
          <div className="flex items-center text-sm text-gray-500 dark:text-[#B0B3B8] mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-medium">{localisation}</span>
          </div>

          {/* Section QR Code */}
          <div className="flex flex-col items-center mb-6">
            <p className="text-gray-700 dark:text-[#E4E6EB] mb-2 font-medium">
              {qrCodeData
                ? "Voici votre QR code de participation !"
                : "Obtenez votre QR code unique pour participer"}
            </p>
            <div className="w-40 h-40 p-2 bg-white flex items-center justify-center border border-gray-300 dark:border-[#3E4042] rounded-lg">
              {qrCodeData ? (
                <QrCodeDisplay value={qrCodeData} />
              ) : (
                <div className="text-center text-gray-500 dark:text-gray-300">
                  QR Code
                </div>
              )}
            </div>
          </div>

          {/* Bouton */}
          <div className="text-center mb-6">
            <Button
              variant="primaryLarge"
              size="md"
              onClick={() => setIsModalOpen(true)}
              disabled={!!qrCodeData} // Le bouton est désactivé si un QR code a déjà été généré
            >
              {qrCodeData
                ? "Participation confirmée"
                : "Participer à l'événement"}
            </Button>
          </div>

          {/* Carte dynamique */}
          <div className="mt-6">
            {loadingMap ? (
              <p className="text-center text-gray-500">
                Chargement de la carte...
              </p>
            ) : error ? (
              <p className="text-center text-red-500">{error}</p>
            ) : coords && !isNaN(coords.lat) && !isNaN(coords.lng) ? (
              <LocalisationCart
                location={{
                  address: localisation,
                  city: "Ville inconnue",
                  country: "Cameroun",
                  coords: coords,
                  mapUrl: `https://www.openstreetmap.org/?mlat=${coords.lat}&mlon=${coords.lng}#map=15/${coords.lat}/${coords.lng}`,
                }}
              />
            ) : (
              <p className="text-center text-gray-500">
                Localisation introuvable pour cette adresse.
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default EventDetails;
