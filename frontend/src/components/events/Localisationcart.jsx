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
  // Valeur par défaut (Douala, Cameroun)
  const defaultCoords = { lat: 4.0511, lng: 9.7679 };
  const coords = location?.coords || defaultCoords;

  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 transition-colors duration-500">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
        📍 Localisation
      </h3>

      <div className="text-gray-700 dark:text-gray-300 mb-3">
        <p>
          <strong>Adresse :</strong> {location?.address || "Non spécifiée"}
        </p>
        <p>
          <strong>Ville :</strong> {location?.city || "Inconnue"}
        </p>
        <p>
          <strong>Pays :</strong> {location?.country || "Non précisé"}
        </p>
      </div>

      {/* Carte interactive */}
      <MapContainer
        center={[coords.lat, coords.lng]}
        zoom={13}
        style={{ height: "300px", width: "100%", borderRadius: "12px" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='© <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
        />
        <Marker position={[coords.lat, coords.lng]} icon={markerIcon}>
          <Popup>
            {location?.address
              ? `${location.address}, ${location.city}`
              : "Emplacement inconnu"}
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default LocalisationCart;
