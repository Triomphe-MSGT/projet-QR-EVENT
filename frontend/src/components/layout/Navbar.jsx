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
  Clock
} from "lucide-react";
import { API_BASE_URL } from "../../slices/axiosInstance";
import { useNotifications } from "../../hooks/useNotifications";

const STATIC_BASE_URL = API_BASE_URL.replace("/api", "");

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const { token, user: reduxUser } = useSelector((state) => state.auth);
  const { data: queryUser } = useUserProfile({ enabled: !!token });
  const user = queryUser || reduxUser;

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { data: notifications } = useNotifications({ enabled: !!token });
  const unreadCount = useMemo(() => notifications?.filter((n) => !n.isRead).length || 0, [notifications]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 0);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    queryClient.clear();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;
  const role = user?.role || "Participant";

  const mainLinks = [
    { label: "Accueil", path: "/home", icon: Home },
    { label: "Événements", path: "/events", icon: Search },
    { label: "Mes Billets", path: "/my-qrcodes", icon: QrCode },
    { label: "Guide d'usage", path: "/qrevent_help", icon: BookOpen },
  ];

  if (!token) {
    return (
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-lg py-2' : 'bg-white py-4'}`}>
        <div className="max-w-[1800px] mx-auto px-8 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-4 group text-white">
            <img src="/logo.png" alt="QR Event Logo" className="w-20 h-20 md:w-24 md:h-24 object-contain transition-transform group-hover:scale-105" />
            <div className="flex flex-col leading-none">
              <span className="text-2xl md:text-3xl font-medium text-slate-900 tracking-tight">QR EVENT</span>
              <span className="text-[10px] font-normal text-orange-500 tracking-[0.2em] uppercase">Ticketing Pro</span>
            </div>
          </Link>
          
          <div className="hidden md:flex items-center gap-10">
            <Link to="/events" className="text-lg font-medium text-slate-600 hover:text-orange-500 transition-colors">Explorer</Link>
            <Link to="/qrevent_help" className="text-lg font-medium text-slate-600 hover:text-orange-500 transition-colors">Guide</Link>
            <Link to="/login" className="text-lg font-medium text-slate-600 hover:text-orange-500 transition-colors">Connexion</Link>
            <Link to="/login" className="px-8 py-3.5 bg-orange-500 text-white font-medium text-lg rounded-2xl shadow-xl shadow-orange-500/25 hover:bg-orange-600 transition-all hover:-translate-y-1 active:scale-95">
               Créer un compte
            </Link>
          </div>
          
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-slate-900 p-2">
            {menuOpen ? <X size={32} /> : <Menu size={32} />}
          </button>
        </div>
      </nav>
    );
  }

  return (
    <nav className={`fixed top-0 w-full z-30 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-md py-1.5 border-b border-slate-100' : 'bg-white py-2.5 border-b border-transparent'}`}>
      <div className="max-w-[1800px] mx-auto px-8 flex items-center justify-between">
        
        {/* Left Side: Brand & Main Navigation */}
        <div className="flex items-center gap-10">
          <Link to="/home" className="flex items-center gap-3 group">
            <img src="/logo.png" alt="QR Event Logo" className="w-28 h-28 object-contain transition-transform group-hover:rotate-6" />
            <span className="text-xl md:text-2xl font-medium text-slate-900 tracking-tight hidden xl:block">QR EVENT</span>
          </Link>

          {/* Desktop Navigation Links */}
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

        {/* Right Side: Role-specific Workspace + User Profile */}
        <div className="flex items-center gap-4">
          
          {/* Workspace Switcher (Pro View) */}
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

          {role === "Administrateur" && (
            <Link to="/admin" className="hidden xl:flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-xs font-medium rounded-xl hover:bg-black transition-all">
               <ShieldAlert size={16} className="text-red-500" />
               ADMIN
            </Link>
          )}

          <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block"></div>

          {/* Notifications */}
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

            {/* Notification Dropdown (NEW - WAS MISSING) */}
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
                          <div 
                            key={notif._id} 
                            className={`p-5 flex gap-4 hover:bg-slate-50 transition-all cursor-pointer group ${!notif.isRead ? 'bg-orange-50/30' : ''}`}
                          >
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

          {/* Avatar Dropdown */}
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

            {/* Dropdown Menu */}
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
          
<button 
  onClick={() => setMenuOpen(!menuOpen)} 
  className="lg:hidden p-2 text-slate-900 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100 active:scale-95 transition-all"
>
  {menuOpen ? <X size={26} /> : <Menu size={26} />}
</button>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      {menuOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-[100] animate-in fade-in duration-300 pointer-events-auto" 
        >
          {/* Backdrop with Blur */}
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setMenuOpen(false)}></div>
          
          <div 
            className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-[0_0_100px_rgba(0,0,0,0.2)] flex flex-col animate-in slide-in-from-right duration-500 ease-out z-[110]" 
            onClick={e => e.stopPropagation()}
          >
            {/* Drawer Header with Logo */}
            <div className="p-8 border-b border-slate-50 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center p-0.5 shadow-lg shadow-orange-500/20">
                  <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-black text-slate-900 leading-none">QR-EVENT</span>
                  <span className="text-[7px] font-bold text-orange-500 uppercase tracking-widest leading-none mt-1">Version Mobile</span>
                </div>
              </div>
              <button 
                onClick={() => setMenuOpen(false)}
                className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"
              >
                <X size={24} />
              </button>
            </div>

            {/* Profile Brief in Drawer */}
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

            {/* Scrollable Navigation Area */}
            <div className="flex-1 overflow-y-auto px-6 py-10 space-y-12 custom-scrollbar">
               {/* Main Links */}
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
               
               {/* Pro Workspace Links */}
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

               {/* Account Management */}
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

            {/* Logout/Login Bottom Area */}
            <div className="p-8 border-t border-slate-50 sticky bottom-0 bg-white">
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
      )}
    </nav>
  );
};

export default Navbar;
