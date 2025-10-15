import React, { useEffect, useState } from "react";
import LocalisationCart from "./Localisationcart";
import Button from "../ui/Button";
import axios from "axios";

const EventDetails = ({ imageUrl, name, description, date, localisation }) => {
  const [coords, setCoords] = useState(null);
  const [loadingMap, setLoadingMap] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCoords = async () => {
      setLoadingMap(true);
      setError("");

      try {
        // 1️⃣ Essayer Nominatim via le proxy
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
          console.log("✅ Coordonnées via Nominatim :", lat, lon);
          return;
        }

        console.warn("⚠️ Nominatim n'a pas renvoyé de coordonnées valides");
        throw new Error("Coordonnées Nominatim invalides");
      } catch (err1) {
        console.warn("⚠️ Nominatim indisponible ou invalide :", err1.message);

        try {
          // 2️⃣ Fallback Geoapify
          const geoapifyKey = "9c75ef48a4494d958fbbb9e241db7bfc"; // 🔑 Remplace par ta clé Geoapify
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
            console.log("✅ Coordonnées via Geoapify :", lat, lng);
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

  return (
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
          className={`absolute inset-0 transition-colors duration-500
            bg-gradient-to-t
            ${imageUrl ? "from-black/50 to-transparent" : ""}
            dark:from-black/60 dark:to-black/30`}
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
        <p className="text-gray-600 dark:text-[#B0B3B8] mb-4">{description}</p>

        {/* Date */}
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

        {/* Localisation */}
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

        {/* QR Code */}
        <div className="flex flex-col items-center mb-6">
          <p className="text-gray-700 dark:text-[#E4E6EB] mb-2 font-medium">
            Obtenez votre QR code unique pour participer à l'événement
          </p>
          <div className="w-32 h-32 bg-gray-100 dark:bg-[#3A3B3C] flex items-center justify-center border border-gray-300 dark:border-[#3E4042] rounded-lg text-gray-500 dark:text-gray-300">
            QR Code
          </div>
        </div>

        {/* Bouton */}
        <div className="text-center mb-6">
          <Button variant="primaryLarge" size="md">
            Participer à l'événement
          </Button>
        </div>

        {/* 🗺️ Carte dynamique */}
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
                country: "cameroun",
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
  );
};

export default EventDetails;
