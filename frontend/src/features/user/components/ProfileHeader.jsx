import React from "react";
import defaultAvatar from "../../../assets/default-avatar.svg";

const ProfileHeader = ({ name, role, avatarUrl, children }) => {
  return (
    <div className="w-full max-w-4xl bg-white rounded-xl shadow-md p-6 flex flex-col sm:flex-row items-center sm:justify-between mb-6">
      <div className="flex items-center space-x-4">
        <img
          src={avatarUrl || defaultAvatar}
          alt={name}
          className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
        />
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{name}</h1>
          {role && <p className="text-gray-500">{role}</p>}
        </div>
      </div>
      {/* Action buttons or additional content */}
      {children && <div className="mt-4 sm:mt-0">{children}</div>}
    </div>
  );
};

export default ProfileHeader;
