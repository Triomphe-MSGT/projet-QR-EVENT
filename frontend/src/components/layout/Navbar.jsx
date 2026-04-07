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

const STATIC_BASE_URL = API_BASE_URL.replace("/api", "");

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  const { token, user: reduxUser } = useSelector((state) => state.auth);
  const { data: queryUser } = useUserProfile({ enabled: !!token });
  const user = queryUser || reduxUser;

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { data: notifications } = useNotifications({ enabled: !!token });
  const markAsReadMutation = useMarkAsRead();
  const markSingleAsReadMutation = useMarkSingleAsRead();
  
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

  // Public Links (Visible for everyone)
  const publicLinks = [
    { label: "Accueil", path: "/home", icon: Home },
    { label: "Événements", path: "/events", icon: Search },
    { label: "Guide d'usage", path: "/qrevent_help", icon: BookOpen },
  ];

  // Private Links (Only for members)
  const privateLinks = [
    { label: "Mes Billets", path: "/my-qrcodes", icon: QrCode },
  ];

  // Logic to mix links based on auth state
  const mainLinks = token 
    ? [...publicLinks.slice(0, 2), ...privateLinks, publicLinks[2]] 
    : publicLinks;

  return (
    <>
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-md h-12 md:h-16' : 'bg-white h-14 md:h-20'}`}>
        <div className="max-w-[1800px] mx-auto px-4 md:px-8 flex items-center justify-between h-full">
          
          <div className="flex items-center gap-4">
             <Link to="/home" className="flex items-center group shrink-0">
                <img src="/logo.png" alt="QR-EVENT" className="h-8 md:h-12 w-auto object-contain transition-transform group-hover:scale-105" />
                <span className="text-sm md:text-2xl font-black text-slate-500 uppercase tracking-tighter hidden sm:inline-block">QR <span className="text-orange-600">Event</span></span>
             </Link>
          </div>

          <div className="hidden lg:flex items-center gap-2">
            {mainLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-medium transition-all ${
                  isActive(link.path)
                    ? "bg-orange-50 text-orange-600"
                    : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                <link.icon size={20} strokeWidth={isActive(link.path) ? 2.5 : 2} />
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2 md:gap-4">
             {!token ? (
                <Link to="/login" className="px-6 py-2 bg-orange-600 text-white text-[10px] md:text-xs font-black uppercase tracking-widest rounded-full hover:bg-orange-700 transition-all shadow-lg active:scale-95 shadow-orange-600/20">
                   Connexion
                </Link>
             ) : (
               <>
                 {(role === "Administrateur" || role === "Organisateur") && (
                   <div className="hidden md:flex items-center bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                      <Link to="/dashboard" className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${isActive('/dashboard') ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-50'}`}>
                        <LayoutDashboard size={18} /> Dashboard
                      </Link>
                      <Link to="/scan" className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${isActive('/scan') ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-50'}`}>
                        <Scan size={18} /> Scan
                      </Link>
                      <Link to="/createevent" className="flex items-center gap-2 px-4 py-2 ml-1 bg-orange-500 text-white rounded-xl text-sm font-medium hover:bg-orange-600 transition-all shadow-lg active:scale-95">
                        <PlusCircle size={18} /> Créer
                      </Link>
                   </div>
                 )}

                 <div className="relative">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setNotifDropdownOpen(!notifDropdownOpen); setProfileDropdownOpen(false); }}
                      className={`p-2.5 md:p-3 rounded-2xl transition-all relative ${notifDropdownOpen ? 'bg-orange-600 text-white' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                    >
                      <Bell size={18} className={`${unreadCount > 0 ? 'animate-swing' : ''}`} />
                      {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-600 text-white text-[8px] font-black flex items-center justify-center rounded-full border-2 border-white">{unreadCount}</span>}
                    </button>

                    {notifDropdownOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setNotifDropdownOpen(false)}></div>
                        <div className="absolute top-full right-0 mt-4 w-80 md:w-96 bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2">
                           <div className="p-5 border-b border-slate-50 flex items-center justify-between">
                              <span className="text-xs font-black uppercase text-slate-400">Notifications</span>
                              <X size={16} className="text-slate-300 cursor-pointer" onClick={() => setNotifDropdownOpen(false)} />
                           </div>
                           <div className="max-h-80 overflow-y-auto">
                              {notifications?.length > 0 ? notifications.map(notif => (
                                <div key={notif._id} className={`p-4 flex gap-3 hover:bg-slate-50 cursor-pointer ${!notif.isRead ? 'bg-orange-50/20' : ''}`} onClick={() => markSingleAsReadMutation.mutate(notif._id)}>
                                   <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${!notif.isRead ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-400'}`}><Bell size={14} /></div>
                                   <div className="flex-1 text-[11px] font-bold text-slate-500">{notif.message}</div>
                                </div>
                              )) : <div className="p-8 text-center text-[10px] text-slate-300 font-bold uppercase">Aucune notification</div>}
                           </div>
                           <button onClick={() => markAsReadMutation.mutate()} className="w-full p-4 bg-slate-50 text-[10px] font-black uppercase text-orange-600 border-t border-slate-100">Marquer tout comme lu</button>
                        </div>
                      </>
                    )}
                 </div>

                 <div className="relative">
                    <button onClick={() => { setProfileDropdownOpen(!profileDropdownOpen); setNotifDropdownOpen(false); }} className={`p-1 rounded-2xl border transition-all ${profileDropdownOpen ? 'bg-orange-50 border-orange-200' : 'bg-white border-slate-200'}`}>
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl overflow-hidden bg-gradient-to-br from-orange-400 to-amber-600 flex items-center justify-center relative">
                        {user?.image || user?.profilePicture ? (
                           <img src={`${STATIC_BASE_URL}/${user?.image || user?.profilePicture}`} className="w-full h-full object-cover" alt="" onError={(e) => e.target.style.display = 'none'} />
                        ) : null}
                        <span className="text-white text-xs font-black">{(user?.nom || user?.name || "U").charAt(0).toUpperCase()}</span>
                      </div>
                    </button>

                    {profileDropdownOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setProfileDropdownOpen(false)}></div>
                        <div className="absolute top-full right-0 mt-4 w-60 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2">
                           <div className="p-5 border-b border-slate-50 bg-slate-50/50">
                              <p className="text-xs font-black text-slate-600 truncate">{user?.name || user?.nom || "Membre"}</p>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{role}</p>
                           </div>
                           <div className="p-2 flex flex-col gap-1">
                              <Link to="/user-profile" className="flex items-center gap-3 p-3 rounded-xl text-[10px] font-black uppercase text-slate-500 hover:bg-slate-50" onClick={() => setProfileDropdownOpen(false)}><UserCircle size={18} /> Profil</Link>
                              <Link to="/account-settings" className="flex items-center gap-3 p-3 rounded-xl text-[10px] font-black uppercase text-slate-500 hover:bg-slate-50" onClick={() => setProfileDropdownOpen(false)}><Settings size={18} /> Paramètres</Link>
                              <Link to="/qrevent_help" className="flex items-center gap-3 p-3 rounded-xl text-[10px] font-black uppercase text-slate-500 hover:bg-slate-50" onClick={() => setProfileDropdownOpen(false)}><BookOpen size={18} /> Aide</Link>
                              <button onClick={handleLogout} className="flex items-center gap-3 p-3 rounded-xl text-[10px] font-black uppercase text-red-500 hover:bg-red-50 w-full text-left"><LogOut size={18} /> Déconnexion</button>
                           </div>
                        </div>
                      </>
                    )}
                 </div>
               </>
             )}
          </div>
        </div>
      </nav>

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
