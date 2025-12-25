import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { useQueryClient } from "@tanstack/react-query";

// --- Authentification & données utilisateur ---
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../slices/authSlice";
import { useUserProfile } from "../../hooks/useUserProfile";

// --- Icônes ---
import {
  Menu,
  X,
  Settings,
  Grid,
  ArrowLeft,
  Sun,
  Moon,
  UserCheck,
  Home,
  UserCircle,
  ShieldCheck,
  QrCode,
  LayoutDashboard,
  ScanLine,
  Bell,
  ChevronRight,
  LogOut,
  HelpCircle,
  PlusCircle, // Import de l'icône Plus
  Trash2, // Import de l'icône Trash2
  History,
} from "lucide-react";

// --- Import de l'URL de base ---
import { API_BASE_URL } from "../../slices/axiosInstance";
import { useMarkAsRead, useNotifications, useDeleteNotification, useDeleteAllNotifications } from "../../hooks/useNotifications"; // Assurez-vous que le chemin est correct


const STATIC_BASE_URL = API_BASE_URL.replace("/api", "");


const DefaultAvatarIcon = ({ className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 ${className}`} // Style de base
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const Navbar = () => {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  const { token, user: reduxUser } = useSelector((state) => state.auth);
  const { data: queryUser, isLoading } = useUserProfile({ enabled: !!token });
  const user = queryUser || reduxUser;

  // États des menus
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);

  // Hooks de notification
  const { data: notifications, isLoading: isLoadingNotifs } =
    useNotifications({ enabled: !!token });
  const markAsReadMutation = useMarkAsRead();
  const deleteNotificationMutation = useDeleteNotification();
  const deleteAllNotificationsMutation = useDeleteAllNotifications();

  // --- Gestion des interactions utilisateur ---
  const handleThemeToggle = () => setTheme(theme === "dark" ? "light" : "dark");

  const closeMenus = () => {
    setMenuOpen(false);
    setProfileMenuOpen(false);
    setNotifMenuOpen(false); // Assurez-vous de fermer tous les menus
  };

  const handleLogout = () => {
    dispatch(logout());
    queryClient.clear();
    // Force a hard reload to clear all in-memory state and ensure a fresh start
    window.location.href = "/login";
  };

  // Mark notifications as read when opening the notification menu
  const handleNotifClick = () => {
    setProfileMenuOpen(false);
    setNotifMenuOpen(!notifMenuOpen);
    if (!notifMenuOpen && hasUnread) {
      markAsReadMutation.mutate();
    }
  };

  // Check for unread notifications
  const hasUnread = useMemo(() => {
    return notifications?.some((n) => !n.isRead);
  }, [notifications]);

  /**
   * Détermine les liens du menu principal selon le rôle utilisateur.
   */
  const menuItems = useMemo(() => {
    const baseItems = [
      { label: "Accueil", icon: Home, path: "/home" },
      // CORRIGÉ: /categories pointe vers /events
      { label: "Explorer les Événements", icon: Grid, path: "/events" },
      { label: "Historique", icon: History, path: "/past-events" },
      { label: "Mes QR Codes", icon: QrCode, path: "/my-qrcodes" },
      { label: "Mon Profil", icon: UserCircle, path: "/user-profile" },
      { label: "Retour", icon: ArrowLeft, onClick: () => navigate(-1) },
      { label: "Aide", icon: HelpCircle, path: "/qrevent_help" },
      { label: "Paramètres", icon: Settings, path: "/account-settings" },
    ];

    const role = user?.role;

    if (role === "Organisateur" || role === "Administrateur") {
      baseItems.splice(1, 0, {
        label: "Scanner un Ticket",
        icon: ScanLine,
        path: "/scan",
      });
      // AJOUT: Bouton Créer un événement
      baseItems.splice(1, 0, {
        label: "Créer un événement",
        icon: PlusCircle,
        path: "/createevent",
        highlight: true, // Marqueur pour le style
      });
    }
    if (role === "Administrateur") {
      baseItems.splice(1, 0, {
        label: "Admin Dashboard",
        icon: ShieldCheck,
        path: "/admin",
      });
    }
    if (role === "Organisateur") {
      baseItems.splice(1, 0, {
        label: "Mon Dashboard",
        icon: LayoutDashboard,
        path: "/dashboard",
      });
    }
    return baseItems;
  }, [user, navigate]);

  // Retourne l’URL ou 'null' si pas d'image
  const getAvatarUrl = (imagePath) => {
    if (!imagePath) {
      return null;
    }
    if (imagePath.startsWith("http")) {
      return imagePath;
    }
    // Construit l'URL avec la base STATIQUE
    return `${STATIC_BASE_URL}/${imagePath}`;
  };

  // On calcule l'URL de l'avatar une seule fois
  const avatarUrl = user ? getAvatarUrl(user.image) : null;

  // Utilisateur non connecté
  if (!token) {
    return (
      <nav className="sticky top-0 z-30 flex items-center justify-between px-4 h-16 bg-white dark:bg-gray-800 shadow-md">
        <div className="w-10"></div>
        <Link to="/" className="flex-shrink-0">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-green-400 bg-clip-text text-transparent">
            Qr-Event
          </h1>
        </Link>
        <div className="w-auto flex justify-end">
          <Link
            to="/login"
            className="px-3 py-1.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
          >
            Connexion
          </Link>
        </div>
      </nav>
    );
  }

  // Chargement temporaire
  if (isLoading && token && !queryUser) {
    return (
      <nav className="sticky top-0 z-30 flex items-center justify-between px-4 h-16 bg-white dark:bg-gray-800 shadow-md animate-pulse">
        <div className="h-8 w-8 bg-gray-300 dark:bg-gray-700 rounded-md"></div>
        <div className="h-7 w-24 bg-gray-300 dark:bg-gray-700 rounded-md"></div>
        <div className="flex items-center gap-3">
          <div className="h-7 w-7 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
          <div className="h-8 w-8 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
        </div>
      </nav>
    );
  }

  if (!user) return null;

  // --- Navbar principale pour utilisateur connecté ---
  return (
    <>
      <nav className="sticky top-0 z-40 flex items-center justify-between px-4 h-16 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-sm border-b border-gray-100 dark:border-gray-800 transition-all duration-300">
        {/* Mobile: Left side (Hamburger) */}
        <div className="flex items-center md:hidden">
          <button
            onClick={() => {
              closeMenus();
              setMenuOpen(true);
            }}
            className="p-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all active:scale-90"
            aria-label="Ouvrir le menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Logo - Centered on mobile, Left on desktop */}
        <Link 
          to="/home" 
          className="flex-shrink-0 md:mr-8 absolute left-1/2 -translate-x-1/2 md:static md:left-auto md:translate-x-0 z-10"
        >
          <h1 className="text-xl md:text-2xl font-black bg-gradient-to-r from-blue-500 to-green-400 bg-clip-text text-transparent tracking-tighter">
            Qr-Event
          </h1>
        </Link>

        {/* Menu Desktop (Visible uniquement sur écran large) */}
        <div className="hidden md:flex items-center gap-8 flex-1 justify-center">
          {menuItems
            .filter(
              (item) => item.label !== "Mon Profil" && item.label !== "Retour"
            )
            .map((item) => {
              const Icon = item.icon;
              return item.path ? (
                <Link
                  key={item.label}
                  to={item.path}
                  className={`flex items-center gap-2 text-sm font-medium transition-all duration-200 ${
                    item.highlight
                      ? "bg-blue-600 text-white px-5 py-2.5 rounded-full hover:bg-blue-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                      : "text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 relative group"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${item.highlight ? "text-white" : ""}`}
                  />
                  <span>{item.label}</span>
                  {!item.highlight && (
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
                  )}
                </Link>
              ) : (
                <button
                  key={item.label}
                  onClick={item.onClick}
                  className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors relative group"
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
                </button>
              );
            })}
        </div>

        <div className="flex items-center gap-0.5 md:gap-2 relative">
          {/* Bouton Thème */}
          <button
            onClick={handleThemeToggle}
            className="p-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all active:scale-90"
            aria-label="Changer de thème"
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5 md:w-6 md:h-6" />
            ) : (
              <Moon className="w-5 h-5 md:w-6 md:h-6" />
            )}
          </button>

          {/* Bouton Notifications */}
          <button
            onClick={handleNotifClick}
            className="p-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all relative active:scale-90"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 md:w-6 md:h-6" />
            {hasUnread && (
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse"></span>
            )}
          </button>

          {/* Menu déroulant des notifications */}
          {notifMenuOpen && (
            <div className="absolute top-14 right-0 w-80 max-w-[90vw] z-50 p-3 rounded-2xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-gray-100 dark:border-gray-700 shadow-2xl animate-fade-in-down">
              <div className="flex items-center justify-between p-2 mb-2 border-b border-gray-100 dark:border-gray-700">
                <h3 className="font-black dark:text-white text-sm uppercase tracking-widest">
                  Notifications
                </h3>
                <div className="flex items-center gap-2">
                  {notifications?.length > 0 && (
                    <button
                      onClick={() => {
                        if (window.confirm("Supprimer toutes les notifications ?")) {
                          deleteAllNotificationsMutation.mutate();
                        }
                      }}
                      className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:bg-red-50 dark:hover:bg-red-900/20 px-2 py-1 rounded-lg transition-colors"
                    >
                      Tout effacer
                    </button>
                  )}
                  <button 
                    onClick={() => setNotifMenuOpen(false)}
                    className="p-1 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto no-scrollbar">
                {isLoadingNotifs && (
                  <p className="p-4 text-center text-sm dark:text-gray-400">
                    Chargement...
                  </p>
                )}
                {!isLoadingNotifs && notifications?.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Bell className="w-8 h-8 text-gray-200 dark:text-gray-700 mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Aucune notification
                    </p>
                  </div>
                )}
                {notifications?.map((notif) => (
                  <div
                    key={notif._id || notif.id}
                    className={`flex items-start justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 group mb-1 transition-colors ${
                      !notif.isRead
                        ? "bg-blue-50/50 dark:bg-blue-900/10"
                        : ""
                    }`}
                  >
                    <Link
                      to={notif.link || "#"}
                      onClick={closeMenus}
                      className="flex-1"
                    >
                      <p
                        className={`text-xs md:text-sm ${
                          !notif.isRead
                            ? "font-bold text-gray-900 dark:text-white"
                            : "text-gray-600 dark:text-gray-400"
                        }`}
                      >
                        {notif.message}
                      </p>
                      <span className="text-[10px] text-blue-500 font-bold mt-1 block">
                        {new Date(notif.createdAt).toLocaleString("fr-FR")}
                      </span>
                    </Link>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotificationMutation.mutate(notif._id || notif.id);
                      }}
                      className="ml-2 p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 md:opacity-0 md:group-hover:opacity-100 transition-all"
                      title="Supprimer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Avatar utilisateur */}
          <button
            onClick={() => {
              closeMenus();
              setProfileMenuOpen(true);
            }}
            className="flex items-center p-1"
            title="Profil utilisateur"
            aria-label="Ouvrir le menu du profil"
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="avatar"
                className="w-8 h-8 md:w-9 md:h-9 rounded-full object-cover border-2 border-blue-500/20 shadow-sm"
              />
            ) : (
              <DefaultAvatarIcon className="w-8 h-8 md:w-9 md:h-9 rounded-full border-2 border-blue-500/20 p-1 shadow-sm" />
            )}
          </button>

          {/* Menu du profil */}
          {profileMenuOpen && (
            <>
              <div onClick={closeMenus} className="fixed inset-0 z-40"></div>
              <div className="absolute top-14 right-0 w-64 max-w-[80vw] z-50 p-3 flex flex-col gap-1 rounded-2xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-gray-100 dark:border-gray-700 shadow-2xl animate-fade-in-down">
                <div className="flex flex-col items-center border-b border-gray-100 dark:border-gray-700 pb-4 mb-2">
                  <div className="relative mb-3">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="avatar"
                        className="w-16 h-16 rounded-2xl object-cover shadow-lg"
                      />
                    ) : (
                      <DefaultAvatarIcon className="w-16 h-16 rounded-2xl p-3 shadow-lg" />
                    )}
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                  </div>
                  <p className="font-black text-gray-900 dark:text-white tracking-tight">
                    {user.nom}
                  </p>
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">
                    {user.role}
                  </span>
                </div>
                <Link
                  to="/user-profile"
                  onClick={closeMenus}
                  className="flex items-center gap-3 p-3 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors font-bold text-sm"
                >
                  <UserCheck className="w-5 h-5 text-blue-600" /> Voir mon profil
                </Link>
                <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 p-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors text-left font-bold text-sm"
                >
                  <LogOut className="w-5 h-5" /> Déconnexion
                </button>
              </div>
            </>
          )}
        </div>
      </nav>

      {/* --- Menu latéral (drawer) --- */}
      {menuOpen && (
        <>
          <div
            onClick={closeMenus}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-fade-in"
          ></div>

          <div className="fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl shadow-2xl animate-slide-in-left flex flex-col border-r border-gray-100 dark:border-gray-800">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center gap-4">
              <div className="relative">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="avatar"
                    className="w-14 h-14 rounded-2xl object-cover shadow-md border border-gray-100 dark:border-gray-700"
                  />
                ) : (
                  <DefaultAvatarIcon className="w-14 h-14 rounded-2xl p-2 shadow-md border border-gray-100 dark:border-gray-700" />
                )}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-gray-900 dark:text-white truncate tracking-tight">
                  {user.nom}
                </p>
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
                  {user.role}
                </p>
              </div>
              <button
                onClick={closeMenus}
                className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all active:scale-90"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto no-scrollbar">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const shared =
                  "flex items-center gap-4 p-3 rounded-2xl text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all duration-200 w-full font-bold text-sm group active:scale-[0.98]";
                return item.path ? (
                  <Link
                    key={item.label}
                    to={item.path}
                    onClick={closeMenus}
                    className={shared}
                  >
                    <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span>{item.label}</span>
                    <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                  </Link>
                ) : (
                  <button
                    key={item.label}
                    onClick={() => {
                      item.onClick?.();
                      closeMenus();
                    }}
                    className={shared}
                  >
                    <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span>{item.label}</span>
                    <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                  </button>
                );
              })}
            </nav>

            <div className="p-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
              <button
                onClick={handleThemeToggle}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 w-full transition-colors font-bold text-sm"
              >
                {theme === "dark" ? (
                  <Sun className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Moon className="w-5 h-5 text-indigo-500" />
                )}
                <span>{theme === "dark" ? "Mode Clair" : "Mode Sombre"}</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 p-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 w-full transition-colors font-bold text-sm"
              >
                <LogOut className="w-5 h-5" />
                <span>Déconnexion</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* --- Animations --- */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fadeIn 0.3s ease-out; }
        @keyframes fadeInDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-down { animation: fadeInDown 0.2s ease-out; }
        @keyframes slideInLeft { from { transform: translateX(-100%); } to { transform: translateX(0); } }
        .animate-slide-in-left { animation: slideInLeft 0.3s ease-out; }
      `}</style>
    </>
  );
};

export default Navbar;
