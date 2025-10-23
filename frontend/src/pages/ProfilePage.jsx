// src/pages/ProfilePage.jsx
import React, { useState, useMemo } from "react";
import MainLayout from "../components/layouts/MainLayout";
import ProfileEditModal from "../components/ProfileEditModal";
import { Edit, QrCode } from "lucide-react";
import { Link } from "react-router-dom"; // ✅ Ajout de l'import pour Link

// Les hooks sont importés depuis leurs fichiers respectifs
import {
  useUserProfile,
  useUpdateProfile,
  useUploadAvatar,
} from "../hooks/useUserProfile";
import { useUserEvents } from "../hooks/useUserProfile";

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
  // 1. Récupérer les données
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
    // Trie les événements du plus récent au plus ancien
    return [...organized, ...participated].sort(
      (a, b) => new Date(b.startDate) - new Date(a.startDate)
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
    if (!imagePath) return "/assets/default-avatar.png";
    if (imagePath.startsWith("http")) return imagePath;
    return `http://localhost:3001/${imagePath}`;
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
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
            <div className="relative flex-shrink-0">
              <img
                src={getAvatarUrl(user.image)}
                alt="Avatar"
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-blue-500 shadow-md"
              />
              {isUploading && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-t-blue-500 border-white/50 rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                {user.nom}
              </h1>
              <p className="text-md sm:text-lg text-gray-500 dark:text-gray-400 mt-1">
                {user.email}
              </p>
              <span className="mt-2 inline-block px-3 py-1 text-sm font-semibold text-blue-800 bg-blue-100 dark:bg-blue-900/50 dark:text-blue-300 rounded-full capitalize">
                {user.role}
              </span>
            </div>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm hover:shadow-md"
            >
              <Edit size={18} /> Modifier
            </button>
          </div>
          <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div>
              <h3 className="font-semibold text-gray-500 dark:text-gray-400">
                Profession
              </h3>
              <p className="text-gray-800 dark:text-gray-100 mt-1">
                {user.profession || "Non renseigné"}
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-500 dark:text-gray-400">
                Téléphone
              </h3>
              <p className="text-gray-800 dark:text-gray-100 mt-1">
                {user.phone || "Non renseigné"}
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-500 dark:text-gray-400">
                Sexe
              </h3>
              <p className="text-gray-800 dark:text-gray-100 mt-1">
                {user.sexe || "Non renseigné"}
              </p>
            </div>
          </div>
        </div>

        {/* --- Section Événements --- */}
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">
            Mes Événements
          </h2>
          {isLoadingEvents && (
            <p className="text-center text-gray-500 dark:text-gray-400">
              Chargement des événements...
            </p>
          )}
          {isEventsError && (
            <p className="text-center text-red-500">
              Erreur: {eventsError.message}
            </p>
          )}
          {allEvents.length > 0 ? (
            <div className="space-y-4">
              {allEvents.map((event, index) => {
                const { tag, bgColor, textColor } = getEventTagAndColor(
                  event.name
                );
                const eventKey = event._id || event.id || index;
                return (
                  <Link
                    key={eventKey}
                    to={`/events/${event._id || event.id}`}
                    className="flex items-center bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl shadow-sm hover:bg-gray-100 dark:hover:bg-gray-600 transition"
                  >
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center mr-4 ${bgColor} ${textColor} font-bold text-xs shrink-0`}
                    >
                      {tag}
                    </div>
                    <div className="flex-grow">
                      <p className="font-semibold text-gray-800 dark:text-white">
                        {event.name}
                      </p>
                      <div className="flex items-center gap-4">
                        <span className="text-gray-500 dark:text-gray-400 text-sm">
                          {formatDate(event.startDate)}
                        </span>
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            event.type === "Organisé"
                              ? "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300"
                              : "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300"
                          }`}
                        >
                          {event.type}
                        </span>
                      </div>
                    </div>
                    <svg
                      className="w-5 h-5 text-gray-400 dark:text-gray-500 ml-auto"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                );
              })}
            </div>
          ) : (
            !isLoadingEvents && (
              <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                Aucun événement associé à votre profil.
              </p>
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
