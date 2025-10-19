import React, { useState } from "react";
import Button from "../../components/ui/Button";

const ParticipationFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  eventName,
  isSubmitting,
}) => {
  // État local pour gérer les champs du formulaire
  const [formData, setFormData] = useState({
    fullName: "",
    profession: "",
    email: "",
    gender: "",
    notify: true,
  });

  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  // Gère les changements dans les champs de saisie
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Effacer l'erreur quand l'utilisateur commence à corriger
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Valide le formulaire avant la soumission
  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim())
      newErrors.fullName = "Le nom complet est requis.";
    if (!formData.profession.trim())
      newErrors.profession = "Le métier est requis.";
    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "L'adresse email est invalide.";
    }
    if (!formData.gender)
      newErrors.gender = "Veuillez sélectionner votre sexe.";

    setErrors(newErrors);
    // Retourne true si pas d'erreurs
    return Object.keys(newErrors).length === 0;
  };

  // Gère la soumission du formulaire
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    // Superposition (overlay)
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 transition-opacity duration-300">
      {/* Contenu de la modale */}
      <div className="bg-white dark:bg-[#242526] rounded-2xl shadow-xl w-full max-w-lg mx-auto transform transition-transform duration-300 scale-100">
        {/* En-tête */}
        <div className="p-5 border-b border-gray-200 dark:border-gray-700 text-center">
          <h2 className="text-xl font-bold text-gray-800 dark:text-[#E4E6EB]">
            Inscription à l'événement
          </h2>
          <p className="text-sm text-gray-500 dark:text-[#B0B3B8] mt-1">
            {eventName}
          </p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="p-6 space-y-4">
            {/* Nom complet */}
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-gray-700 dark:text-[#B0B3B8]"
              >
                Nom complet
              </label>
              <input
                type="text"
                name="fullName"
                id="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 dark:bg-[#3A3B3C] dark:border-gray-600 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
              {errors.fullName && (
                <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
              )}
            </div>

            {/* Métier */}
            <div>
              <label
                htmlFor="profession"
                className="block text-sm font-medium text-gray-700 dark:text-[#B0B3B8]"
              >
                Métier
              </label>
              <input
                type="text"
                name="profession"
                id="profession"
                value={formData.profession}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 dark:bg-[#3A3B3C] dark:border-gray-600 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
              {errors.profession && (
                <p className="text-red-500 text-xs mt-1">{errors.profession}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-[#B0B3B8]"
              >
                Email
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 dark:bg-[#3A3B3C] dark:border-gray-600 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* Sexe */}
            <div>
              <label
                htmlFor="gender"
                className="block text-sm font-medium text-gray-700 dark:text-[#B0B3B8]"
              >
                Sexe
              </label>
              <select
                name="gender"
                id="gender"
                value={formData.gender}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 dark:bg-[#3A3B3C] dark:border-gray-600 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >
                <option value="">Sélectionner...</option>
                <option value="Homme">Homme</option>
                <option value="Femme">Femme</option>
                <option value="Autre">Autre</option>
              </select>
              {errors.gender && (
                <p className="text-red-500 text-xs mt-1">{errors.gender}</p>
              )}
            </div>

            {/* Notifications */}
            <div className="flex items-center">
              <input
                type="checkbox"
                name="notify"
                id="notify"
                checked={formData.notify}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label
                htmlFor="notify"
                className="ml-2 block text-sm text-gray-900 dark:text-[#B0B3B8]"
              >
                Accepter d'être notifié sur cet événement
              </label>
            </div>
          </div>

          {/* Pied de page de la modale (actions) */}
          <div className="flex items-center justify-end p-5 bg-gray-50 dark:bg-[#18191A] border-t border-gray-200 dark:border-gray-700 rounded-b-2xl space-x-3">
            <Button
              type="button"
              onClick={onClose}
              variant="secondary"
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? "Confirmation..." : "Confirmer la participation"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ParticipationFormModal;
