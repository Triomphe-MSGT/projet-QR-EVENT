// src/components/admin/UserFormModal.jsx
import React, { useState, useEffect } from "react";
import Button from "../ui/Button"; // ✅ Vérifiez le chemin
import { X } from "lucide-react";

const UserFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isSubmitting,
}) => {
  // Rôles possibles (correspondant à votre backend)
  const ROLES = ["Participant", "Organisateur", "Administrateur"];
  const SEXES = ["Homme", "Femme", "Autre"];

  const [formData, setFormData] = useState({
    nom: "",
    email: "",
    role: ROLES[0], // Défaut: Participant
    sexe: SEXES[0], // Défaut: Homme
    profession: "",
    phone: "",
    // Note: Le mot de passe n'est géré qu'à la création initiale (hors modale admin pour simplifier)
    // Note: L'image n'est pas gérée dans ce formulaire simple
  });

  // Pré-remplit le formulaire si on est en mode édition
  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        nom: initialData.nom || "",
        email: initialData.email || "",
        role: ROLES.includes(initialData.role) ? initialData.role : ROLES[0],
        sexe: SEXES.includes(initialData.sexe) ? initialData.sexe : SEXES[0],
        profession: initialData.profession || "",
        phone: initialData.phone || "",
      });
    } else if (isOpen && !initialData) {
      // Réinitialise pour la création
      setFormData({
        nom: "",
        email: "",
        role: ROLES[0],
        sexe: SEXES[0],
        profession: "",
        phone: "",
      });
    }
  }, [isOpen, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData); // Envoie les données au composant parent (AdminDashboard)
  };

  if (!isOpen) return null; // Ne rend rien si la modale est fermée

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in"
      onClick={onClose} // Ferme en cliquant sur le fond
    >
      <div
        className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-lg relative animate-slide-in-up"
        onClick={(e) => e.stopPropagation()} // Empêche la fermeture au clic sur la modale
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
          aria-label="Fermer"
        >
          <X size={24} />
        </button>

        <h2 className="text-xl font-semibold mb-5 text-gray-900 dark:text-gray-100">
          {initialData ? "Modifier l'utilisateur" : "Ajouter un utilisateur"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nom */}
          <div>
            <label
              htmlFor="nom"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Nom complet
            </label>
            <input
              type="text"
              id="nom"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Rôle */}
            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Rôle
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
              >
                {ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>

            {/* Sexe */}
            <div>
              <label
                htmlFor="sexe"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Sexe
              </label>
              <select
                id="sexe"
                name="sexe"
                value={formData.sexe}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
              >
                {SEXES.map((sexe) => (
                  <option key={sexe} value={sexe}>
                    {sexe}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Profession */}
          <div>
            <label
              htmlFor="profession"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Profession
            </label>
            <input
              type="text"
              id="profession"
              name="profession"
              value={formData.profession}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Téléphone */}
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Téléphone
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Boutons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting
                ? "Enregistrement..."
                : initialData
                ? "Mettre à jour"
                : "Créer"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserFormModal;
