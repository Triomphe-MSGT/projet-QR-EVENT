import React, { useState } from "react";
import {
  useUserProfile,
  useUpdateProfile,
  useUploadAvatar,
  useUserEvents,
} from "../hooks/useUserProfile";
import ProfileEditModal from "./ProfileEditModal";
import MainLayout from "../components/layouts/MainLayout";
import QrCodeDisplay from "../components/ui/QrCodeDisplay"; // ⭐ Importation du composant QR Code

// --- Fonctions utilitaires pour le style (déplacées ici pour la clarté) ---

const getHash = (str) => {
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
  if (!title) {
    return { tag: "EVT", bgColor: "bg-gray-100", textColor: "text-gray-700" };
  }
  const firstWord = title.split(/\s+/)[0];
  const tag = firstWord.substring(0, 4).toUpperCase();
  const hash = getHash(title);
  const colorIndex = Math.abs(hash) % colorPalettes.length;
  return { tag, ...colorPalettes[colorIndex] };
};

const ProfilePage = () => {
  const { data: user, isLoading, error } = useUserProfile();
  const {
    mutate: updateProfile,
    isPending: isUpdating,
    error: updateError,
    isSuccess,
  } = useUpdateProfile();
  const { mutate: uploadAvatar } = useUploadAvatar();
  const {
    data: events,
    isLoading: loadingEvents,
    error: eventError,
  } = useUserEvents();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (isLoading)
    return (
      <div className="text-center mt-8 text-gray-600 dark:text-gray-300">
        Chargement du profil...
      </div>
    );
  if (error)
    return (
      <div className="text-red-600 dark:text-red-400 text-center mt-8">
        Erreur : {error.message}
      </div>
    );

  return (
    <MainLayout>
      <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8 transition-colors duration-500 bg-gray-50 dark:bg-[#18191a] min-h-screen">
        {/* --- Section Profil --- */}
        <div className="bg-white dark:bg-[#242526] shadow-md dark:shadow-none rounded-2xl p-6 text-center transition-colors duration-500">
          <div className="relative w-28 h-28 mx-auto mb-4">
            <img
              src={user.avatarUrl}
              alt="avatar"
              className="w-28 h-28 rounded-full mx-auto object-cover border-4 border-blue-500"
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-[#E4E6EB]">
            {user.username}
          </h1>
          <p className="text-gray-500 dark:text-[#B0B3B8]">{user.email}</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            Modifier le profil
          </button>
        </div>

        {/* --- Section Événements de l'utilisateur (MISE À JOUR) --- */}
        <div className="bg-white dark:bg-[#242526] shadow-md dark:shadow-none rounded-2xl p-6 transition-colors duration-500">
          <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-[#E4E6EB]">
            Mes événements
          </h2>

          {loadingEvents ? (
            <p className="text-gray-500 dark:text-[#B0B3B8]">
              Chargement des événements...
            </p>
          ) : eventError ? (
            <p className="text-red-600 dark:text-red-400">
              Erreur : {eventError.message}
            </p>
          ) : events && events.length > 0 ? (
            <div className="space-y-4">
              {events.map((event) => {
                // On suppose que l'objet `event` contient `name`, `date` et `qrCodeData`
                const { tag, bgColor, textColor } = getEventTagAndColor(
                  event.name
                );

                return (
                  <div
                    key={event.id}
                    className="flex items-start bg-gray-50 dark:bg-gray-800 p-4 rounded-xl shadow-sm"
                  >
                    <div
                      className={`w-14 h-14 rounded-lg flex flex-col items-center justify-center mr-4 ${bgColor} ${textColor} font-semibold text-xs leading-none flex-shrink-0`}
                    >
                      <span className="text-center">{tag}</span>
                    </div>
                    <div className="flex-grow">
                      <p className="font-semibold text-gray-800 dark:text-white text-base">
                        {event.name}
                      </p>
                      <span className="text-gray-500 dark:text-gray-400 text-sm">
                        {event.date}
                      </span>
                    </div>
                    {event.qrCodeData && (
                      <div className="ml-4 flex-shrink-0">
                        <QrCodeDisplay value={event.qrCodeData} size={80} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-[#B0B3B8]">
              Aucun événement trouvé.
            </p>
          )}
        </div>

        {/* --- Modal de modification --- */}
        {isModalOpen && (
          <ProfileEditModal
            user={user}
            onClose={() => setIsModalOpen(false)}
            onUpdate={updateProfile}
            onUploadPhoto={uploadAvatar}
            isUpdating={isUpdating}
            updateError={updateError}
            isUpdateSuccess={isSuccess}
          />
        )}
      </div>
    </MainLayout>
  );
};

export default ProfilePage;
