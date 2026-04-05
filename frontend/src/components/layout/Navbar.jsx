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
import { useNotifications } from "../../hooks/useNotifications";

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
  const [menuOpen, setMenuOpen] = useState(false); // État du menu hamburger (mobile)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false); // Menu déroulant profil
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false); // Menu déroulant notifications
  const [scrolled, setScrolled] = useState(false); // Détecte si la page a défilé (pour le style)

  // --- Notifications ---
  const { data: notifications } = useNotifications({ enabled: !!token });
  // Calcul du nombre de notifications non lues
  const unreadCount = useMemo(() => notifications?.filter((n) => !n.isRead).length || 0, [notifications]);

  // --- Effet : Gestion du défilement (Navbar translucide/réduite) ---
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 0);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // --- Effet : Stabilisation Menu Mobile (Verrouillage du scroll body) ---
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [menuOpen]);

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
    <>
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-lg py-2' : 'bg-white py-4'}`}>
        <div className="max-w-[1800px] mx-auto px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Trigger Menu Mobile (Gauche) */}
            <button 
              onClick={() => setMenuOpen(true)} 
              className="md:hidden p-3 bg-slate-50 text-slate-900 rounded-2xl hover:bg-slate-100 active:scale-95 transition-all shadow-sm"
            >
              <Menu size={28} />
            </button>
            
            {/* Branding Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <img src="/logo.png" alt="QR Event Logo" className="w-20 h-20 md:w-28 md:h-28 object-contain transition-transform group-hover:rotate-6 shrink-0" />
              <div className="flex flex-col leading-none">
                <span className="text-xl md:text-3xl font-black text-slate-900 tracking-tight uppercase">QR <span className="text-orange-600">Event</span></span>
                <span className="text-[7px] font-black text-orange-500 tracking-[0.3em] uppercase hidden sm:block">Ticketing Pro</span>
              </div>
            </Link>
          </div>
          
          {/* Liens Desktop (Mode Public) */}
          <div className="hidden md:flex items-center gap-10">
            <Link to="/events" className="text-lg font-medium text-slate-600 hover:text-orange-500 transition-colors">Explorer</Link>
            <Link to="/qrevent_help" className="text-lg font-medium text-slate-600 hover:text-orange-500 transition-colors">Guide</Link>
            <Link to="/login" className="text-lg font-medium text-slate-600 hover:text-orange-500 transition-colors">Connexion</Link>
            <Link to="/login" className="px-8 py-3.5 bg-orange-500 text-white font-medium text-lg rounded-2xl shadow-xl shadow-orange-500/25 hover:bg-orange-600 transition-all hover:-translate-y-1 active:scale-95">
               Créer un compte
            </Link>
          </div>
        </div>
      </nav>
      {/* Mobile Drawer (Public) */}
      {renderMobileDrawer()}
    </>
    );
  }

  // ==========================================
  // RENDER : VUE MEMBRE (CONNECTÉ)
  // ==========================================
  // Fonction de rendu du Drawer Mobile (déplacée hors du nav pour le z-index)
  const renderMobileDrawer = () => {
    if (!menuOpen) return null;
    return (
      <div className="lg:hidden fixed inset-0 z-[9999] pointer-events-auto">
        {/* Voile d'arrière-plan avec flou */}
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" 
          onClick={() => setMenuOpen(false)}
        ></div>
        
        {/* Panneau de contenu (Coulisse depuis la gauche) */}
        <div 
          className="absolute left-0 top-0 bottom-0 w-[280px] max-w-[85vw] bg-white shadow-[0_0_100px_rgba(0,0,0,0.3)] flex flex-col animate-in slide-in-from-left duration-500 ease-out z-[10000] opacity-100" 
          onClick={e => e.stopPropagation()}
        >
          {/* Header du Drawer avec Logo */}
          <div className="p-8 border-b border-slate-50 flex items-center justify-between shrink-0 bg-white">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-orange-500 flex items-center justify-center p-0.5 shadow-lg shadow-orange-500/20">
                <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black text-slate-900 leading-none">QR-EVENT</span>
                <span className="text-[8px] font-bold text-orange-500 uppercase tracking-[0.2em] leading-none mt-1.5">Version Mobile</span>
              </div>
            </div>
            <button 
              onClick={() => setMenuOpen(false)}
              className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"
            >
              <X size={24} />
            </button>
          </div>

          {/* Résumé Profil dans le Drawer (si connecté) */}
          {token && (
            <div className="p-8 bg-slate-50/50 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-[1.2rem] overflow-hidden bg-white border-2 border-white shadow-sm flex items-center justify-center shrink-0">
                  {user?.image ? (
                    <img src={`${STATIC_BASE_URL}/${user.image}`} className="w-full h-full object-cover" alt="Avatar" />
                  ) : (
                    <div className="w-full h-full bg-orange-100 text-orange-600 font-black text-xl flex items-center justify-center">
                      {user?.name?.charAt(0).toUpperCase() || "?"}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-black text-slate-900 truncate tracking-tight">{user?.name || "Profil Membre"}</p>
                  <span className="inline-block px-2 py-0.5 bg-orange-100 text-orange-600 text-[8px] font-black uppercase rounded-md tracking-wider border border-orange-200/30">
                    {role}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Zone de Navigation Scorable */}
          <div className="flex-1 overflow-y-auto px-6 py-10 space-y-12 custom-scrollbar bg-white">
             {/* Liens Principaux */}
             <div className="space-y-2">
                <p className="px-4 pb-2 text-[8px] font-black uppercase text-slate-300 tracking-[0.3em]">Navigation Principale</p>
                {mainLinks.map((link) => (
                  <Link 
                    key={link.path} 
                    to={link.path} 
                    className={`flex items-center justify-between p-4 rounded-2xl font-black transition-all ${isActive(link.path) ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`} 
                    onClick={() => setMenuOpen(false)}
                  >
                    <div className="flex items-center gap-4">
                      <link.icon size={20} className={isActive(link.path) ? "text-white" : "text-slate-400 group-hover:text-slate-900"} /> 
                      <span className="text-xs uppercase tracking-tight">{link.label}</span>
                    </div>
                    <ChevronDown size={14} className={`-rotate-90 opacity-40 ${isActive(link.path) ? 'text-white' : ''}`} />
                  </Link>
                ))}
             </div>
             
             {/* Console Pro Mobile */}
             {(role === "Organisateur" || role === "Administrateur") && (
                <div className="space-y-2 bg-slate-900 p-6 rounded-[2.5rem] shadow-xl group">
                   <p className="px-2 pb-4 text-[8px] font-black uppercase text-slate-500 tracking-[0.3em]">Console Pro</p>
                   <div className="grid gap-2">
                      <Link to="/dashboard" className="flex items-center gap-4 p-4 text-white font-black text-xs uppercase tracking-tight hover:bg-white/10 rounded-xl transition-all" onClick={() => setMenuOpen(false)}>
                        <LayoutDashboard size={20} className="text-orange-500" /> 
                        <span>Dashboard</span>
                      </Link>
                      <Link to="/scan" className="flex items-center gap-4 p-4 text-white font-black text-xs uppercase tracking-tight hover:bg-white/10 rounded-xl transition-all" onClick={() => setMenuOpen(false)}>
                        <Scan size={20} className="text-emerald-500" /> 
                        <span>Outil Scan QR</span>
                      </Link>
                      <Link to="/createevent" className="flex items-center justify-center gap-3 p-4 bg-orange-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-orange-600/20 mt-4 active:scale-95 transition-transform" onClick={() => setMenuOpen(false)}>
                        <PlusCircle size={20} /> 
                        <span>Nouveau Projet</span>
                      </Link>
                   </div>
                </div>
             )}

             {/* Paramètres & Aide */}
             <div className="space-y-2">
                <p className="px-4 pb-2 text-[8px] font-black uppercase text-slate-300 tracking-[0.3em]">Compte & Aide</p>
                <Link to="/user-profile" className="flex items-center gap-4 p-4 text-slate-500 font-bold hover:bg-slate-50 hover:text-slate-900 rounded-2xl transition-all" onClick={() => setMenuOpen(false)}>
                  <UserCircle size={20} /> <span className="text-xs uppercase tracking-tight">Mon Profil</span>
                </Link>
                <Link to="/account-settings" className="flex items-center gap-4 p-4 text-slate-500 font-bold hover:bg-slate-50 hover:text-slate-900 rounded-2xl transition-all" onClick={() => setMenuOpen(false)}>
                  <Settings size={20} /> <span className="text-xs uppercase tracking-tight">Paramètres</span>
                </Link>
             </div>
          </div>

          {/* Pied de Menu Mobile (Déconnexion) */}
          <div className="p-8 border-t border-slate-50 sticky bottom-0 bg-white shadow-[0_-10px_30px_rgba(0,0,0,0.02)]">
            {token ? (
              <button 
                onClick={() => { handleLogout(); setMenuOpen(false); }}
                className="flex items-center justify-center gap-3 w-full p-5 bg-red-50 text-red-600 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-red-100 transition-colors shadow-sm"
              >
                <LogOut size={20} /> 
                <span>Se déconnecter</span>
              </button>
            ) : (
              <Link 
                to="/login" 
                className="flex items-center justify-center w-full p-5 bg-orange-600 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl shadow-orange-600/20"
                onClick={() => setMenuOpen(false)}
              >
                Connexion / Inscription
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <nav className={`fixed top-0 w-full z-40 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-md py-1.5 border-b border-slate-100' : 'bg-white py-2.5 border-b border-transparent'}`}>
        <div className="max-w-[1800px] mx-auto px-8 flex items-center justify-between">
          
          {/* Partie Gauche : Menu Mobile + Logo + Nav Desktop */}
          <div className="flex items-center gap-4 md:gap-10">
            {/* Trigger Menu Mobile (Géré avec z-index élevé) */}
            <button 
              onClick={() => setMenuOpen(true)} 
              className="lg:hidden p-3 text-slate-900 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-slate-100 active:scale-95 transition-all shadow-sm"
            >
              <Menu size={26} />
            </button>
            
            <Link to="/home" className="flex items-center gap-2 md:gap-3 group">
              <img src="/logo.png" alt="QR Event Logo" className="w-16 h-16 md:w-20 md:h-20 object-contain transition-transform group-hover:rotate-6 shrink-0" />
              <span className="text-lg md:text-2xl font-black text-slate-900 tracking-tight hidden sm:block uppercase">QR <span className="text-orange-600">Event</span></span>
            </Link>

            {/* Navigation Horizontale Desktop */}
            <div className="hidden lg:flex items-center gap-2">
              {mainLinks.map((link) => (
                <Link 
                  key={link.path} 
                  to={link.path}
                  className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-medium transition-all ${isActive(link.path) ? 'bg-orange-50 text-orange-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
                >
                  <link.icon size={20} strokeWidth={isActive(link.path) ? 2.5 : 2} />
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Partie Droite : Console Pro + Notifications + Profil */}
          <div className="flex items-center gap-4">
            
            {/* Raccourcis Espace Professionnel (Admin/Organisateur) */}
            {(role === "Organisateur" || role === "Administrateur") && (
              <div className="hidden md:flex items-center bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                 <Link 
                    to="/dashboard" 
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${isActive('/dashboard') ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:text-slate-900'}`}
                 >
                   <LayoutDashboard size={18} />
                   Dashboard
                 </Link>
                 <Link 
                    to="/scan" 
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${isActive('/scan') ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'text-slate-500 hover:text-slate-900'}`}
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

            {/* Badge Spécial Administrateur */}
            {role === "Administrateur" && (
              <Link to="/admin" className="hidden xl:flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-xs font-medium rounded-xl hover:bg-black transition-all">
                 <ShieldAlert size={16} className="text-red-500" />
                 ADMIN
              </Link>
            )}

            <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block"></div>

            {/* Gestion des Notifications Dropdown */}
            <div className="relative">
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setNotifDropdownOpen(!notifDropdownOpen); 
                  setProfileDropdownOpen(false); 
                }}
                className={`p-2.5 md:p-3 rounded-xl md:rounded-2xl transition-all relative ${notifDropdownOpen ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-900'}`}
              >
                <Bell size={22} className="md:w-6 md:h-6" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 flex h-3.5 w-3.5 md:h-4 md:w-4">
                    <span className="relative inline-flex rounded-full h-full w-full bg-red-600 text-[8px] md:text-[10px] text-white font-black items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  </span>
                )}
              </button>

              {/* Panneau Notifications Déroulant */}
              {notifDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40 bg-black/5" onClick={() => setNotifDropdownOpen(false)}></div>
                  <div className="absolute top-full right-0 mt-4 w-80 md:w-96 bg-white rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden z-[100] animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                      <span className="text-sm font-black uppercase tracking-widest text-slate-900">Notifications</span>
                      <button onClick={() => setNotifDropdownOpen(false)} className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 hover:text-slate-900 transition-colors">
                        <X size={16} />
                      </button>
                    </div>
                    
                    <div className="max-h-[400px] overflow-y-auto">
                      {notifications?.length > 0 ? (
                        <div className="divide-y divide-slate-50">
                          {notifications.map((notif) => (
                            <div key={notif._id} className={`p-5 flex gap-4 hover:bg-slate-50 transition-all cursor-pointer group ${!notif.isRead ? 'bg-orange-50/30' : ''}`}>
                               <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-orange-500 group-hover:text-white transition-all shrink-0">
                                  <Bell size={20} />
                               </div>
                               <div className="space-y-1 pr-2">
                                  <p className="text-[13px] font-bold text-slate-800 leading-snug">{notif.message}</p>
                                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                     <Clock size={12} className="text-orange-500" />
                                     {new Date(notif.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                                  </div>
                               </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-12 text-center flex flex-col items-center gap-4">
                           <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200">
                              <Bell size={32} />
                           </div>
                           <p className="text-sm font-bold text-slate-400">Aucune notification pour le moment.</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-4 bg-slate-50 text-center">
                      <button className="text-[10px] font-black uppercase tracking-widest text-orange-600 hover:tracking-[0.15em] transition-all">Tout marquer comme lu</button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Menu Profil / Avatar Dropdown */}
            <div className="hidden lg:block relative">
              <button 
                onClick={() => { setProfileDropdownOpen(!profileDropdownOpen); setNotifDropdownOpen(false); }}
                className={`flex items-center gap-2 pl-2 pr-1.5 py-1.5 rounded-2xl border transition-all ${profileDropdownOpen ? 'bg-orange-50 border-orange-200' : 'bg-white border-slate-200 hover:border-slate-300'}`}
              >
                <div className="w-9 h-9 rounded-xl overflow-hidden bg-slate-100 ring-2 ring-transparent group-hover:ring-orange-100 transition-all">
                  {user?.image ? (
                    <img src={`${STATIC_BASE_URL}/${user.image}`} className="w-full h-full object-cover" alt="Avatar" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-orange-100 text-orange-600 font-bold text-sm">
                      {user?.name?.charAt(0).toUpperCase() || "?"}
                    </div>
                  )}
                </div>
                <ChevronDown size={18} className={`text-slate-400 transition-transform duration-300 ${profileDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Menu Déroulant Profil */}
              {profileDropdownOpen && (
                <div className="absolute top-full right-0 mt-3 w-72 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="p-6 bg-slate-50/50 border-b border-slate-100">
                     <p className="text-xl font-bold text-slate-900 truncate">{user?.name || "Profil Utilisateur"}</p>
                     <p className="text-sm font-medium text-slate-500 truncate mb-3">{user?.email}</p>
                     <div className="flex items-center gap-2">
                       <span className="px-3 py-1.5 bg-orange-100 text-orange-600 text-xs font-bold uppercase rounded-lg tracking-wider border border-orange-200/50">{role}</span>
                     </div>
                  </div>
                  
                  <div className="p-3 grid gap-1">
                    <Link to="/user-profile" className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors group" onClick={() => setProfileDropdownOpen(false)}>
                      <div className="flex items-center gap-3">
                        <UserCircle size={20} className="text-slate-400 group-hover:text-orange-500" />
                        <span className="font-medium text-slate-700">Mon Profil</span>
                      </div>
                      <ChevronDown size={16} className="-rotate-90 text-slate-300" />
                    </Link>
                    <Link to="/account-settings" className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors group" onClick={() => setProfileDropdownOpen(false)}>
                      <div className="flex items-center gap-3">
                        <Settings size={20} className="text-slate-400 group-hover:text-orange-500" />
                        <span className="font-medium text-slate-700">Paramètres</span>
                      </div>
                    </Link>
                    <Link to="/qrevent_help" className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors group" onClick={() => setProfileDropdownOpen(false)}>
                      <div className="flex items-center gap-3">
                        <BookOpen size={20} className="text-slate-400 group-hover:text-orange-500" />
                        <span className="font-medium text-slate-700">Guide d'usage</span>
                      </div>
                    </Link>
                  </div>
                  
                  <div className="p-3 pt-0">
                    <button 
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full p-4 rounded-2xl text-red-600 font-medium bg-red-50 hover:bg-red-100 transition-colors"
                    >
                      <LogOut size={20} /> 
                      <span>Déconnexion</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block"></div>
          </div>
        </div>
      </nav>
      {/* Mobile Drawer (Connecté) */}
      {renderMobileDrawer()}
    </>
  );
};

export default Navbar;
