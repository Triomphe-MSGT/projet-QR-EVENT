// src/pages/organizer/CreateEventPage.jsx (Gère la Création ET la Modification)

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCategories } from "../../services/categoryService"; // ✅ Vérifiez le chemin
// --- 1. Importer les hooks nécessaires ---
import {
  useCreateEvent,
  useUpdateEvent,
  useEventDetails,
} from "../../hooks/useEvents"; // ✅ Vérifiez le chemin
import MainLayout from "../../components/layouts/MainLayout";
import { useNavigate, useLocation } from "react-router-dom"; // <-- Importer useLocation
import { Loader2, AlertTriangle, Save, PlusCircle } from "lucide-react";
import Button from "../../components/ui/Button"; // ✅ Vérifiez le chemin

// --- Liste des villes (inchangée) ---
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
  const location = useLocation(); // Pour lire les paramètres de l'URL

  // --- 2. Détecter le Mode Édition ---
  const searchParams = new URLSearchParams(location.search);
  const eventIdToEdit = searchParams.get("edit"); // Récupère l'ID (ex: "60b8d...")
  const isEditMode = !!eventIdToEdit; // true si un ID est présent

  // --- 3. Charger les données de l'événement si on est en mode édition ---
  const {
    data: existingEventData,
    isLoading: isLoadingEventDetails, // Chargement des données à éditer
  } = useEventDetails(eventIdToEdit); // Le hook ne se lancera que si eventIdToEdit existe

  // État du formulaire
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
  });

  // Récupération des catégories (inchangé)
  const {
    data: categories,
    isLoading: isLoadingCategories,
    isError: isErrorCategories,
  } = useQuery({ queryKey: ["categories"], queryFn: getCategories });

  // Mutations pour Créer ou Mettre à jour
  const createEventMutation = useCreateEvent();
  const updateEventMutation = useUpdateEvent();

  // --- 4. Pré-remplir le formulaire en Mode Édition ---
  useEffect(() => {
    // Si on est en mode édition ET que les données ont été chargées
    if (isEditMode && existingEventData) {
      setFormData({
        name: existingEventData.name || "",
        type: existingEventData.type || "",
        // Formate AAAA-MM-JJ pour l'input type="date"
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
        // 'category' peut être un objet peuplé ou juste un ID
        category:
          existingEventData.category?.id || existingEventData.category || "", // ✅ Correction ici
        qrOption: existingEventData.qrOption || false,
        image: null, // L'image doit toujours être re-uploadée si on veut la changer
      });
    }
  }, [isEditMode, existingEventData]); // Se déclenche quand les données arrivent

  // Gestion des changements (inchangée)
  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? checked : type === "file" ? files[0] : value,
    }));
  };

  // --- 5. Soumission (gère les deux modes) ---
  const handleSubmit = (e) => {
    e.preventDefault();

    // --- ✅ CORRECTION : VALIDATION RENFORCÉE ---
    // Vérifie les champs obligatoires
    if (
      !formData.name ||
      !formData.startDate ||
      !formData.city ||
      !formData.category ||
      !formData.description
    ) {
      alert("Veuillez remplir tous les champs obligatoires (*)");
      return;
    }

    // Vérifie les longueurs minimales (correspondant au backend)
    if (formData.name.length < 3) {
      alert("Le nom de l'événement doit contenir au moins 3 caractères.");
      return;
    }
    if (formData.description.length < 10) {
      alert("La description doit contenir au moins 10 caractères.");
      return;
    }
    // --- FIN CORRECTION ---

    // Création de FormData
    const dataToSend = new FormData();
    Object.keys(formData).forEach((key) => {
      // Sécurité : Ne jamais envoyer un objet
      if (
        key === "category" &&
        typeof formData.category === "object" &&
        formData.category !== null
      ) {
        dataToSend.append("category", formData.category.id);
      } else if (key === "image" && formData.image) {
        // Ne joint l'image que si elle est nouvelle
        dataToSend.append("image", formData.image);
      } else if (key !== "image") {
        // Joint toutes les autres clés
        dataToSend.append(key, formData[key]);
      }
    });

    // Appelle la bonne mutation
    if (isEditMode) {
      // --- Logique de MISE À JOUR ---
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
      // --- Logique de CRÉATION ---
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

  // Combine les états de chargement
  const isLoading =
    isLoadingCategories || (isEditMode && isLoadingEventDetails);
  const isSubmitting =
    createEventMutation.isPending || updateEventMutation.isPending;

  // Affiche un loader si on charge les catégories ou les données de l'événement
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
        <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100 text-center">
          {isEditMode ? "Modifier l'Événement" : "Créer un Nouvel Événement 🚀"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nom */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Nom <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              minLength="3"
              className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {/* Catégorie */}
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium mb-1"
            >
              Catégorie <span className="text-red-500">*</span>
            </label>
            {isErrorCategories ? (
              <p className="text-red-500 text-sm">
                Erreur chargement catégories.
              </p>
            ) : (
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500"
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
              <label
                htmlFor="startDate"
                className="block text-sm font-medium mb-1"
              >
                Date de début <span className="text-red-500">*</span>
              </label>
              <input
                id="startDate"
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
                className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 dark:bg-gray-700"
              />
            </div>
            <div>
              <label
                htmlFor="endDate"
                className="block text-sm font-medium mb-1"
              >
                Date de fin <span className="text-gray-400">(Optionnel)</span>
              </label>
              <input
                id="endDate"
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                min={formData.startDate}
                disabled={!formData.startDate}
                className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 dark:bg-gray-700 disabled:opacity-50"
              />
            </div>
          </div>
          {/* Heure */}
          <div>
            <label htmlFor="time" className="block text-sm font-medium mb-1">
              Heure <span className="text-gray-400">(Optionnel)</span>
            </label>
            <input
              id="time"
              type="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 dark:bg-gray-700"
            />
          </div>
          {/* Localisation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="city" className="block text-sm font-medium mb-1">
                Ville <span className="text-red-500">*</span>
              </label>
              <select
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 dark:bg-gray-700"
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
              <label
                htmlFor="neighborhood"
                className="block text-sm font-medium mb-1"
              >
                Quartier <span className="text-gray-400">(Optionnel)</span>
              </label>
              <input
                id="neighborhood"
                type="text"
                name="neighborhood"
                value={formData.neighborhood}
                onChange={handleChange}
                className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 dark:bg-gray-700"
              />
            </div>
          </div>
          <div>
            <label htmlFor="country" className="block text-sm font-medium mb-1">
              Pays
            </label>
            <input
              id="country"
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 dark:bg-gray-700"
            />
          </div>
          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium mb-1"
            >
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="5"
              required
              minLength="10"
              className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 dark:bg-gray-700 resize-none"
            />
          </div>
          {/* Prix */}
          <div>
            <label htmlFor="price" className="block text-sm font-medium mb-1">
              Prix (FCFA)
            </label>
            <input
              id="price"
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              min="0"
              className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 dark:bg-gray-700"
            />
          </div>
          {/* Option QR */}
          <div className="flex items-center space-x-3 pt-2">
            <input
              id="qrOption"
              type="checkbox"
              name="qrOption"
              checked={formData.qrOption}
              onChange={handleChange}
              className="h-5 w-5 text-blue-600"
            />
            <label htmlFor="qrOption" className="text-sm cursor-pointer">
              Activer les QR codes pour l'accès
            </label>
          </div>
          {/* Image */}
          <div>
            <label htmlFor="image" className="block text-sm font-medium mb-1">
              Image de couverture{" "}
              <span className="text-gray-400">(Optionnel)</span>
            </label>
            <input
              id="image"
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
              className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:font-semibold file:bg-blue-50 dark:file:bg-gray-600 file:text-blue-600 dark:file:text-gray-200 hover:file:bg-blue-100 dark:hover:file:bg-gray-500"
            />
            {isEditMode && existingEventData?.imageUrl && !formData.image && (
              <p className="text-xs text-gray-500 mt-1">
                Image actuelle conservée. Choisissez un nouveau fichier pour la
                remplacer.
              </p>
            )}
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
