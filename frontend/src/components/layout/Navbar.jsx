import React, { useState, useMemo, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../slices/authSlice";
import { useUserProfile } from "../../hooks/useUserProfile";
import { 
  Menu, X, Bell, ChevronDown, 
  Home, Search, QrCode, LayoutDashboard, 
  PlusCircle, Scan, Settings, UserCircle, 
  LogOut, ShieldAlert, BookOpen, ExternalLink,
  Clock,
  ArrowRight
} from "lucide-react";
import { API_BASE_URL } from "../../slices/axiosInstance";
import { useNotifications, useMarkAsRead, useMarkSingleAsRead } from "../../hooks/useNotifications";

// Configuration de l'URL de base pour les fichiers statiques (ex: images de profil)
const STATIC_BASE_URL = API_BASE_URL.replace("/api", "");

/**
 * Composant Navbar : Gère la navigation principale, le profil utilisateur,
 * les notifications et le menu mobile (hamburger) pour toute l'application.
 */
const Navbar = () => {
  // --- Hooks de Routage et Redux ---
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  // --- État de l'Authentification ---
  const { token, user: reduxUser } = useSelector((state) => state.auth);
  
  // Récupération des données profil via React Query (si connecté)
  const { data: queryUser } = useUserProfile({ enabled: !!token });
  const user = queryUser || reduxUser; // Utilise le profil frais de l'API ou celui du store

  // --- États Locaux UI ---
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false); // Menu déroulant profil
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false); // Menu déroulant notifications
  const [scrolled, setScrolled] = useState(false); // Détecte si la page a défilé (pour le style)

  // --- Notifications ---
  const { data: notifications } = useNotifications({ enabled: !!token });
  const markAsReadMutation = useMarkAsRead();
  const markSingleAsReadMutation = useMarkSingleAsRead();
  
  // Calcul du nombre de notifications non lues
  const unreadCount = useMemo(() => notifications?.filter((n) => !n.isRead).length || 0, [notifications]);

  // --- Effet : Gestion du défilement (Navbar translucide/réduite) ---
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 0);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // --- Actions ---
  const handleLogout = () => {
    dispatch(logout()); // Efface le token du store
    queryClient.clear(); // Nettoie le cache React Query
    navigate("/login");
  };

  // Vérifie si un lien est actif pour le style visuel
  const isActive = (path) => location.pathname === path;
  
  // Rôle de l'utilisateur (Participant par défaut)
  const role = user?.role || "Participant";

  // Configuration des liens de navigation principaux
  const mainLinks = [
    { label: "Accueil", path: "/home", icon: Home },
    { label: "Événements", path: "/events", icon: Search },
    { label: "Mes Billets", path: "/my-qrcodes", icon: QrCode },
    { label: "Guide d'usage", path: "/qrevent_help", icon: BookOpen },
  ];

  // ==========================================
  // RENDER : VUE PUBLIQUE (NON CONNECTÉ)
  // ==========================================
  if (!token) {
    return (
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-md' : 'bg-white'}`}>
        <div className="max-w-[1800px] mx-auto px-4 md:px-8 flex items-center justify-between h-12 md:h-16">
          <Link to="/home" className="flex items-center gap-2 group shrink-0">
             <img src="/logo.png" alt="Logo" className="h-8 md:h-12 w-auto object-contain transition-transform group-hover:scale-105" />
             <span className="text-sm md:text-2xl font-black text-slate-500 uppercase tracking-tighter hidden sm:inline-block">QR <span className="text-orange-600">Event</span></span>
          </Link>
          
          <div className="flex items-center gap-3">
             <Link to="/login" className="px-4 py-1.5 md:px-8 md:py-3 bg-orange-600 text-white text-[10px] md:text-xs font-black uppercase tracking-widest rounded-full hover:bg-orange-700 transition-all shadow-lg shadow-orange-600/20 active:scale-95">
                Connexion
             </Link>
          </div>
        </div>
      </nav>
    );
  }

  // ==========================================
  // RENDER : VUE MEMBRE (CONNECTÉ)
  // ==========================================
  return (
    <>
      {/* Navbar Principale Connectée */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-md h-12 md:h-16' : 'bg-white h-14 md:h-20'}`}>
        <div className="max-w-[1800px] mx-auto px-4 md:px-8 flex items-center justify-between h-full">
          
          {/* Section Gauche : Logo */}
          <div className="flex items-center gap-4">
             <Link to="/home" className="flex items-center group shrink-0">
                <img src="/logo.png" alt="QR-EVENT" className="h-8 md:h-12 w-auto object-contain transition-transform group-hover:scale-105" />
                <span className="text-sm md:text-2xl font-black text-slate-500 uppercase tracking-tighter hidden sm:inline-block">QR <span className="text-orange-600">Event</span></span>
             </Link>
          </div>

          {/* Navigation Desktop (Cachée sur mobile) */}
          <div className="hidden lg:flex items-center gap-2">
            {mainLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-medium transition-all ${
                  isActive(link.path)
                    ? "bg-orange-50 text-orange-600"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-500"
                }`}
              >
                <link.icon size={20} strokeWidth={isActive(link.path) ? 2.5 : 2} />
                {link.label}
              </Link>
            ))}
          </div>

          {/* Actions Droite (Notifications, Profil) */}
          <div className="flex items-center gap-2 md:gap-4">
             
             {/* Raccourci Dashboard pour Admin/Organisateur (Desktop uniquement) */}
             {(role === "Administrateur" || role === "Organisateur") && (
               <div className="hidden md:flex items-center bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                  <Link 
                    to="/dashboard" 
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${isActive('/dashboard') ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:text-slate-500'}`}
                  >
                    <LayoutDashboard size={18} />
                    Dashboard
                  </Link>
                  <Link 
                    to="/scan" 
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${isActive('/scan') ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'text-slate-500 hover:text-slate-500'}`}
                  >
                    <Scan size={18} />
                    Scan
                  </Link>
                  <Link 
                    to="/createevent" 
                    className="flex items-center gap-2 px-4 py-2 ml-1 bg-orange-500 text-white rounded-xl text-sm font-medium hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 active:scale-95"
                  >
                    <PlusCircle size={18} />
                    Créer
                  </Link>
               </div>
             )}

             {/* Badge Spécial Administrateur (Optionnel, restauré selon 'avant') */}
             {role === "Administrateur" && (
               <Link to="/admin" className="hidden xl:flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-xs font-medium rounded-xl hover:bg-black transition-all">
                  <ShieldAlert size={16} className="text-red-500" />
                  ADMIN
               </Link>
             )}

             {/* Cloche de Notifications */}
             <div className="relative">
                <button 
                  onClick={(e) => { 
                    e.preventDefault(); 
                    e.stopPropagation(); 
                    setNotifDropdownOpen(!notifDropdownOpen); 
                    setProfileDropdownOpen(false); 
                  }}
                  className={`p-2.5 md:p-3 rounded-2xl transition-all relative ${notifDropdownOpen ? 'bg-orange-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                >
                  <Bell size={18} className={`${unreadCount > 0 ? 'animate-swing' : ''} md:w-5 md:h-5`} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-600 text-white text-[8px] font-black flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Panneau Notifications Déroulant */}
                {notifDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40 bg-black/5" onClick={() => setNotifDropdownOpen(false)}></div>
                    <div className="absolute top-full right-0 mt-4 w-80 md:w-96 bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden z-[100] animate-in fade-in slide-in-from-top-4 duration-300">
                      <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                        <span className="text-sm font-black uppercase tracking-widest text-slate-500">Notifications</span>
                        <button onClick={() => setNotifDropdownOpen(false)} className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 hover:text-slate-500 transition-colors">
                          <X size={16} />
                        </button>
                      </div>
                      <div className="max-h-[400px] overflow-y-auto">
                        {notifications?.length > 0 ? (
                          <div className="divide-y divide-slate-50">
                            {notifications.map((notif) => (
                              <div 
                                key={notif._id} 
                                onClick={() => !notif.isRead && markSingleAsReadMutation.mutate(notif._id)}
                                className={`p-5 flex gap-4 hover:bg-slate-50 transition-all cursor-pointer group ${!notif.isRead ? 'bg-orange-50/30' : ''}`}
                              >
                                 <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all ${!notif.isRead ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'}`}>
                                    <Bell size={18} />
                                 </div>
                                 <div className="flex-1 min-w-0 relative">
                                    <p className={`text-xs leading-snug ${!notif.isRead ? 'font-black text-slate-600' : 'font-bold text-slate-400'}`}>
                                      {notif.message}
                                    </p>
                                    <p className="text-[9px] text-slate-400 font-black uppercase mt-1.5">{new Date(notif.createdAt).toLocaleDateString()}</p>
                                    {!notif.isRead && (
                                      <div className="absolute top-0 -right-1 w-2 h-2 bg-orange-600 rounded-full"></div>
                                    )}
                                 </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-12 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">Pas de notifications</div>
                        )}
                      </div>
                      <div className="p-4 bg-slate-50 text-center border-t border-slate-100">
                         <button 
                           onClick={() => markAsReadMutation.mutate()} 
                           disabled={markAsReadMutation.isPending || unreadCount === 0}
                           className="text-[10px] font-black uppercase tracking-widest text-orange-600 hover:tracking-widest disabled:opacity-30 transition-all"
                         >
                            Tout marquer comme lu
                         </button>
                      </div>
                    </div>
                  </>
                )}
             </div>

             {/* Menu Profil */}
             <div className="relative">
                <button 
                  onClick={() => { setProfileDropdownOpen(!profileDropdownOpen); setNotifDropdownOpen(false); }}
                  className={`p-1 rounded-2xl border transition-all ${profileDropdownOpen ? 'bg-orange-50 border-orange-200' : 'bg-white border-slate-200'}`}
                >
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl overflow-hidden flex items-center justify-center shrink-0 relative bg-slate-100">
                    {user?.image || user?.profilePicture ? (
                      <img 
                        src={`${STATIC_BASE_URL}/${user?.image || user?.profilePicture}`} 
                        className="w-full h-full object-cover" 
                        alt="Profile" 
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : null}
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-orange-400 to-amber-600">
                      <span className="text-white text-xs md:text-sm font-black italic">
                        {(user?.firstName || user?.name || "I").charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                </button>

                {profileDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40 bg-black/5" onClick={() => setProfileDropdownOpen(false)}></div>
                    <div className="absolute top-full right-0 mt-4 w-64 bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden z-[100] animate-in fade-in slide-in-from-top-4 duration-300">
                      <div className="p-5 border-b border-slate-50 bg-slate-50/50">
                        <p className="text-xs font-black text-slate-600 truncate">{user?.name || "Membre"}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{role}</p>
                      </div>
                      <div className="p-2 grid gap-1">
                        <Link to="/user-profile" className="flex items-center gap-3 p-3 rounded-xl text-[10px] font-black uppercase text-slate-500 hover:bg-slate-50 transition-colors" onClick={() => setProfileDropdownOpen(false)}>
                          <UserCircle size={18} /> Profil
                        </Link>
                        <Link to="/account-settings" className="flex items-center gap-3 p-3 rounded-xl text-[10px] font-black uppercase text-slate-500 hover:bg-slate-50 transition-colors" onClick={() => setProfileDropdownOpen(false)}>
                          <Settings size={18} /> Paramètres
                        </Link>
                        {/* Lien Guide Mobile/Général */}
                        <Link to="/qrevent_help" className="flex items-center gap-3 p-3 rounded-xl text-[10px] font-black uppercase text-slate-500 hover:bg-slate-50 transition-colors" onClick={() => setProfileDropdownOpen(false)}>
                          <BookOpen size={18} /> Aide & Guide
                        </Link>
                        <button onClick={() => { handleLogout(); setProfileDropdownOpen(false); }} className="flex items-center gap-3 p-3 rounded-xl text-[10px] font-black uppercase text-red-500 hover:bg-red-50 transition-colors w-full text-left">
                          <LogOut size={18} /> Déconnexion
                        </button>
                      </div>
                    </div>
                  </>
                )}
             </div>
          </div>
        </div>
      </nav>

      {/* Styles globaux pour animations */}
      <style>{`
        @keyframes swing {
          0%, 100% { transform: rotate(0deg); }
          20% { transform: rotate(15deg); }
          40% { transform: rotate(-10deg); }
          60% { transform: rotate(5deg); }
          80% { transform: rotate(-5deg); }
        }
        .animate-swing { animation: swing 1s ease-in-out infinite; transform-origin: top center; }
      `}</style>
    </>
  );
};

export default Navbar;
