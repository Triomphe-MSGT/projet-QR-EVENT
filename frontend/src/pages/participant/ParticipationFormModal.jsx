import React, { useState, useEffect } from "react";
import Button from "../../components/ui/Button";
import { 
  User, 
  Mail, 
  Briefcase, 
  ChevronDown, 
  X, 
  CheckCircle2, 
  AlertCircle,
  Bell,
  ShieldCheck
} from "lucide-react";

const ParticipationFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  eventName,
  isSubmitting,
  user,
}) => {
  const [formData, setFormData] = useState({
    fullName: "",
    profession: "",
    email: "",
    gender: "",
    notify: true,
  });

  const [errors, setErrors] = useState({});

  // Pré-remplissage des données utilisateur
  useEffect(() => {
    if (isOpen && user) {
      setFormData({
        fullName: user.nom || "",
        profession: user.profession || "",
        email: user.email || "",
        gender: user.sexe || "",
        notify: true,
      });
    }
  }, [isOpen, user]);

  const token = localStorage.getItem("token");
  if (!isOpen || !token) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

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
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-900 rounded-3xl sm:rounded-[2.5rem] shadow-2xl w-full max-w-xl max-h-[95vh] overflow-y-auto custom-scrollbar border border-gray-100 dark:border-gray-800 animate-scale-up">
        
        {/* Header */}
        <div className="relative p-6 md:p-10 border-b border-gray-50 dark:border-gray-800 bg-gradient-to-r from-blue-600/5 to-purple-600/5">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          
          <div className="flex items-center gap-3 mb-3 sm:mb-4">
            <div className="px-3 py-1 bg-blue-600 text-white text-[9px] sm:text-[10px] font-black rounded-full uppercase tracking-widest shadow-lg shadow-blue-600/20">
              Réservation
            </div>
            <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 text-[9px] sm:text-[10px] font-black uppercase tracking-widest">
              <ShieldCheck className="w-3 h-3" /> Sécurisé
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tighter leading-tight">
            Confirmer votre <br />
            <span className="text-blue-600">participation</span>
          </h2>
          <p className="text-gray-500 dark:text-gray-400 font-medium mt-1 sm:mt-2 text-xs sm:text-sm">
            {eventName}
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="p-6 md:p-10 space-y-6 sm:space-y-8 pb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Nom Complet */}
            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nom complet *</label>
              <div className="relative">
                <User className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Votre nom"
                  className={`w-full pl-11 sm:pl-12 pr-4 sm:pr-6 py-3.5 sm:py-4 bg-gray-50 dark:bg-gray-800 border-2 rounded-xl sm:rounded-2xl transition-all outline-none font-bold text-gray-900 dark:text-white text-xs sm:text-sm ${
                    errors.fullName ? "border-red-500" : "border-transparent focus:border-blue-600 focus:bg-white dark:focus:bg-gray-700"
                  }`}
                />
              </div>
              {errors.fullName && <p className="text-red-500 text-[9px] sm:text-[10px] font-bold ml-2">{errors.fullName}</p>}
            </div>

            {/* Email */}
            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email *</label>
              <div className="relative">
                <Mail className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="votre@email.com"
                  className={`w-full pl-11 sm:pl-12 pr-4 sm:pr-6 py-3.5 sm:py-4 bg-gray-50 dark:bg-gray-800 border-2 rounded-xl sm:rounded-2xl transition-all outline-none font-bold text-gray-900 dark:text-white text-xs sm:text-sm ${
                    errors.email ? "border-red-500" : "border-transparent focus:border-blue-600 focus:bg-white dark:focus:bg-gray-700"
                  }`}
                />
              </div>
              {errors.email && <p className="text-red-500 text-[9px] sm:text-[10px] font-bold ml-2">{errors.email}</p>}
            </div>

            {/* Métier */}
            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Métier *</label>
              <div className="relative">
                <Briefcase className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  name="profession"
                  value={formData.profession}
                  onChange={handleChange}
                  placeholder="Votre profession"
                  className={`w-full pl-11 sm:pl-12 pr-4 sm:pr-6 py-3.5 sm:py-4 bg-gray-50 dark:bg-gray-800 border-2 rounded-xl sm:rounded-2xl transition-all outline-none font-bold text-gray-900 dark:text-white text-xs sm:text-sm ${
                    errors.profession ? "border-red-500" : "border-transparent focus:border-blue-600 focus:bg-white dark:focus:bg-gray-700"
                  }`}
                />
              </div>
              {errors.profession && <p className="text-red-500 text-[9px] sm:text-[10px] font-bold ml-2">{errors.profession}</p>}
            </div>

            {/* Sexe */}
            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Sexe *</label>
              <div className="relative">
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className={`w-full px-4 sm:px-6 py-3.5 sm:py-4 bg-gray-50 dark:bg-gray-800 border-2 rounded-xl sm:rounded-2xl transition-all outline-none font-bold text-gray-900 dark:text-white text-xs sm:text-sm appearance-none ${
                    errors.gender ? "border-red-500" : "border-transparent focus:border-blue-600 focus:bg-white dark:focus:bg-gray-700"
                  }`}
                >
                  <option value="">Sélectionner...</option>
                  <option value="Homme">Homme</option>
                  <option value="Femme">Femme</option>
                  <option value="Autre">Autre</option>
                </select>
                <ChevronDown className="absolute right-4 sm:right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              {errors.gender && <p className="text-red-500 text-[9px] sm:text-[10px] font-bold ml-2">{errors.gender}</p>}
            </div>
          </div>

          {/* Notifications Toggle */}
          <div className="flex items-center justify-between p-4 sm:p-6 bg-blue-50 dark:bg-blue-900/10 rounded-2xl sm:rounded-[2rem] border border-blue-100 dark:border-blue-900/30">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
                <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h4 className="text-[9px] sm:text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-widest">Notifications</h4>
                <p className="text-[8px] sm:text-[10px] text-gray-500 dark:text-gray-400 font-medium">Mises à jour de l'événement.</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                name="notify"
                checked={formData.notify}
                onChange={handleChange}
                className="sr-only peer" 
              />
              <div className="w-10 h-5 sm:w-12 sm:h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-3 pt-4 pb-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 sm:py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm uppercase tracking-[0.2em] shadow-xl shadow-blue-600/20 transition-all flex items-center justify-center gap-2 sm:gap-3 disabled:opacity-50 active:scale-95"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
              {isSubmitting ? "Traitement..." : "Confirmer ma place"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 sm:py-4 text-xs sm:text-sm font-black text-gray-400 hover:text-gray-600 uppercase tracking-widest transition-colors"
            >
              Annuler
            </button>
          </div>
        </form>

        <style>{`
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes scaleUp { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
          .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
          .animate-scale-up { animation: scaleUp 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
          .custom-scrollbar::-webkit-scrollbar { width: 4px; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(59, 130, 246, 0.2); border-radius: 10px; }
        `}</style>
      </div>
    </div>
  );
};

export default ParticipationFormModal;
