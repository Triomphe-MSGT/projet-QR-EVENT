// src/pages/ProfilePage.jsx
import React, { useState, useMemo } from "react";
import MainLayout from "../components/layouts/MainLayout";
import ProfileEditModal from "../components/ProfileEditModal";
import { Edit, QrCode, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

// Les hooks sont importés depuis leurs fichiers respectifs
import {
  useUserProfile,
  useUpdateProfile,
  useUploadAvatar,
} from "../hooks/useUserProfile";
import { useUserEvents } from "../hooks/useUserProfile";
import { API_BASE_URL } from "../slices/axiosInstance";
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
  { bgColor: "bg-indigo-100", textColor: "text-indigo-700" },
  { bgColor: "bg-teal-100", textColor: "text-teal-700" },
  { bgColor: "bg-rose-100", textColor: "text-rose-700" },
  { bgColor: "bg-emerald-100", textColor: "text-emerald-700" },
  { bgColor: "bg-yellow-100", textColor: "text-yellow-700" },
  { bgColor: "bg-cyan-100", textColor: "text-cyan-700" },
];
const getEventTagAndColor = (title) => {
  if (!title)
    return { tag: "EVT", bgColor: "bg-gray-100", textColor: "text-gray-700" };
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
    console.log("ProfilePage: eventsData received:", eventsData);
    const organized =
      eventsData.organized?.map((evt) => ({ ...evt, type: "Organisé" })) || [];
    const participated =
      eventsData.participated?.map((evt) => ({
        ...evt,
        type: "Participation",
      })) || [];
    // Trie les événements du plus récent au plus ancien
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
    // Si c'est déjà une URL complète (Cloudinary, Google), on la retourne
    if (imagePath.startsWith("http")) return imagePath;

    // Sinon, on construit l'URL complète
    return `${STATIC_BASE_URL}/${imagePath}`;
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

  // Gestion des états de chargement et d'erreur principaux
  if (isLoadingUser)
    return (
      <MainLayout>
        <div className="text-center p-8">Chargement du profil...</div>
      </MainLayout>
    );
  if (isUserError)
    return (
      <MainLayout>
        <div className="text-center p-8 text-red-500">
          Erreur: {userError.message}
        </div>
      </MainLayout>
    );

  return (
    <MainLayout>
      <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-8 min-h-screen">
        {/* --- Section Profil --- */}
        <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-[2.5rem] overflow-hidden border border-gray-100 dark:border-gray-700/50 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="h-32 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>
          <div className="px-6 sm:px-10 pb-10 -mt-12">
            <div className="flex flex-col sm:flex-row items-end gap-6 sm:gap-8">
              <div className="relative flex-shrink-0">
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-[2rem] overflow-hidden border-8 border-white dark:border-gray-800 shadow-2xl">
                  <img
                    src={getAvatarUrl(user.image)}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                {isUploading && (
                  <div className="absolute inset-0 bg-black/50 rounded-[2rem] flex items-center justify-center backdrop-blur-sm">
                    <div className="w-10 h-10 border-4 border-t-blue-500 border-white/30 rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              <div className="flex-1 pb-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight uppercase">
                      {user.nom}
                    </h1>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400 rounded-full border border-blue-100 dark:border-blue-800/50">
                        {user.role}
                      </span>
                      <span className="text-sm font-bold text-gray-400 dark:text-gray-500">
                        {user.email}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl active:scale-95"
                  >
                    <Edit size={16} /> Modifier Profil
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 pt-10 border-t border-gray-50 dark:border-gray-700/50">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Profession</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{user.profession || "Non renseigné"}</p>
              </div>
              <div className="space-y-1 border-l-0 md:border-l border-gray-50 dark:border-gray-700/50 md:pl-8">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Téléphone</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{user.phone || "Non renseigné"}</p>
              </div>
              <div className="space-y-1 border-l-0 md:border-l border-gray-50 dark:border-gray-700/50 md:pl-8">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sexe</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{user.sexe || "Non renseigné"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* --- Section Événements --- */}
        <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-[2.5rem] p-8 sm:p-10 border border-gray-100 dark:border-gray-700/50 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
              Mes Événements
            </h2>
            <div className="px-4 py-1.5 bg-gray-50 dark:bg-gray-900 rounded-full text-[10px] font-black text-gray-400 uppercase tracking-widest">
              {allEvents.length} Total
            </div>
          </div>

          {isLoadingEvents && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-xs font-black text-gray-400 uppercase tracking-widest">Chargement...</p>
            </div>
          )}
          
          {isEventsError && (
            <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-3xl border border-red-100 dark:border-red-800/50 text-center">
              <p className="text-red-600 dark:text-red-400 font-bold">Erreur: {eventsError.message}</p>
            </div>
          )}

          {allEvents.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {allEvents.map((event, index) => {
                const { tag, bgColor, textColor } = getEventTagAndColor(
                  event.name
                );
                const eventKey = `${event._id || event.id}-${event.type}`;
                return (
                  <Link
                    key={eventKey}
                    to={`/events/${event._id || event.id}`}
                    className="group flex items-center bg-gray-50 dark:bg-gray-900/50 p-4 rounded-3xl border-2 border-transparent hover:border-blue-500/30 hover:bg-white dark:hover:bg-gray-800 transition-all duration-300"
                  >
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center mr-6 ${bgColor} ${textColor} font-black text-xs shrink-0 shadow-sm group-hover:scale-110 transition-transform`}
                    >
                      {tag}
                    </div>
                    <div className="flex-grow">
                      <p className="text-lg font-black text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                        {event.name}
                      </p>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs font-bold text-gray-400 dark:text-gray-500">
                          {formatDate(event.startDate)}
                        </span>
                        <span
                          className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
                            event.type === "Organisé"
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                          }`}
                        >
                          {event.type}
                        </span>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center text-gray-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all shadow-sm">
                      <ChevronRight size={20} />
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            !isLoadingEvents && (
              <div className="text-center py-20 bg-gray-50 dark:bg-gray-900/50 rounded-[2rem] border-2 border-dashed border-gray-100 dark:border-gray-800">
                <p className="text-sm font-black text-gray-400 uppercase tracking-widest">
                  Aucun événement trouvé
                </p>
              </div>
            )
          )}
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

        <Link
          to="/my-qrcodes"
          className="flex items-center gap-2 px-3 py-2 text-sm font-semibold bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:hover:bg-blue-900 transition"
        >
          <QrCode size={16} />
          Voir mes QR Codes
        </Link>
      </div>
    </MainLayout>
  );
};

export default ProfilePage;
