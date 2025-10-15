import React, { useState } from "react";
import {
  useUserProfile,
  useUpdateProfile,
  useUploadAvatar,
  useUserEvents,
} from "../hooks/useUserProfile";
import ProfileEditModal from "../components/ProfileEditModal";
import MainLayout from "../components/layouts/MainLayout";

const ProfilePage = () => {
  // --- 1️⃣ Récupération du profil utilisateur ---
  const { data: user, isLoading, error } = useUserProfile();

  // --- 2️⃣ Hooks pour la mise à jour et upload d’avatar ---
  const {
    mutate: updateProfile,
    isPending: isUpdating,
    error: updateError,
    isSuccess,
  } = useUpdateProfile();

  const { mutate: uploadAvatar } = useUploadAvatar();

  // --- 3️⃣ Récupération des événements de l'utilisateur ---
  const {
    data: events,
    isLoading: loadingEvents,
    error: eventError,
  } = useUserEvents();

  // --- 4️⃣ Gestion du modal ---
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- États de chargement / erreur ---
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
          {/* Avatar */}
          <div className="relative w-28 h-28 mx-auto mb-4">
            <img
              src={user.avatarUrl}
              alt="avatar"
              className="w-28 h-28 rounded-full mx-auto object-cover border-4 border-blue-500"
            />
          </div>

          {/* Infos utilisateur */}
          <h1 className="text-2xl font-bold text-gray-800 dark:text-[#E4E6EB]">
            {user.username}
          </h1>
          <p className="text-gray-500 dark:text-[#B0B3B8]">{user.email}</p>

          {/* Bouton */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            Modifier le profil
          </button>
        </div>

        {/* --- Section Événements de l'utilisateur --- */}
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
            <ul className="space-y-3">
              {events.map((event) => (
                <li
                  key={event.id}
                  className="flex items-center justify-between border-b border-gray-200 dark:border-[#3A3B3C] py-3 px-2 rounded-md hover:bg-gray-50 dark:hover:bg-[#3A3B3C] transition"
                >
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-[#E4E6EB]">
                      {event.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-[#B0B3B8]">
                      {event.date} • {event.localisation}
                    </p>
                  </div>
                  <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">
                    {event.price || "Gratuit"}
                  </span>
                </li>
              ))}
            </ul>
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
