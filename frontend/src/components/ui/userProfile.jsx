import React from "react";
import { useSelector } from "react-redux";
import EditProfileForm from "../components/editProfil";
import { EventDetailsPage } from "../pages/participant/EventDetailsPage";
import ProfileHeader from "./ui/ProfileHeader";

const UserProfile = () => {
  const profile = useSelector((state) => state.UserProfile);
  const avatarSource = profile.avatarUrl || "assets/react.svg";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-16">
      <main className="flex-grow p-4 mx-auto w-full max-w-7xl flex flex-col items-center">
        <ProfileHeader
          name={profile.name}
          info={profile.email}
          avatarUrl={avatarSource}
        />
        <EditProfileForm />
        <EventDetailsPage />
      </main>
    </div>
  );
};

export default UserProfile;
