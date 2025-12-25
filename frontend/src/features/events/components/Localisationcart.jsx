import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { MapPin } from "lucide-react";

// Custom marker icon (fixes default missing icon bug)
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
  // Default coordinates (Douala, Cameroon) if none are provided
  const defaultCoords = { lat: 4.0511, lng: 9.7679 };
  const coords = location?.coords || defaultCoords;

  // --- Build the full address for display ---
  const fullAddress = [
    location?.address, // e.g., "Foto" or "Palais des Congrès"
    location?.city, // e.g., "Dschang"
    location?.country, // e.g., "Cameroun"
  ]
    .filter(Boolean) // Removes empty parts
    .join(", "); // Result: "Foto, Dschang, Cameroun"

  return (
    <div className="space-y-4">
      {/* Display the unified full address */}
      <div className="text-gray-700 dark:text-gray-300">
        <p className="text-lg font-medium flex items-center">
          <MapPin className="w-5 h-5 mr-2 text-gray-500 shrink-0" />
          {fullAddress || "Address not specified"}
        </p>
      </div>

      {/* Interactive Map */}
      <MapContainer
        center={[coords.lat, coords.lng]}
        zoom={15} // Zoom in a bit closer
        style={{
          height: "300px",
          width: "100%",
          borderRadius: "12px",
          zIndex: 0,
        }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='© <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
        />
        <Marker position={[coords.lat, coords.lng]} icon={markerIcon}>
          <Popup>{fullAddress || "Event Location"}</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default LocalisationCart;
