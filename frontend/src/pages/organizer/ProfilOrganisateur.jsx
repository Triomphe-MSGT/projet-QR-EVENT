import React from "react";

import { useUserProfile } from "../../slices/userprofilSlice";
import ProfileHeader from "../../features/user/components/ProfileHeader";

const SwitchModeButton = () => (
  <button className="text-blue-500 font-semibold py-2 px-6 rounded-full transition duration-150 flex items-center justify-center mb-6">
    <span className="mr-1"></span> Passer en mode Participant
  </button>
);

const LogoutButton = () => (
  <button
    onClick={() => {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }}
    className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-xl transition duration-150 shadow-md mt-4"
  >
    Se déconnecter
  </button>
);

const OrganizerProfile = () => {
  const { data: profile, isLoading, error } = useUserProfile();

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Chargement du profil...</p>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">Erreur : {error.message}</p>
      </div>
    );

  const avatarSource = profile?.avatarUrl || "/assets/react.svg";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-16">
      <main className="flex-grow p-4 mx-auto w-full max-w-7xl flex flex-col items-center">
        <ProfileHeader
          name={profile?.name || "Utilisateur"}
          info="Organisateur"
          role={profile?.role || "organizer"}
          avatarUrl={avatarSource}
        >
          <SwitchModeButton />
        </ProfileHeader>

        <LogoutButton />
      </main>
    </div>
  );
};

export default OrganizerProfile;
