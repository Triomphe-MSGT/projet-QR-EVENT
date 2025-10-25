import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCategories } from "../../services/categoryService";
import {
  useCreateEvent,
  useUpdateEvent,
  useEventDetails,
} from "../../hooks/useEvents";
import MainLayout from "../../components/layouts/MainLayout";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader2, Save, PlusCircle } from "lucide-react";
import Button from "../../components/ui/Button";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Icône du marqueur
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

// Sous-composant : clic sur la carte → met à jour lat/lng
const LocationMarker = ({ onSelect }) => {
  useMapEvents({
    click(e) {
      onSelect(e.latlng);
    },
  });
  return null;
};

// Liste des villes
const cameroonianCities = [
  "Yaoundé",
  "Douala",
  "Garoua",
  "Bamenda",
  "Maroua",
  "Bafoussam",
  "Ngaoundéré",
  "Bertoua",
  "Ebolowa",
  "Buea",
  "Kumba",
  "Nkongsamba",
  "Limbe",
  "Edéa",
  "Kribi",
  "Dschang",
  "Foumban",
  "Mbouda",
  "Sangmélima",
  "Bafang",
  "Bafia",
  "Kousséri",
  "Guider",
  "Meiganga",
  "Yagoua",
  "Tiko",
  "Mbalmayo",
  "Kumbo",
  "Wum",
  "Akonolinga",
  "Eséka",
  "Mamfé",
  "Obala",
].sort();

