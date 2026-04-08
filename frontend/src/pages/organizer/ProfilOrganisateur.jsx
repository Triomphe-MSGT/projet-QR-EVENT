import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { logout } from "../../slices/authSlice";
import { useUserProfile } from "../../hooks/useUserProfile";
import { 
  Loader2, 
  LogOut, 
  User, 
  Mail, 
  ShieldCheck, 
  Zap, 
  ChevronRight,
  Settings,
  ArrowLeft,
  LayoutDashboard
} from "lucide-react";
import { API_BASE_URL } from "../../slices/axiosInstance";

const STATIC_BASE_URL = API_BASE_URL.replace("/api", "");

const OrganizerProfile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user: authUser } = useSelector((state) => state.auth);
  const { data: profile, isLoading, error } = useUserProfile({ enabled: !!authUser });

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8">
        <Loader2 className="w-12 h-12 text-orange-500 animate-spin mb-4" />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Initialisation du profil...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mb-6">
          <ShieldCheck size={36} className="text-red-400" />
        </div>
        <h2 className="text-2xl font-black text-slate-500 tracking-tighter uppercase mb-2">Erreur d'accès</h2>
        <p className="text-slate-400 font-bold text-sm max-w-xs mb-8">Impossible de charger les données du profil.</p>
        <button onClick={() => navigate("/login")} className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all">
          Réessayer
        </button>
      </div>
    );
  }

  const avatarUrl = profile.image 
    ? (profile.image.startsWith("http") ? profile.image : `${STATIC_BASE_URL}/${profile.image}`)
    : `https://ui-avatars.com/api/?name=${profile.nom}&background=F97316&color=fff&bold=true`;

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-orange-100 pb-20">
      
      {/* HEADER BAR */}
      <header className="bg-white border-b border-slate-100 h-20 px-6 md:px-10 flex items-center justify-between sticky top-0 z-50">
         <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-orange-600 transition-colors font-black text-[10px] uppercase tracking-widest">
            <ArrowLeft size={16} /> Retour
         </button>
         <Link to="/" className="flex items-center gap-2">
            <Zap size={20} className="text-orange-600 fill-current" />
            <span className="text-lg font-black text-slate-500 tracking-tighter uppercase">QR-EVENT</span>
         </Link>
         <div className="w-10"></div> {/* Spacer */}
      </header>

      <main className="max-w-4xl mx-auto px-6 pt-12 md:pt-20 space-y-12">
         
         {/* PROFILE HERO */}
         <section className="bg-white rounded-[3rem] p-10 md:p-16 shadow-2xl shadow-slate-900/5 border border-slate-100 flex flex-col items-center text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="relative">
               <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-xl overflow-hidden bg-slate-100 ring-8 ring-slate-50">
                  <img src={avatarUrl} alt={profile.nom} className="w-full h-full object-cover" />
               </div>
               <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-orange-600 border-4 border-white rounded-2xl flex items-center justify-center text-white shadow-lg">
                  <ShieldCheck size={20} />
               </div>
            </div>

            <div className="space-y-2">
               <div className="inline-flex px-3 py-1 bg-orange-50 text-orange-600 text-[9px] font-black uppercase tracking-widest rounded-full border border-orange-100 mb-2">
                  Organisateur Certifié
               </div>
               <h1 className="text-3xl md:text-5xl font-black text-slate-500 tracking-tighter uppercase">{profile.nom}</h1>
               <p className="text-slate-400 font-bold text-sm flex items-center justify-center gap-2">
                  <Mail size={14} className="text-slate-300" /> {profile.email}
               </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
               <button 
                 onClick={() => navigate("/account-settings")}
                 className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-orange-600 transition-all flex items-center gap-3 shadow-xl shadow-slate-900/20"
               >
                  <Settings size={16} /> Éditer mes réglages
               </button>
               <button 
                 onClick={() => navigate("/dashboard")}
                 className="px-8 py-4 bg-white text-slate-500 border border-slate-200 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-3"
               >
                  <LayoutDashboard size={16} /> Tableau de Bord
               </button>
            </div>
         </section>

         {/* STATS MINI GRID */}
         <section className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {[
              { label: "Role", value: profile.role, icon: User, color: "text-blue-500" },
              { label: "Pays", value: profile.country || "Cameroun", icon: Zap, color: "text-orange-500" },
              { label: "Profession", value: profile.profession || "Organisateur", icon: Zap, color: "text-emerald-500" },
              { label: "Membre", value: "Depuis 2024", icon: Zap, color: "text-purple-500" }
            ].map((item, i) => (
              <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 text-center hover:shadow-xl transition-all">
                 <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">{item.label}</p>
                 <p className="text-xs font-black text-slate-500 uppercase tracking-tight truncate">{item.value}</p>
              </div>
            ))}
         </section>

         {/* LOGOUT BUTTON */}
         <button 
           onClick={handleLogout}
           className="w-full p-6 text-red-500 font-black text-[10px] uppercase tracking-widest border-2 border-dashed border-red-100 rounded-[2rem] hover:bg-red-50 hover:border-red-200 transition-all flex items-center justify-center gap-3"
         >
            <LogOut size={18} /> Se déconnecter de la session
         </button>

      </main>
    </div>
  );
};

export default OrganizerProfile;
