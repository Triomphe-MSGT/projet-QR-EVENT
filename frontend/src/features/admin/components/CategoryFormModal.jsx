// src/components/admin/CategoryFormModal.jsx
import React, { useState, useEffect } from "react";
import Button from "../../../components/ui/Button"; // ✅ Vérifiez le chemin
import { X } from "lucide-react";

const CategoryFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isSubmitting,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    emoji: "",
    description: "",
  });

  // Pré-remplit le formulaire si on est en mode édition
  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        name: initialData.name || "",
        emoji: initialData.emoji || "",
        description: initialData.description || "",
      });
    } else if (isOpen && !initialData) {
      // Réinitialise pour la création
      setFormData({ name: "", emoji: "", description: "" });
    }
  }, [isOpen, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md relative animate-slide-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
          aria-label="Fermer"
        >
          <X size={24} />
        </button>

        <h2 className="text-xl font-semibold mb-5 text-gray-900 dark:text-gray-100">
          {initialData ? "Modifier la catégorie" : "Ajouter une catégorie"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nom */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Nom de la catégorie
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              minLength="3"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Emoji (Optionnel) */}
          <div>
            <label
              htmlFor="emoji"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Emoji (Optionnel)
            </label>
            <input
              type="text"
              id="emoji"
              name="emoji"
              value={formData.emoji}
              onChange={handleChange}
              maxLength="2"
              placeholder="🎉"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Description (Optionnel) */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Description (Optionnel)
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
            ></textarea>
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

export default CategoryFormModal;
