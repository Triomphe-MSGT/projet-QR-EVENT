// src/pages/ProfilePage.jsx
import React, { useState, useMemo } from "react";
import MainLayout from "../../components/layout/MainLayout";
import ProfileEditModal from "../../features/user/components/ProfileEditModal";
import { Edit, QrCode, ChevronRight, Phone, Briefcase, User2, Mail, Calendar, MapPin, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

// Les hooks sont importés depuis leurs fichiers respectifs
import {
  useUserProfile,
  useUpdateProfile,
  useUploadAvatar,
} from "../../hooks/useUserProfile";
import { useUserEvents } from "../../hooks/useUserProfile";
import { API_BASE_URL } from "../../slices/axiosInstance";
const STATIC_BASE_URL = API_BASE_URL.replace("/api", "");

// --- Fonctions utilitaires pour le style des événements ---
const getHash = (str) => {
  if (!str) return 0;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash;
};
const colorPalettes = [
  { bgColor: "bg-indigo-100", textColor: "text-indigo-700", darkBg: "dark:bg-indigo-900/30", darkText: "dark:text-indigo-400" },
  { bgColor: "bg-teal-100", textColor: "text-teal-700", darkBg: "dark:bg-teal-900/30", darkText: "dark:text-teal-400" },
  { bgColor: "bg-rose-100", textColor: "text-rose-700", darkBg: "dark:bg-rose-900/30", darkText: "dark:text-rose-400" },
  { bgColor: "bg-emerald-100", textColor: "text-emerald-700", darkBg: "dark:bg-emerald-900/30", darkText: "dark:text-emerald-400" },
  { bgColor: "bg-yellow-100", textColor: "text-yellow-700", darkBg: "dark:bg-yellow-900/30", darkText: "dark:text-yellow-400" },
  { bgColor: "bg-cyan-100", textColor: "text-cyan-700", darkBg: "dark:bg-cyan-900/30", darkText: "dark:text-cyan-400" },
];
const getEventTagAndColor = (title) => {
  if (!title)
    return { tag: "EVT", bgColor: "bg-gray-100", textColor: "text-gray-700", darkBg: "dark:bg-gray-800", darkText: "dark:text-gray-400" };
  const firstWord = title.split(/\s+/)[0];
  const tag = firstWord.substring(0, 4).toUpperCase();
  const hash = getHash(title);
  const colorIndex = Math.abs(hash) % colorPalettes.length;
  return { tag, ...colorPalettes[colorIndex] };
};

const ProfilePage = () => {
  // 1. Récupérer les données utilisateur et événements
  const {
    data: user,
    isLoading: isLoadingUser,
    isError: isUserError,
    error: userError,
  } = useUserProfile();
  const {
    data: eventsData,
    isLoading: isLoadingEvents,
    isError: isEventsError,
    error: eventsError,
  } = useUserEvents();

  // 2. Préparer les mutations
  const {
    mutateAsync: updateProfileAsync,
    isPending: isUpdating,
    isSuccess: isUpdateSuccess,
    error: updateError,
  } = useUpdateProfile();
  const { mutate: uploadAvatar, isPending: isUploading } = useUploadAvatar();

  // 3. Gérer l'état de la modale
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // 4. Combiner et trier les événements
  const allEvents = useMemo(() => {
    if (!eventsData) return [];
    const organized =
      eventsData.organized?.map((evt) => ({ ...evt, type: "Organisé" })) || [];
    const participated =
      eventsData.participated?.map((evt) => ({
        ...evt,
        type: "Participation",
      })) || [];
    return [...organized, ...participated].sort(
      (a, b) => new Date(b.startDate || 0) - new Date(a.startDate || 0)
    );
  }, [eventsData]);

  // 5. Fonctions de gestion
  const handleUpdateProfile = async (formData) => {
    try {
      await updateProfileAsync(formData);
      setTimeout(() => setIsEditModalOpen(false), 1500);
    } catch (error) {
      console.error("La mise à jour du profil a échoué:", error);
    }
  };

  const handleUploadPhoto = (file) => uploadAvatar(file);

  const getAvatarUrl = (imagePath) => {
    if (!imagePath)
      return "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";
    if (imagePath.startsWith("http")) return imagePath;
    return `${STATIC_BASE_URL}/${imagePath}`;
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

  if (isLoadingUser)
    return (
      <MainLayout>
        <div className="min-h-screen flex flex-col items-center justify-center p-8">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-400 font-black text-[10px] tracking-widest uppercase">Chargement de votre univers...</p>
        </div>
      </MainLayout>
    );

  if (isUserError)
    return (
      <MainLayout>
        <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
          <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-6">
            <Sparkles className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Oups ! Quelque chose a coincé</h2>
          <p className="text-gray-500 dark:text-gray-400 font-medium max-w-xs mx-auto mb-8">
            {userError.message}
          </p>
          <button onClick={() => window.location.reload()} className="px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-black text-xs uppercase tracking-widest">
            Réessayer
          </button>
        </div>
      </MainLayout>
    );

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 min-h-screen">
        
        {/* --- Profile Hero Section --- */}
        <div className="relative bg-white dark:bg-gray-800 rounded-[3rem] overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-700/50 group">
          {/* Banner */}
          <div className="h-48 sm:h-64 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
            <div className="absolute -bottom-1 left-0 right-0 h-24 bg-gradient-to-t from-white dark:from-gray-800 to-transparent"></div>
          </div>

          <div className="px-6 sm:px-12 pb-12 -mt-24 sm:-mt-32 relative z-10">
            <div className="flex flex-col lg:flex-row items-center lg:items-end gap-8 lg:gap-12 text-center lg:text-left">
              {/* Avatar */}
              <div className="relative group/avatar">
                <div className="w-40 h-40 sm:w-52 sm:h-52 rounded-[3rem] overflow-hidden border-[10px] border-white dark:border-gray-800 shadow-2xl relative">
                  <img
                    src={getAvatarUrl(user.image)}
                    alt="Avatar"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover/avatar:scale-110"
                  />
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-md">
                      <div className="w-12 h-12 border-4 border-t-blue-500 border-white/30 rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => setIsEditModalOpen(true)}
                  className="absolute bottom-4 right-4 p-3 bg-blue-600 text-white rounded-2xl shadow-xl hover:scale-110 transition-all active:scale-95 border-4 border-white dark:border-gray-800"
                >
                  <Edit size={20} />
                </button>
              </div>

              {/* User Info */}
              <div className="flex-1 space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                      <span className="px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400 rounded-full border border-blue-100 dark:border-blue-800/50">
                        {user.role}
                      </span>
                      {user.isVerified && (
                        <span className="px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400 rounded-full border border-green-100 dark:border-green-800/50">
                          Vérifié
                        </span>
                      )}
                    </div>
                    <h1 className="text-4xl sm:text-6xl font-black text-gray-900 dark:text-white tracking-tighter leading-none">
                      {user.nom}
                    </h1>
                    <div className="flex items-center justify-center lg:justify-start gap-2 text-gray-500 dark:text-gray-400 font-bold">
                      <Mail size={16} className="text-blue-500" />
                      <span>{user.email}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center justify-center gap-4">
                    <Link
                      to="/my-qrcodes"
                      className="flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95"
                    >
                      <QrCode size={18} /> Mes Billets
                    </Link>
                    <button
                      onClick={() => setIsEditModalOpen(true)}
                      className="flex items-center gap-3 px-8 py-4 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-100 dark:hover:bg-gray-600 transition-all border border-gray-100 dark:border-gray-600 active:scale-95"
                    >
                      <Edit size={18} /> Éditer
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-0">
              <div className="flex flex-col items-center lg:items-start space-y-3 sm:pr-12">
                <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Briefcase size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Profession</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{user.profession || "Explorateur"}</p>
                </div>
              </div>
              
              <div className="flex flex-col items-center lg:items-start space-y-3 sm:px-12 sm:border-x border-gray-100 dark:border-gray-700/50">
                <div className="w-12 h-12 bg-teal-50 dark:bg-teal-900/30 rounded-2xl flex items-center justify-center text-teal-600 dark:text-teal-400">
                  <Phone size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Téléphone</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{user.phone || "Non renseigné"}</p>
                </div>
              </div>
              
              <div className="flex flex-col items-center lg:items-start space-y-3 sm:pl-12">
                <div className="w-12 h-12 bg-rose-50 dark:bg-rose-900/30 rounded-2xl flex items-center justify-center text-rose-600 dark:text-rose-400">
                  <User2 size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sexe</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{user.sexe || "Non renseigné"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- Events Section --- */}
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 px-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-blue-600 font-black text-xs tracking-[0.2em] uppercase">
                <Calendar className="w-4 h-4" />
                <span>Activité</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tighter leading-none">
                Mes Événements
              </h2>
            </div>
            <div className="px-6 py-2 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">
              {allEvents.length} Expériences
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {isLoadingEvents ? (
              <div className="lg:col-span-2 flex flex-col items-center justify-center py-24 bg-white dark:bg-gray-800 rounded-[3rem] shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Synchronisation...</p>
              </div>
            ) : isEventsError ? (
              <div className="lg:col-span-2 p-12 bg-red-50 dark:bg-red-900/20 rounded-[3rem] border border-red-100 dark:border-red-800/50 text-center">
                <p className="text-red-600 dark:text-red-400 font-bold">Erreur: {eventsError.message}</p>
              </div>
            ) : allEvents.length > 0 ? (
              allEvents.map((event) => {
                const { tag, bgColor, textColor, darkBg, darkText } = getEventTagAndColor(event.name);
                return (
                  <Link
                    key={`${event._id || event.id}-${event.type}`}
                    to={`/events/${event._id || event.id}`}
                    className="group bg-white dark:bg-gray-800 p-6 rounded-[2.5rem] border border-gray-100 dark:border-gray-700/50 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 flex items-center gap-6"
                  >
                    <div className={`w-20 h-20 rounded-[1.5rem] flex items-center justify-center shrink-0 ${bgColor} ${textColor} ${darkBg} ${darkText} font-black text-sm shadow-inner group-hover:scale-110 transition-transform duration-500`}>
                      {tag}
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-[8px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest ${
                          event.type === "Organisé"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                        }`}>
                          {event.type}
                        </span>
                        <div className="flex items-center gap-1 text-[8px] font-black text-gray-400 uppercase tracking-widest">
                          <MapPin size={10} className="text-blue-500" />
                          <span className="truncate">{event.city || "Cameroun"}</span>
                        </div>
                      </div>
                      <h3 className="text-xl font-black text-gray-900 dark:text-white truncate group-hover:text-blue-600 transition-colors">
                        {event.name}
                      </h3>
                      <p className="text-xs font-bold text-gray-400 dark:text-gray-500 flex items-center gap-2">
                        <Calendar size={12} />
                        {formatDate(event.startDate)}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-gray-900 flex items-center justify-center text-gray-300 group-hover:text-blue-600 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 group-hover:translate-x-1 transition-all">
                      <ChevronRight size={24} />
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="lg:col-span-2 text-center py-24 bg-white dark:bg-gray-800 rounded-[3rem] border-2 border-dashed border-gray-100 dark:border-gray-800">
                <div className="w-20 h-20 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Calendar className="w-10 h-10 text-gray-300" />
                </div>
                <p className="text-sm font-black text-gray-400 uppercase tracking-widest">
                  Aucun événement à l'horizon
                </p>
                <Link to="/events" className="mt-6 inline-block text-blue-600 font-black text-xs uppercase tracking-widest hover:underline">
                  Explorer les événements
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* --- Modal --- */}
        {isEditModalOpen && user && (
          <ProfileEditModal
            user={user}
            onClose={() => setIsEditModalOpen(false)}
            onUpdate={handleUpdateProfile}
            onUploadPhoto={handleUploadPhoto}
            isUpdating={isUpdating || isUploading}
            updateError={updateError}
            isUpdateSuccess={isUpdateSuccess}
          />
        )}
      </div>
    </MainLayout>
  );
};

export default ProfilePage;
