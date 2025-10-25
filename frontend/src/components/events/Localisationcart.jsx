// src/components/events/Localisationcart.jsx
import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

// Icône personnalisée (corrige le bug d’icône manquante par défaut)
const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
  shadowSize: [41, 41],
});

const LocalisationCart = ({ location }) => {
  // Valeur par défaut (Douala, Cameroun) si aucune coordonnée n'est fournie
  const defaultCoords = { lat: 4.0511, lng: 9.7679 };
  const coords = location?.coords || defaultCoords;

  // --- CORRECTION : Construire l'adresse complète ---
  // Combine les différentes parties de l'adresse en une seule chaîne.
  // filter(Boolean) retire les parties vides (null, undefined, "").
  const fullAddress = [
    location?.address, // (Ex: "Bonapriso" ou le nom du lieu)
    location?.city, // (Ex: "Douala")
    location?.country, // (Ex: "Cameroun")
  ]
    .filter(Boolean)
    .join(", "); // Résultat : "Bonapriso, Douala, Cameroun"

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 transition-colors duration-500">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
        📍 Localisation
      </h3>

      {/* --- MODIFICATION : Affiche l'adresse complète unifiée --- */}
      <div className="text-gray-700 dark:text-gray-300 mb-4">
        <p>
          <strong className="font-medium">Adresse complète :</strong>
          <br />
          {fullAddress || "Non spécifiée"}
        </p>
        {/* Les champs séparés (Ville, Pays, Quartier) sont retirés pour éviter la redondance */}
      </div>

      {/* Carte interactive */}
      <MapContainer
        center={[coords.lat, coords.lng]}
        zoom={15} // Zoom un peu plus proche pour mieux voir
        style={{ height: "300px", width: "100%", borderRadius: "12px" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='© <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
        />
        <Marker position={[coords.lat, coords.lng]} icon={markerIcon}>
          {/* --- MODIFICATION : Utilise la même adresse complète dans le Popup --- */}
          <Popup>{fullAddress || "Emplacement de l'événement"}</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default LocalisationCart;
