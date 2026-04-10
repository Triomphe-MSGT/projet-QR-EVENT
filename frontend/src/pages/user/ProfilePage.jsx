// src/pages/user/ProfilePage.jsx
import React, { useState, useMemo } from "react";
import MainLayout from "../../components/layout/MainLayout";
import ProfileEditModal from "../../features/user/components/ProfileEditModal";
import { 
  Loader2,
  CheckCircle2,
  Clock,
  Edit, 
  QrCode, 
  ChevronRight, 
  Phone, 
  Briefcase, 
  User2, 
  Mail, 
  Calendar, 
  MapPin, 
  Sparkles,
  Zap,
  Camera,
  Star
} from "lucide-react";
import { Link } from "react-router-dom";

import { useSelector } from "react-redux";
import {
  useUserProfile,
  useUpdateProfile,
  useUploadAvatar,
  useUserEvents,
} from "../../hooks/useUserProfile";
import { API_BASE_URL } from "../../slices/axiosInstance";
import { getSafeImageUrl } from "../../utils/imageUtils";

const STATIC_BASE_URL = API_BASE_URL.replace("/api", "");

const getHash = (str) => {
  if (!str) return 0;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash;
};

const colorPalettes = [
  { bgColor: "bg-orange-100", textColor: "text-orange-700" },
  { bgColor: "bg-amber-100", textColor: "text-amber-700" },
  { bgColor: "bg-rose-100", textColor: "text-rose-700" },
  { bgColor: "bg-emerald-100", textColor: "text-emerald-700" },
  { bgColor: "bg-blue-100", textColor: "text-blue-700" },
  { bgColor: "bg-purple-100", textColor: "text-purple-700" },
];

const getEventTagAndColor = (title) => {
  if (!title) return { tag: "EVT", bgColor: "bg-gray-100", textColor: "text-slate-500" };
  const tag = title.substring(0, 3).toUpperCase();
  const hash = getHash(title);
  const colorIndex = Math.abs(hash) % colorPalettes.length;
  return { tag, ...colorPalettes[colorIndex] };
};