const EventForm = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const eventIdToEdit = searchParams.get("edit");
  const isEditMode = !!eventIdToEdit;

  const { data: existingEventData, isLoading: isLoadingEventDetails } =
    useEventDetails(eventIdToEdit);

  const [formData, setFormData] = useState({
    name: "",
    type: "",
    startDate: "",
    endDate: "",
    time: "",
    city: "",
    neighborhood: "",
    country: "Cameroun",
    description: "",
    price: "0",
    category: "",
    qrOption: false,
    image: null,
    latitude: 4.0511, // Douala par défaut
    longitude: 9.7679,
  });

  const {
    data: categories,
    isLoading: isLoadingCategories,
    isError: isErrorCategories,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const createEventMutation = useCreateEvent();
  const updateEventMutation = useUpdateEvent();

  useEffect(() => {
    if (isEditMode && existingEventData) {
      setFormData({
        name: existingEventData.name || "",
        type: existingEventData.type || "",
        startDate: existingEventData.startDate
          ? new Date(existingEventData.startDate).toISOString().split("T")[0]
          : "",
        endDate: existingEventData.endDate
          ? new Date(existingEventData.endDate).toISOString().split("T")[0]
          : "",
        time: existingEventData.time || "",
        city: existingEventData.city || "",
        neighborhood: existingEventData.neighborhood || "",
        country: existingEventData.country || "Cameroun",
        description: existingEventData.description || "",
        price: existingEventData.price?.toString() || "0",
        category:
          existingEventData.category?._id || existingEventData.category || "",
        qrOption: existingEventData.qrOption || false,
        image: null,
        latitude: existingEventData.latitude || 4.0511,
        longitude: existingEventData.longitude || 9.7679,
      });
    }
  }, [isEditMode, existingEventData]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? checked : type === "file" ? files[0] : value,
    }));
  };

  const handleMapClick = (latlng) => {
    setFormData((prev) => ({
      ...prev,
      latitude: latlng.lat,
      longitude: latlng.lng,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.startDate ||
      !formData.city ||
      !formData.category
    ) {
      alert("Veuillez remplir tous les champs obligatoires (*)");
      return;
    }

    const dataToSend = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key === "image" && formData.image) {
        dataToSend.append("image", formData.image);
      } else if (key !== "image") {
        dataToSend.append(key, formData[key]);
      }
    });

    if (isEditMode) {
      updateEventMutation.mutate(
        { id: eventIdToEdit, formData: dataToSend },
        {
          onSuccess: (updatedEvent) => {
            alert("Événement mis à jour avec succès !");
            navigate(`/events/${updatedEvent.id}`);
          },
          onError: (error) =>
            alert(`Erreur: ${error.response?.data?.error || error.message}`),
        }
      );
    } else {
      createEventMutation.mutate(dataToSend, {
        onSuccess: (createdEvent) => {
          alert("Événement créé avec succès !");
          navigate(`/events/${createdEvent.id}`);
        },
        onError: (error) =>
          alert(`Erreur: ${error.response?.data?.error || error.message}`),
      });
    }
  };

  const isLoading =
    isLoadingCategories || (isEditMode && isLoadingEventDetails);
  const isSubmitting =
    createEventMutation.isPending || updateEventMutation.isPending;

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto my-8 p-6 sm:p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-900 dark:text-gray-100">
          {isEditMode ? "Modifier l'Événement" : "Créer un Nouvel Événement 🚀"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nom */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Nom <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700"
            />
          </div>

          {/* Catégorie */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Catégorie <span className="text-red-500">*</span>
            </label>
            {isErrorCategories ? (
              <p className="text-red-500 text-sm">
                Erreur chargement catégories.
              </p>
            ) : (
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700"
              >
                <option value="" disabled>
                  -- Sélectionner --
                </option>
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.emoji} {cat.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Date de début <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
                className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Date de fin
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                min={formData.startDate}
                className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700"
              />
            </div>
          </div>

          {/* Heure */}
          <div>
            <label className="block text-sm font-medium mb-1">Heure</label>
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700"
            />
          </div>

          {/* Localisation */}
          <div>
            <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200 mb-2">
              📍 Localisation
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Ville <span className="text-red-500">*</span>
                </label>
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700"
                >
                  <option value="" disabled>
                    -- Sélectionner --
                  </option>
                  {cameroonianCities.map((ville) => (
                    <option key={ville} value={ville}>
                      {ville}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Quartier
                </label>
                <input
                  type="text"
                  name="neighborhood"
                  value={formData.neighborhood}
                  onChange={handleChange}
                  placeholder="Ex: Tchitchap"
                  className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700"
                />
              </div>
            </div>

            {/* Carte interactive */}
            <MapContainer
              center={[formData.latitude, formData.longitude]}
              zoom={13}
              style={{ height: "300px", width: "100%", borderRadius: "12px" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='© <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
              />
              <LocationMarker onSelect={handleMapClick} />
              <Marker
                position={[formData.latitude, formData.longitude]}
                icon={markerIcon}
              >
                <Popup>Emplacement de l'événement</Popup>
              </Marker>
            </MapContainer>

            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              <p>Latitude : {formData.latitude.toFixed(6)}</p>
              <p>Longitude : {formData.longitude.toFixed(6)}</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              required
              className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700"
            ></textarea>
          </div>

          {/* Prix */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Prix (FCFA)
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              min="0"
              className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700"
            />
          </div>

          {/* QR Option */}
          <div className="flex items-center space-x-3 pt-2">
            <input
              type="checkbox"
              name="qrOption"
              checked={formData.qrOption}
              onChange={handleChange}
              className="h-5 w-5 text-blue-600"
            />
            <label className="text-sm cursor-pointer">
              Activer les QR codes pour l'accès
            </label>
          </div>

          {/* Image */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Image de couverture
            </label>
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
              className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:font-semibold file:bg-blue-50 dark:file:bg-gray-600 file:text-blue-600 dark:file:text-gray-200 hover:file:bg-blue-100"
            />
          </div>

          {/* Bouton de soumission */}
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading || isSubmitting}
            className="w-full py-3 text-lg"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : isEditMode ? (
              <Save className="w-5 h-5 mr-2" />
            ) : (
              <PlusCircle className="w-5 h-5 mr-2" />
            )}
            {isSubmitting
              ? "Enregistrement..."
              : isEditMode
              ? "Enregistrer les modifications"
              : "Créer l'événement"}
          </Button>
        </form>
      </div>
    </MainLayout>
  );
};

export default EventForm;
