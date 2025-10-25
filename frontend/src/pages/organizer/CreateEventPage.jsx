// src/pages/organizer/CreateEventPage.jsx (ou EventForm.jsx)

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCategories } from "../../services/categoryService"; // Assurez-vous que ce chemin est correct
import { useCreateEvent } from "../../hooks/useEvents"; // Votre hook existant
import MainLayout from "../../components/layouts/MainLayout"; // Assurez-vous que ce chemin est correct
import { useNavigate } from "react-router-dom";
import { Loader2, AlertTriangle } from "lucide-react"; // Pour un feedback visuel

// --- Liste des villes du Cameroun ---
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
  // Ajoutez d'autres villes si nécessaire
].sort(); // Tri alphabétique pour la liste déroulante

const EventForm = () => {
  const navigate = useNavigate();

  // État du formulaire avec les nouveaux champs
  const [formData, setFormData] = useState({
    name: "",
    type: "", // Optionnel
    startDate: "",
    endDate: "", // Nouveau
    time: "",
    city: "",
    neighborhood: "", // Nouveau
    description: "",
    price: "0",
    category: "",
    qrOption: false,
    image: null,
  });

  // Récupération des catégories
  const {
    data: categories,
    isLoading: isLoadingCategories,
    isError: isErrorCategories,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  // Mutation pour créer l'événement
  const createEventMutation = useCreateEvent();

  // Gestion des changements du formulaire
  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? checked : type === "file" ? files[0] : value,
    }));
  };

  // Gestion de la soumission du formulaire
  const handleSubmit = (e) => {
    e.preventDefault();

    // Vérifications frontend
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

    if (
      formData.endDate &&
      formData.startDate &&
      new Date(formData.endDate) < new Date(formData.startDate)
    ) {
      alert("La date de fin ne peut pas être antérieure à la date de début.");
      return;
    }

    // Création de FormData pour l'envoi
    const dataToSend = new FormData();
    dataToSend.append("name", formData.name);
    dataToSend.append("startDate", formData.startDate);
    dataToSend.append("city", formData.city);
    dataToSend.append("description", formData.description);
    dataToSend.append("category", formData.category);
    dataToSend.append("qrOption", formData.qrOption);
    dataToSend.append("price", formData.price || "0");

    // Ajout des champs optionnels
    if (formData.type) dataToSend.append("type", formData.type);
    if (formData.endDate) dataToSend.append("endDate", formData.endDate);
    if (formData.time) dataToSend.append("time", formData.time);
    if (formData.neighborhood)
      dataToSend.append("neighborhood", formData.neighborhood);
    if (formData.image) dataToSend.append("image", formData.image);

    // Appel de la mutation
    createEventMutation.mutate(dataToSend, {
      onSuccess: (createdEvent) => {
        alert("Événement créé avec succès !");
        // Réinitialisation (optionnelle, selon votre UX)
        // setFormData({ name: "", type: "", startDate: "", endDate: "", time: "", city: "", neighborhood: "", description: "", price: "0", category: "", qrOption: false, image: null });
        navigate(`/events/${createdEvent.id}`); // Redirection vers la page de l'événement créé
      },
      onError: (error) => {
        alert(
          `Erreur lors de la création: ${
            error.response?.data?.error || error.message
          }`
        );
      },
    });
  };

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto my-8 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
        <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100 text-center">
          Créer un Nouvel Événement 🚀
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nom de l'événement */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
            >
              Nom de l'événement <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              name="name"
              placeholder="Ex: Conférence Tech Innovante"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>

          {/* Catégorie */}
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
            >
              Catégorie <span className="text-red-500">*</span>
            </label>
            {isLoadingCategories ? (
              <div className="flex items-center text-gray-500 dark:text-gray-400">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Chargement des
                catégories...
              </div>
            ) : isErrorCategories ? (
              <div className="flex items-center text-red-500">
                <AlertTriangle className="w-4 h-4 mr-2" /> Erreur de chargement
                des catégories.
              </div>
            ) : (
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition appearance-none"
              >
                <option value="" disabled>
                  -- Sélectionner une catégorie --
                </option>
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.emoji} {cat.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Type (Optionnel) */}
          {/* <div>
            <label
              htmlFor="type"
              className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
            >
              Type spécifique (Optionnel)
            </label>
            <input
              id="type"
              type="text"
              name="type"
              placeholder="Ex: Conférence Tech, Atelier Créatif..."
              value={formData.type}
              onChange={handleChange}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div> */}

          {/* Dates Début et Fin */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="startDate"
                className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
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
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
            </div>
            <div>
              <label
                htmlFor="endDate"
                className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
              >
                Date de fin (Optionnel)
              </label>
              <input
                id="endDate"
                type="date"
                name="endDate" // Nouveau champ
                value={formData.endDate}
                onChange={handleChange}
                min={formData.startDate} // Date de fin >= Date de début
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition disabled:opacity-50"
                disabled={!formData.startDate} // Désactivé si pas de date de début
              />
            </div>
          </div>

          {/* Heure */}
          <div>
            <label
              htmlFor="time"
              className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
            >
              Heure de début (Optionnel)
            </label>
            <input
              id="time"
              type="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>

          {/* Ville (Dropdown) et Quartier */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="city"
                className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
              >
                Ville <span className="text-red-500">*</span>
              </label>
              <select
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition appearance-none"
              >
                <option value="" disabled>
                  -- Sélectionner une ville --
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
                className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
              >
                Quartier / Lieu précis (Optionnel)
              </label>
              <input
                id="neighborhood"
                type="text"
                name="neighborhood" // Nouveau champ
                placeholder="Ex: Bonapriso, Palais des Congrès..."
                value={formData.neighborhood}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
            >
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              placeholder="Décrivez en détail votre événement..."
              value={formData.description}
              onChange={handleChange}
              rows="5"
              required
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition resize-none"
            />
          </div>

          {/* Prix */}
          <div>
            <label
              htmlFor="price"
              className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
            >
              Prix du billet (en FCFA, laissez 0 si gratuit)
            </label>
            <input
              id="price"
              type="number"
              name="price"
              placeholder="0"
              value={formData.price}
              onChange={handleChange}
              min="0"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>

          {/* Option QR Code */}
          <div className="flex items-center space-x-3 pt-2">
            <input
              id="qrOption"
              type="checkbox"
              name="qrOption"
              checked={formData.qrOption}
              onChange={handleChange}
              className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded cursor-pointer"
            />
            <label
              htmlFor="qrOption"
              className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
            >
              Activer les QR codes pour l'accès des participants (recommandé)
            </label>
          </div>

          {/* Image */}
          <div>
            <label
              htmlFor="image"
              className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
            >
              Image de couverture (Optionnel)
            </label>
            <input
              id="image"
              type="file"
              name="image"
              accept="image/png, image/jpeg, image/webp"
              onChange={handleChange}
              className="w-full text-sm text-gray-700 dark:text-gray-300
                         file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0
                         file:text-sm file:font-semibold
                         file:bg-blue-50 dark:file:bg-gray-600 file:text-blue-600 dark:file:text-gray-200
                         hover:file:bg-blue-100 dark:hover:file:bg-gray-500 transition cursor-pointer"
            />
            {formData.image && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Fichier sélectionné : {formData.image.name}
              </p>
            )}
          </div>

          {/* Bouton de soumission */}
          <button
            type="submit"
            disabled={createEventMutation.isPending || isLoadingCategories}
            className={`w-full py-3 mt-4 rounded-lg font-semibold text-lg transition-all duration-300 ease-in-out flex items-center justify-center
                       ${
                         createEventMutation.isPending || isLoadingCategories
                           ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                           : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                       }`}
          >
            {createEventMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Création en
                cours...
              </>
            ) : (
              "Créer l'événement ✨"
            )}
          </button>
        </form>
      </div>
    </MainLayout>
  );
};

export default EventForm;
