import React, { useState, useEffect, useRef } from "react";
import { 
  X, 
  User, 
  Mail, 
  Briefcase, 
  Phone, 
  Camera, 
  Save, 
  UserCircle,
  CheckCircle2,
  AlertCircle,
  ChevronLeft
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
    onUpdate(form);
    if (selectedFile) {
      onUploadPhoto(selectedFile);
    }
  };

  const handleCancel = () => {
    setPreviewUrl(getAvatarUrl(user.image));
    setSelectedFile(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={handleCancel}
      ></div>

      {/* Modal Container */}
      <div
        className="relative bg-white dark:bg-gray-900 w-full h-full md:h-auto md:max-h-[90vh] md:max-w-2xl md:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom md:zoom-in-95 duration-500"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-6 py-4 md:px-10 md:py-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={handleCancel}
              className="md:hidden p-2 -ml-2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
            <div>
              <h2 className="text-xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                Éditer le profil
              </h2>
              <p className="hidden md:block text-gray-400 text-xs font-black uppercase tracking-widest mt-1">
                Personnalisez votre présence
              </p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            className="hidden md:flex p-3 bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-2xl transition-all hover:scale-110"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-10 no-scrollbar">
            
            {/* Avatar Section */}
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="relative group">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] overflow-hidden border-4 border-blue-50 dark:border-gray-800 shadow-2xl relative">
                  <img
                    src={previewUrl}
                    alt="Avatar"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {isUpdating && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-md">
                      <div className="w-10 h-10 border-4 border-t-blue-500 border-white/30 rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="absolute -bottom-2 -right-2 p-4 bg-blue-600 text-white rounded-2xl shadow-xl hover:bg-blue-700 transition-all hover:scale-110 border-4 border-white dark:border-gray-900"
                >
                  <Camera size={20} />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*"
                />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-gray-900 dark:text-white">Photo de profil</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium max-w-xs mx-auto">
                  Une belle photo aide les gens à vous reconnaître.
                </p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[11px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  <User size={14} className="text-blue-500" /> Nom Complet
                </label>
                <input
                  name="nom"
                  value={form.nom}
                  onChange={handleChange}
                  className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 dark:focus:border-blue-600 rounded-2xl text-base md:text-sm font-bold text-gray-900 dark:text-white transition-all outline-none placeholder:text-gray-400"
                  placeholder="Ex: Jean Dupont"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[11px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  <Mail size={14} className="text-red-500" /> Email
                </label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 dark:focus:border-blue-600 rounded-2xl text-base md:text-sm font-bold text-gray-900 dark:text-white transition-all outline-none placeholder:text-gray-400"
                  placeholder="votre@email.com"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[11px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  <Phone size={14} className="text-green-500" /> Téléphone
                </label>
                <input
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 dark:focus:border-blue-600 rounded-2xl text-base md:text-sm font-bold text-gray-900 dark:text-white transition-all outline-none placeholder:text-gray-400"
                  placeholder="+237 ..."
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[11px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  <Briefcase size={14} className="text-amber-500" /> Profession
                </label>
                <input
                  name="profession"
                  value={form.profession}
                  onChange={handleChange}
                  className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 dark:focus:border-blue-600 rounded-2xl text-base md:text-sm font-bold text-gray-900 dark:text-white transition-all outline-none placeholder:text-gray-400"
                  placeholder="Votre métier"
                />
              </div>
            </div>

            {/* Status Messages */}
            {updateError && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-100 dark:border-red-800/50 flex items-center gap-3 animate-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                <p className="text-red-600 dark:text-red-400 text-sm font-bold">
                  {updateError.message}
                </p>
              </div>
            )}

            {isUpdateSuccess && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-100 dark:border-green-800/50 flex items-center gap-3 animate-in slide-in-from-top-2">
                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                <p className="text-green-600 dark:text-green-400 text-sm font-bold">
                  Profil mis à jour avec succès !
                </p>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 p-6 md:p-10 flex items-center gap-4">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 md:flex-none px-8 py-4 text-sm font-black uppercase tracking-widest text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="flex-[2] md:flex-none md:min-w-[200px] px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
            >
              {isUpdating ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <Save size={18} />
              )}
              <span>{isUpdating ? "En cours..." : "Enregistrer"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileEditModal;