const ProfilePage = () => {
  const { token } = useSelector((state) => state.auth);
  const { data: user, isLoading: isLoadingUser, isError: isUserError, error: userError } = useUserProfile({ enabled: !!token });
  const { data: eventsData, isLoading: isLoadingEvents, isError: isEventsError, error: eventsError } = useUserEvents({ enabled: !!token });
  const { mutateAsync: updateProfileAsync, isPending: isUpdating, isSuccess: isUpdateSuccess, error: updateError } = useUpdateProfile();
  const { mutate: uploadAvatar, isPending: isUploading } = useUploadAvatar();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const allEvents = useMemo(() => {
    if (!eventsData) return [];
    const organized = eventsData.organized?.map((evt) => ({ ...evt, type: "Organisateur" })) || [];
    const participated = eventsData.participated?.map((evt) => ({ ...evt, type: "Participant" })) || [];
    return [...organized, ...participated].sort((a, b) => new Date(b.startDate || 0) - new Date(a.startDate || 0));
  }, [eventsData]);

  const handleUpdateProfile = async (formData) => {
    try {
      await updateProfileAsync(formData);
      setTimeout(() => setIsEditModalOpen(false), 1500);
    } catch (error) {
      console.error("Échec de la mise à jour:", error);
    }
  };

  const handleUploadPhoto = (file) => uploadAvatar(file);

  const avatarUrl = getSafeImageUrl(user.image, 'user', user.nom);

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  if (isLoadingUser) {
    return (
      <MainLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
          <Loader2 className="w-10 h-10 text-orange-500 animate-spin mb-4" />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Accès au profil...</p>
        </div>
      </MainLayout>
    );
  }

  // Visitor (not logged in) — show a friendly prompt
  if (!user) {
    return (
      <MainLayout>
        <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6 text-center p-8">
          <div className="w-20 h-20 bg-orange-50 rounded-3xl flex items-center justify-center">
            <User2 size={36} className="text-orange-400" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-500 tracking-tighter">Profil non disponible</h2>
            <p className="text-slate-400 font-bold text-sm max-w-xs mx-auto">Vous devez être connecté pour accéder à votre profil.</p>
          </div>
          <Link to="/login" className="px-8 py-4 bg-orange-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-orange-700 transition-all shadow-lg shadow-orange-600/20 active:scale-95">
            Se connecter
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="bg-white min-h-screen font-sans selection:bg-orange-100 pb-20">
        
        {/* --- SIMPLE HEADER --- */}
        <section className="bg-slate-50/50 border-b border-slate-100 py-10 md:py-16">
           <div className="max-w-5xl mx-auto px-6">
              <div className="flex flex-col md:flex-row items-center gap-8">
                 {/* Avatar */}
                 <div className="relative shrink-0">
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-sm overflow-hidden bg-slate-100">
                       <img
                         src={avatarUrl}
                         alt={user.nom}
                         className="w-full h-full object-cover"
                       />
                       {isUploading && (
                         <div className="absolute inset-0 bg-white/60 flex items-center justify-center backdrop-blur-sm">
                           <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                         </div>
                       )}
                    </div>
                    <button 
                      onClick={() => setIsEditModalOpen(true)}
                      className="absolute bottom-1 right-1 p-2.5 bg-white text-slate-400 rounded-full shadow-md border border-slate-100 hover:text-orange-600 transition-colors"
                    >
                      <Camera size={18} />
                    </button>
                 </div>

                 {/* Basic Info */}
                 <div className="flex-1 text-center md:text-left space-y-3">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                       <span className="px-2.5 py-0.5 bg-slate-200 text-slate-500 text-[9px] font-black uppercase tracking-widest rounded-md">
                          {user.role}
                       </span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black text-slate-500 tracking-tighter">
                       {user.nom}
                    </h1>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-bold text-slate-400">
                       <div className="flex items-center gap-1.5">
                          <Mail size={14} className="text-slate-300" />
                          <span>{user.email}</span>
                       </div>
                       <div className="flex items-center gap-1.5">
                          <MapPin size={14} className="text-slate-300" />
                          <span>{user.country || "Cameroun"}</span>
                       </div>
                    </div>
                 </div>

                 {/* Actions */}
                 <div className="flex flex-col sm:flex-row items-center gap-3">
                    <Link
                      to="/my-qrcodes"
                      className="w-full sm:w-auto px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-orange-600 transition-all flex items-center justify-center gap-2"
                    >
                      <QrCode size={14} className="text-orange-500" /> Mes accès
                    </Link>
                    <button
                      onClick={() => setIsEditModalOpen(true)}
                      className="w-full sm:w-auto px-6 py-3 bg-white text-slate-500 border border-slate-200 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                    >
                      <Edit size={14} /> Modifier
                    </button>
                 </div>
              </div>
           </div>
        </section>

        {/* --- MAIN CONTENT --- */}
        <div className="max-w-5xl mx-auto px-6 py-12 md:py-16 space-y-16">
           
           {/* Detailed Information Grid */}
           <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: "Profession", value: user.profession || "Épicurien", icon: Briefcase },
                { label: "Phone", value: user.phone || "-- -- -- --", icon: Phone },
                { label: "Sexe", value: user.sexe || "Non défini", icon: User2 }
              ].map((info, i) => (
                <div key={i} className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100 flex items-center gap-4">
                   <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-300 border border-slate-100 shadow-sm">
                      <info.icon size={18} />
                   </div>
                   <div>
                      <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{info.label}</p>
                      <p className="text-sm font-black text-slate-500">{info.value}</p>
                   </div>
                </div>
              ))}
           </section>

           {/* Activity List */}
           <section className="space-y-8">
              <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                 <div className="flex items-center gap-3">
                    <Clock size={20} className="text-slate-400" />
                    <h2 className="text-xl md:text-2xl font-black text-slate-500 uppercase tracking-tighter">Historique des Événements</h2>
                 </div>
                 <span className="px-3 py-1 bg-slate-50 text-slate-400 text-[10px] font-black rounded-lg border border-slate-100">
                    {allEvents.length} activités
                 </span>
              </div>

              <div className="space-y-4">
                 {isLoadingEvents ? (
                   <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-4">
                      <Loader2 className="w-8 h-8 animate-spin" />
                      <p className="text-[9px] font-black uppercase tracking-widest">Chargement des données...</p>
                   </div>
                 ) : allEvents.length > 0 ? (
                   allEvents.map((event) => (
                     <Link
                       key={`${event._id || event.id}-${event.type}`}
                       to={`/events/${event._id || event.id}`}
                       className="flex flex-col md:flex-row md:items-center justify-between p-5 md:p-6 bg-white border border-slate-100 rounded-2xl hover:border-orange-200 hover:bg-orange-50/20 transition-all group"
                     >
                        <div className="flex items-center gap-5">
                           <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center font-black group-hover:bg-slate-900 group-hover:text-white transition-all shrink-0">
                              {event.name?.substring(0, 2).toUpperCase()}
                           </div>
                           <div className="space-y-1 min-w-0">
                              <h3 className="text-base font-black text-slate-500 truncate group-hover:text-orange-600">{event.name}</h3>
                              <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                                 <span className={event.type === "Organisateur" ? "text-green-600" : "text-orange-500"}>{event.type}</span>
                                 <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                                 <span>{event.city || "Lieu Standard"}</span>
                              </div>
                           </div>
                        </div>
                        <div className="mt-4 md:mt-0 flex items-center justify-between md:justify-end gap-6">
                           <div className="text-right hidden sm:block">
                              <p className="text-[10px] font-black text-slate-500">{formatDate(event.startDate)}</p>
                              <p className="text-[9px] font-bold text-slate-300 uppercase">{event.time || "--:--"}</p>
                           </div>
                           <ChevronRight size={18} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                        </div>
                     </Link>
                   ))
                 ) : (
                   <div className="py-20 text-center bg-slate-50 border-2 border-dashed border-slate-100 rounded-2xl">
                      <p className="text-slate-400 font-bold text-sm">Aucun événement enregistré.</p>
                   </div>
                 )}
              </div>
           </section>

        </div>

        {/* Management Modal */}
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
