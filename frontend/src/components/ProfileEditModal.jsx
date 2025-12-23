// src/components/ProfileEditModal.jsx
import React, { useState, useEffect, useRef } from "react";
import { 
  X, 
  User, 
  Mail, 
  Briefcase, 
  Phone, 
  Camera, 
  Save, 
  ChevronRight,
  UserCircle 
} from "lucide-react";
import Button from "./ui/Button";
import { API_BASE_URL } from "../slices/axiosInstance";

const STATIC_BASE_URL = API_BASE_URL.replace("/api", "");

const ProfileEditModal = ({
  user,
  onClose,
  onUpdate,
  onUploadPhoto,
  isUpdating,
  updateError,
  isUpdateSuccess,
}) => {
  const [form, setForm] = useState({
    nom: user.nom || "",
    email: user.email || "",
    profession: user.profession || "",
    phone: user.phone || "",
    sexe: user.sexe || "Autre",
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  const getAvatarUrl = (imagePath) => {
    if (!imagePath)
      return "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";
    if (imagePath.startsWith("http")) return imagePath;
    return `${STATIC_BASE_URL}/${imagePath}`;
  };

  // S'assurer que le formulaire se met à jour si 'user' change
  useEffect(() => {
    setForm({
      nom: user.nom || "",
      email: user.email || "",
      profession: user.profession || "",
      phone: user.phone || "",
      sexe: user.sexe || "Autre",
    });
    setPreviewUrl(getAvatarUrl(user.image));
    setSelectedFile(null);
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 1. Mettre à jour les infos textuelles
    onUpdate(form);
    
    // 2. Uploader la photo si une nouvelle a été choisie
    if (selectedFile) {
      onUploadPhoto(selectedFile);
    }
  };

  const handleCancel = () => {
    // Réinitialiser l'aperçu à l'original
    setPreviewUrl(getAvatarUrl(user.image));
    setSelectedFile(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[200] p-4 animate-in fade-in duration-300">
      <div
        className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20 animate-in zoom-in-95 duration-300 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative h-32 bg-gradient-to-r from-blue-600 to-indigo-700 p-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl border border-white/20">
              <UserCircle className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">Modifier Profil</h2>
              <p className="text-blue-100 text-xs font-bold uppercase tracking-widest opacity-80">Paramètres du compte</p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            className="p-2 hover:bg-white/20 rounded-full transition-colors text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col max-h-[calc(90vh-8rem)]">
          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto p-8 md:p-10 space-y-8 no-scrollbar">
            {/* Avatar Section */}
            <div className="flex flex-col md:flex-row items-center gap-8 pb-8 border-b border-gray-100 dark:border-gray-800">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-50 shadow-xl dark:border-gray-800">
                  <img
                    src={previewUrl}
                    alt="Avatar"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="absolute bottom-0 right-0 p-3 bg-blue-600 text-white rounded-2xl shadow-lg hover:bg-blue-700 transition-all hover:scale-110 border-4 border-white dark:border-gray-900"
                >
                  <Camera className="w-5 h-5" />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*"
                />
              </div>
              <div className="flex-1 text-center md:text-left space-y-2">
                <h3 className="text-lg font-black text-gray-900 dark:text-white">Photo de profil</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                  Importez une photo claire pour que les organisateurs et participants puissent vous reconnaître facilement.
                </p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  <User className="w-3 h-3 text-blue-500" /> Nom Complet
                </label>
                <input
                  name="nom"
                  value={form.nom}
                  onChange={handleChange}
                  className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 dark:focus:border-blue-600 rounded-2xl text-sm font-bold text-gray-900 dark:text-white transition-all outline-none"
                  placeholder="Votre nom"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  <Mail className="w-3 h-3 text-red-500" /> Email
                </label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 dark:focus:border-blue-600 rounded-2xl text-sm font-bold text-gray-900 dark:text-white transition-all outline-none"
                  placeholder="votre@email.com"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  <Phone className="w-3 h-3 text-green-500" /> Téléphone
                </label>
                <input
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 dark:focus:border-blue-600 rounded-2xl text-sm font-bold text-gray-900 dark:text-white transition-all outline-none"
                  placeholder="+237 ..."
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  <Briefcase className="w-3 h-3 text-amber-500" /> Profession
                </label>
                <input
                  name="profession"
                  value={form.profession}
                  onChange={handleChange}
                  className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 dark:focus:border-blue-600 rounded-2xl text-sm font-bold text-gray-900 dark:text-white transition-all outline-none"
                  placeholder="Votre métier"
                />
              </div>
            </div>

            {/* Messages d'état */}
            {updateError && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-100 dark:border-red-800/50 flex items-center gap-3">
                <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center shrink-0">
                  <X className="w-5 h-5 text-white" />
                </div>
                <p className="text-red-600 dark:text-red-400 text-xs font-black tracking-tight">
                  {updateError.message}
                </p>
              </div>
            )}

            {isUpdateSuccess && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-100 dark:border-green-800/50 flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center shrink-0">
                  <ChevronRight className="w-5 h-5 text-white" />
                </div>
                <p className="text-green-600 dark:text-green-400 text-xs font-black tracking-tight">
                  Profil mis à jour avec succès !
                </p>
              </div>
            )}
          </div>

          {/* Fixed Footer Actions */}
          <div className="flex items-center justify-end gap-4 p-6 md:p-8 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 md:px-8 py-3 md:py-4 text-[10px] md:text-xs font-black uppercase tracking-widest text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Annuler
            </button>
            <Button
              type="submit"
              disabled={isUpdating}
              className="px-8 md:px-10 py-3 md:py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20 flex items-center gap-3 transition-all active:scale-95 disabled:opacity-50"
            >
              {isUpdating ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{isUpdating ? "Enregistrement..." : "Sauvegarder"}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileEditModal;
