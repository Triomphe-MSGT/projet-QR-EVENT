// src/components/admin/UserCards.jsx
import React from "react";
import { useAllUsers } from "../../../hooks/useAdmin"; // ✅ Utilise le hook admin

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
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
       {[
         { label: "Total", count: totalUsers, color: "bg-blue-500" },
         { label: "Participants", count: participantCount, color: "bg-emerald-500" },
         { label: "Organisateurs", count: organizerCount, color: "bg-purple-500" },
         { label: "Admins", count: adminCount, color: "bg-red-500" }
       ].map((item, i) => (
         <div key={i} className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 flex flex-col items-center justify-center text-center space-y-2 hover:bg-white hover:shadow-xl transition-all group">
            <div className={`w-2 h-2 rounded-full ${item.color} mb-2 shadow-lg shadow-${item.color.split('-')[1]}-500/20`}></div>
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{item.label}</p>
            <p className="text-3xl font-black text-slate-500 group-hover:text-slate-900 transition-colors uppercase tracking-tighter">{item.count}</p>
         </div>
       ))}
    </div>
  );
};

export default UserCards;
