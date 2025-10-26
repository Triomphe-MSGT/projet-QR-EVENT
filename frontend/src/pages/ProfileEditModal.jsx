import React, { useState, useRef, useEffect } from "react";
import Button from "../components/ui/Button";

const ProfileEditModal = ({
  user,
  onClose,
  onUpdate,
  onUploadPhoto,
  isUpdating,
  updateError,
  isUpdateSuccess,
}) => {
  const [username, setUsername] = useState(user.username);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(user.avatarUrl);
  const fileInputRef = useRef(null);

  // Gérer la soumission du formulaire
  const handleSubmit = (e) => {
    e.preventDefault();

    // Mettre à jour le nom d'utilisateur s'il a changé
    if (username !== user.username) {
      onUpdate({ username });
    }

    // Mettre en ligne le nouvel avatar s'il a été sélectionné
    if (selectedFile) {
      const formData = new FormData();
      formData.append("avatar", selectedFile);
      onUploadPhoto(formData);
    }
  };

  // Gérer le changement de fichier pour l'avatar
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Créer un aperçu de l'image
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Fermer la modale après une mise à jour réussie
  useEffect(() => {
    if (isUpdateSuccess) {
      onClose();
    }
  }, [isUpdateSuccess, onClose]);

  return (
    // Superposition de la modale
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 transition-opacity duration-300">
      <div
        className="bg-white dark:bg-[#242526] rounded-2xl shadow-xl p-6 md:p-8 w-full max-w-md m-4 transform transition-transform duration-300 scale-100"
        onClick={(e) => e.stopPropagation()} // Empêche la fermeture en cliquant à l'intérieur
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-[#E4E6EB]">
            Modifier le profil
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center space-y-3">
            <img
              src={preview}
              alt="Aperçu de l'avatar"
              className="w-24 h-24 rounded-full object-cover border-2 border-gray-300"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current.click()}
            >
              Changer la photo
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*"
            />
          </div>

          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 dark:text-[#B0B3B8] mb-1"
            >
              Nom d'utilisateur
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-[#3A3B3C] border border-gray-300 dark:border-[#3E4042] rounded-lg focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>

          {updateError && (
            <p className="text-sm text-red-500 text-center">
              Erreur: {updateError.message}
            </p>
          )}

          <div className="flex items-center justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" variant="primary" disabled={isUpdating}>
              {isUpdating ? "Sauvegarde..." : "Sauvegarder"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileEditModal;
