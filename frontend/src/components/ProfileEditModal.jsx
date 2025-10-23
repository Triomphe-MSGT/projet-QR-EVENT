// src/components/ProfileEditModal.jsx
import React, { useState, useEffect } from "react"; // Importer useEffect

const ProfileEditModal = ({
  user,
  onClose,
  onUpdate,
  onUploadPhoto,
  isUpdating,
  updateError,
  isUpdateSuccess,
}) => {
  // CORRECTION : Utiliser 'nom' et les champs du backend
  const [form, setForm] = useState({
    nom: user.nom || "",
    email: user.email || "",
    profession: user.profession || "",
    phone: user.phone || "",
    sexe: user.sexe || "",
  });

  // S'assurer que le formulaire se met à jour si 'user' change (après le 1er chargement)
  useEffect(() => {
    setForm({
      nom: user.nom || "",
      email: user.email || "",
      profession: user.profession || "",
      phone: user.phone || "",
      sexe: user.sexe || "Autre",
    });
  }, [user]); // Dépendance à 'user'

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(form); // Enverra { nom, email, profession, phone, sexe }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) onUploadPhoto(file); // Appelle la fonction d'upload d'avatar
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
      <div
        className="bg-white dark:bg-gray-900 p-6 rounded-2xl w-full max-w-md shadow-2xl
                   border border-gray-200 dark:border-gray-700 transition-all duration-300"
      >
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          Modifier le profil
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* CORRECTION : 'username' -> 'nom' */}
          <div>
            <label className="block mb-1 text-gray-700 dark:text-gray-300">
              Nom complet
            </label>
            <input
              name="nom"
              value={form.nom}
              onChange={handleChange}
              className="w-full border border-gray-300 dark:border-gray-600
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                         rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Nom complet"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block mb-1 text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="w-full border p-2 rounded-lg"
              placeholder="Adresse email"
            />
          </div>

          {/* Champs additionnels du backend */}
          <div>
            <label className="block mb-1 text-gray-700 dark:text-gray-300">
              Téléphone
            </label>
            <input
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              className="w-full border p-2 rounded-lg"
              placeholder="Numéro de téléphone"
            />
          </div>
          <div>
            <label className="block mb-1 text-gray-700 dark:text-gray-300">
              Profession
            </label>
            <input
              name="profession"
              type="text"
              value={form.profession}
              onChange={handleChange}
              className="w-full border p-2 rounded-lg"
              placeholder="Votre profession"
            />
          </div>

          {/* Photo de profil */}
          <div>
            <label className="block mb-1 text-gray-700 dark:text-gray-300">
              Changer la photo de profil
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full text-gray-700 dark:text-gray-300 file:mr-4 file:py-2 file:px-4
                         file:rounded-lg file:border-0 file:text-sm file:font-semibold
                         file:bg-blue-50 dark:file:bg-gray-700 file:text-blue-600 dark:file:text-gray-200
                         hover:file:bg-blue-100 dark:hover:file:bg-gray-600 transition"
            />
          </div>

          {/* Messages d'état */}
          {updateError && (
            <p className="text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/30 p-2 rounded-lg text-sm">
              {updateError.message}
            </p>
          )}
          {isUpdateSuccess && (
            <p className="text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 p-2 rounded-lg text-sm">
              Profil mis à jour avec succès !
            </p>
          )}

          {/* Boutons */}
          <div className="flex justify-between mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700
                         text-gray-800 dark:text-gray-100 rounded-lg
                         hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg
                         hover:bg-blue-700 disabled:opacity-70 transition"
            >
              {isUpdating ? "Mise à jour..." : "Sauvegarder"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileEditModal;
