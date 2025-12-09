// src/components/admin/UserCards.jsx
import React from "react";
import { useAllUsers } from "../../hooks/useAdmin"; // ✅ Utilise le hook admin

const UserCards = () => {
  // ✅ Récupération de TOUS les utilisateurs via React Query
  const { data: users = [], isLoading, isError } = useAllUsers();

  // Calcul des statistiques directement depuis les données
  const totalUsers = users.length;
  const participantCount = users.filter((u) => u.role === "Participant").length;
  const organizerCount = users.filter((u) => u.role === "Organisateur").length;
  const adminCount = users.filter((u) => u.role === "Administrateur").length;

  if (isLoading) {
    return (
      <div className="flex flex-col sm:flex-row gap-4 mb-6 animate-pulse">
        <div className="p-4 h-24 bg-gray-200 dark:bg-gray-700 rounded-xl flex-1"></div>
        <div className="p-4 h-24 bg-gray-200 dark:bg-gray-700 rounded-xl flex-1"></div>
        <div className="p-4 h-24 bg-gray-200 dark:bg-gray-700 rounded-xl flex-1"></div>
        <div className="p-4 h-24 bg-gray-200 dark:bg-gray-700 rounded-xl flex-1"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 text-center text-red-500">
        Erreur chargement utilisateurs.
      </div>
    );
  }

  const cardStyle =
    "p-4 bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-100 dark:border-gray-700 text-center flex-1";

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className={cardStyle}>
        <h3 className="text-gray-500 dark:text-gray-400 font-semibold uppercase text-xs">
          Total Utilisateurs
        </h3>
        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
          {totalUsers}
        </p>
      </div>
      <div className={cardStyle}>
        <h3 className="text-gray-500 dark:text-gray-400 font-semibold uppercase text-xs">
          Participants
        </h3>
        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
          {participantCount}
        </p>
      </div>
      <div className={cardStyle}>
        <h3 className="text-gray-500 dark:text-gray-400 font-semibold uppercase text-xs">
          Organisateurs
        </h3>
        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
          {organizerCount}
        </p>
      </div>
      <div className={cardStyle}>
        <h3 className="text-gray-500 dark:text-gray-400 font-semibold uppercase text-xs">
          Admins
        </h3>
        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
          {adminCount}
        </p>
      </div>
    </div>
  );
};

export default UserCards;
