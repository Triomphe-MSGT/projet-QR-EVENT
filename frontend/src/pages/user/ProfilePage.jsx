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

import {
  useUserProfile,
  useUpdateProfile,
  useUploadAvatar,
} from "../../hooks/useUserProfile";
import { useUserEvents } from "../../hooks/useUserProfile";
import { API_BASE_URL } from "../../slices/axiosInstance";

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
  if (!title) return { tag: "EVT", bgColor: "bg-gray-100", textColor: "text-gray-700" };
  const tag = title.substring(0, 3).toUpperCase();
  const hash = getHash(title);
  const colorIndex = Math.abs(hash) % colorPalettes.length;
  return { tag, ...colorPalettes[colorIndex] };
};

const ProfilePage = () => {
  const { data: user, isLoading: isLoadingUser, isError: isUserError, error: userError } = useUserProfile();
  const { data: eventsData, isLoading: isLoadingEvents, isError: isEventsError, error: eventsError } = useUserEvents();
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

  const getAvatarUrl = (imagePath) => {
    if (!imagePath) return `https://ui-avatars.com/api/?name=${user?.nom || 'User'}&background=F97316&color=fff&bold=true`;
    if (imagePath.startsWith("http")) return imagePath;
    return `${STATIC_BASE_URL}/${imagePath}`;
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  if (isLoadingUser) {
    return (
      <MainLayout>
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-8">
          <Loader2 className="w-12 h-12 text-orange-500 animate-spin mb-4" />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 animate-pulse">Synchronisation du profil...</p>
        </div>
      </MainLayout>
    );
  }

  const isPremium = (eventsData?.organized?.length || 0) >= 10;

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        
        {/* --- BRANDED PROFILE CARD --- */}
        <div className="relative bg-white rounded-[3.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] border border-slate-100 overflow-hidden group">
          {/* Enhanced Gradient Banner */}
          <div className="h-48 sm:h-72 bg-gradient-to-br from-orange-400 via-orange-500 to-rose-500 relative">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute top-10 right-10 flex gap-2">
               {isPremium ? (
                 <div className="px-6 py-3 bg-amber-400 text-slate-500 rounded-2xl shadow-[0_0_20px_rgba(251,191,36,0.5)] border-2 border-white/50 text-[11px] font-black uppercase tracking-[0.15em] flex items-center gap-3 animate-in zoom-in duration-700">
                   <div className="p-1 bg-black rounded-lg shadow-inner">
                     <Star size={16} fill="currentColor" className="text-amber-400" />
                   </div>
                   <span className="drop-shadow-sm">Membre Premium</span>
                 </div>
               ) : (
                 <div className="px-5 py-2.5 bg-black/40 backdrop-blur-md rounded-2xl border border-white/20 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                   <Zap size={14} className="text-orange-400" /> Membre Standard
                 </div>
               )}
            </div>
          </div>

          <div className="px-6 md:px-14 pb-14 -mt-20 md:-mt-24 relative z-10">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-8 md:gap-14 text-center md:text-left">
              {/* Avatar Studio Style */}
              <div className="relative group/avatar">
                <div className="w-40 h-40 md:w-56 md:h-56 rounded-[3.5rem] overflow-hidden border-[10px] border-white shadow-2xl relative bg-slate-100">
                  <img
                    src={getAvatarUrl(user.image)}
                    alt={user.nom}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover/avatar:scale-110"
                  />
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-md">
                      <Loader2 className="w-10 h-10 text-white animate-spin" />
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => setIsEditModalOpen(true)}
                  className="absolute bottom-4 right-4 p-4 bg-orange-600 text-white rounded-[1.25rem] shadow-xl hover:scale-110 transition-all border-4 border-white active:scale-95"
                >
                  <Camera size={22} />
                </button>
              </div>

              {/* Identity & Actions */}
              <div className="flex-1 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                      <span className="px-4 py-1.5 text-[9px] font-black uppercase tracking-widest bg-orange-50 text-orange-600 rounded-full border border-orange-100">
                        {user.role}
                      </span>
                      {user.isVerified && (
                        <div className="w-5 h-5 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center">
                          <CheckCircle2 size={12} fill="currentColor" className="text-white" />
                        </div>
                      )}
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter leading-none">
                      {user.nom}
                    </h1>
                    <div className="flex items-center justify-center md:justify-start gap-4 text-xs font-bold text-slate-400">
                      <div className="flex items-center gap-2">
                        <Mail size={14} className="text-orange-500" />
                        <span>{user.email}</span>
                      </div>
                      <div className="hidden sm:flex items-center gap-2">
                        <MapPin size={14} className="text-orange-500" />
                        <span>{user.country || "Cameroun"}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center justify-center gap-4">
                    <Link
                      to="/my-qrcodes"
                      className="flex items-center gap-3 px-8 py-5 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-[1.03] transition-all shadow-xl active:scale-100"
                    >
                      <QrCode size={18} className="text-orange-500" /> Mes Billets
                    </Link>
                    <button
                      onClick={() => setIsEditModalOpen(true)}
                      className="flex items-center gap-3 px-8 py-5 bg-orange-50 text-orange-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-orange-100 transition-all border border-orange-200 active:scale-95"
                    >
                      <Edit size={18} /> Modifier
                    </button>
                  </div>
                </div>

                {/* Info Pills */}
                <div className="pt-6 border-t border-slate-50 grid grid-cols-1 sm:grid-cols-3 gap-6">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-orange-600 transition-colors">
                        <Briefcase size={22} />
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Profession</p>
                        <p className="text-sm font-black text-gray-900">{user.profession || "Épicurien"}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-orange-600 transition-colors">
                        <Phone size={22} />
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Contact</p>
                        <p className="text-sm font-black text-gray-900">{user.phone || "-- -- -- --"}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-orange-600 transition-colors">
                        <User2 size={22} />
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Sexe</p>
                        <p className="text-sm font-black text-gray-900">{user.sexe || "Non défini"}</p>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- ACTIVITY SECTION --- */}
        <div className="space-y-8 px-2">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-orange-600 font-black text-[10px] tracking-widest uppercase">
                <Zap size={14} className="fill-current" />
                <span>Activité récente</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tighter">Mon Espace Événementiel</h2>
            </div>
            <div className="px-6 py-3 bg-white rounded-2xl border border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest shadow-sm">
              {allEvents.length} Expériences vécues
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {isLoadingEvents ? (
              <div className="lg:col-span-2 py-24 flex flex-col items-center justify-center bg-white rounded-[3rem] border border-slate-100 shadow-sm">
                <Loader2 className="w-10 h-10 text-orange-500 animate-spin mb-4" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Récupération des données...</p>
              </div>
            ) : allEvents.length > 0 ? (
              allEvents.map((event) => {
                const { tag, bgColor, textColor } = getEventTagAndColor(event.name);
                return (
                  <Link
                    key={`${event._id || event.id}-${event.type}`}
                    to={`/events/${event._id || event.id}`}
                    className="group bg-white p-6 rounded-[2.5rem] border border-slate-100 hover:border-orange-200 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 flex items-center gap-6"
                  >
                    <div className={`w-20 h-20 rounded-[1.75rem] flex items-center justify-center shrink-0 ${bgColor} ${textColor} font-black text-xs uppercase shadow-inner group-hover:scale-110 transition-transform duration-500`}>
                      {tag}
                    </div>
                    <div className="flex-1 min-w-0 space-y-2.5">
                      <div className="flex items-center gap-3">
                        <span className={`text-[8px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest border ${
                          event.type === "Organisateur"
                            ? "bg-green-50 text-green-700 border-green-100"
                            : "bg-orange-50 text-orange-700 border-orange-100"
                        }`}>
                          {event.type}
                        </span>
                        <div className="flex items-center gap-1.5 text-[8px] font-black text-slate-400 uppercase tracking-widest">
                          <MapPin size={12} className="text-orange-500" />
                          <span className="truncate">{event.city || "Cameroun"}</span>
                        </div>
                      </div>
                      <h3 className="text-xl font-black text-gray-900 truncate group-hover:text-orange-600 transition-colors">
                        {event.name}
                      </h3>
                      <div className="flex items-center gap-3 text-xs font-bold text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={14} className="text-orange-500/50" />
                          <span>{formatDate(event.startDate)}</span>
                        </div>
                        <div className="w-1 h-1 bg-slate-200 rounded-full"></div>
                        <div className="flex items-center gap-1.5">
                          <Clock size={14} className="text-orange-500/50" />
                          <span>{event.time || "--:--"}</span>
                        </div>
                      </div>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-orange-600 group-hover:text-white transition-all shadow-sm">
                      <ChevronRight size={28} />
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="lg:col-span-2 text-center py-24 bg-white rounded-[3.5rem] border-4 border-dashed border-slate-50 mt-4">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8">
                  <Star className="w-12 h-12 text-slate-200" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">Pas encore d'aventure ?</h3>
                <p className="text-slate-400 font-bold mb-10 max-w-xs mx-auto">Commencez à explorer ou créez votre premier événement mémorable dès maintenant.</p>
                <Link to="/events" className="px-10 py-5 bg-orange-600 text-white rounded-2xl font-black text-[12px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-orange-600/30 active:scale-100">
                  Découvrir les Événements
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* --- Global Styles & Shadows --- */}
        <style dangerouslySetInnerHTML={{ __html: `
          .custom-scrollbar::-webkit-scrollbar { width: 4px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
        `}} />

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
