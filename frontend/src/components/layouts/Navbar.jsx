// src/components/layouts/Navbar.jsx

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
} from "lucide-react";

// --- CORRECTION 1: Import de l'URL de base ---
// Nous importons l'URL de base de l'API (ex: http://localhost:3001/api)
import { API_BASE_URL } from "../../slices/axiosInstance";

// Nous créons une URL statique pour les fichiers (ex: http://localhost:3001)
const STATIC_BASE_URL = API_BASE_URL.replace("/api", "");
// --- FIN CORRECTION ---

/**
 * Navbar principale gérant :
 * - L'affichage adaptatif selon l'état d'authentification
 * - Le menu latéral (drawer)
 * - Le menu du profil utilisateur
 * - Le changement de thème
 */
const Navbar = () => {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  // Récupère le token (auth) et l'utilisateur depuis Redux + React Query
  const { token, user: reduxUser } = useSelector((state) => state.auth);
  // C'est excellent d'utiliser `enabled: !!token`
  const { data: queryUser, isLoading } = useUserProfile({ enabled: !!token });
  const user = queryUser || reduxUser; // Source prioritaire : données les plus récentes

  // États d'ouverture des menus
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  // --- Gestion des interactions utilisateur ---
  const handleThemeToggle = () => setTheme(theme === "dark" ? "light" : "dark");

  const closeMenus = () => {
    setMenuOpen(false);
    setProfileMenuOpen(false);
  };

  // C'est la bonne façon de gérer le logout
  const handleLogout = () => {
    dispatch(logout());
    queryClient.clear();
    navigate("/login");
  };

  /**
   * Détermine les liens du menu principal selon le rôle utilisateur.
   * - Utilise useMemo pour éviter un recalcul inutile à chaque rendu.
   */
  const menuItems = useMemo(() => {
    const baseItems = [
      { label: "Accueil", icon: Home, path: "/home" },
      // --- CORRECTION: Lien Catégories ---
      // Il pointait vers /home, je le redirige vers /events (ou /categories si vous l'avez)
      { label: "Explorer les Événements", icon: Grid, path: "/events" },
      { label: "Mes QR Codes", icon: QrCode, path: "/my-qrcodes" },
      { label: "Mon Profil", icon: UserCircle, path: "/user-profile" },
      // { label: "Paramètres", icon: Settings, path: "/account-settings" }, // Optionnel
      { label: "Retour", icon: ArrowLeft, onClick: () => navigate(-1) },
      { label: "Aide", icon: HelpCircle, path: "/qrevent_help" },
    ];

    const role = user?.role;

    // Enrichit la navigation pour Organisateurs & Admins
    if (role === "Organisateur" || role === "administrateur") {
      baseItems.splice(
        1,
        0, // Insère à la 2e position
        { label: "Scanner un Ticket", icon: ScanLine, path: "/scan" } // Chemin /scan est plus court
      );
    }

    // Liens supplémentaires pour les administrateurs
    if (role === "administrateur") {
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

  // --- CORRECTION 2: Fonction `getAvatarUrl` ---
  // Retourne l’URL de l’avatar avec gestion des chemins relatifs
  const getAvatarUrl = (imagePath) => {
    // Si l'image n'existe pas ou est vide
    if (!imagePath) {
      return "/assets/default-avatar.png"; // Chemin vers votre avatar par défaut
    }
    // Si c'est déjà une URL complète (ex: Cloudinary ou Google)
    if (imagePath.startsWith("http")) {
      return imagePath;
    }
    // Sinon, c'est un chemin local (uploads/users/...), on le construit
    return `${STATIC_BASE_URL}/${imagePath}`;
  };
  // --- FIN CORRECTION ---

  // --- Rendus conditionnels selon l’état d’authentification ---

  // Utilisateur non connecté
  if (!token) {
    return (
      <nav className="sticky top-0 z-30 flex items-center justify-between px-4 h-16 bg-white dark:bg-gray-800 shadow-md">
        <div className="w-10"></div> {/* Espaceur */}
        <Link to="/" className="flex-shrink-0">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-green-400 bg-clip-text text-transparent">
            Qr-Event
          </h1>
        </Link>
        {/* Bouton Connexion à droite */}
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

  // Chargement temporaire de l’utilisateur après connexion
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

  // S'il y a un token mais pas d'utilisateur (erreur de chargement), ne rien afficher ou afficher une erreur
  if (!user) return null;

  // --- Navbar principale pour utilisateur connecté ---
  return (
    <>
      <nav className="sticky top-0 z-30 flex items-center justify-between px-4 h-16 bg-white dark:bg-gray-800 shadow-md">
        {/* Bouton hamburger */}
        <button
          onClick={() => setMenuOpen(true)}
          className="p-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"
          aria-label="Ouvrir le menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Logo central */}
        <Link to="/home" className="flex-shrink-0">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-green-400 bg-clip-text text-transparent">
            Qr-Event
          </h1>
        </Link>

        {/* Notifications et profil */}
        <div className="flex items-center gap-2 relative">
          <button
            onClick={handleThemeToggle} // Ajout du toggle thème ici
            className="p-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"
            aria-label="Changer de thème"
          >
            {theme === "dark" ? (
              <Sun className="w-6 h-6" />
            ) : (
              <Moon className="w-6 h-6" />
            )}
          </button>

          {/* Avatar utilisateur */}
          <button
            onClick={() => setProfileMenuOpen(true)}
            className="flex items-center"
            title="Profil utilisateur"
            aria-label="Ouvrir le menu du profil"
          >
            <img
              src={getAvatarUrl(user.image)}
              alt="avatar"
              className="w-9 h-9 rounded-full object-cover border-2 border-gray-300 dark:border-gray-600"
            />
          </button>

          {/* Menu du profil */}
          {profileMenuOpen && (
            <>
              <div onClick={closeMenus} className="fixed inset-0 z-40"></div>
              <div className="absolute top-14 right-0 w-64 z-50 p-3 flex flex-col gap-1 rounded-xl bg-white dark:bg-gray-800 border dark:border-gray-700 shadow-lg animate-fade-in-down">
                <div className="flex flex-col items-center border-b dark:border-gray-600 pb-3 mb-2">
                  <img
                    src={getAvatarUrl(user.image)}
                    alt="avatar"
                    className="w-16 h-16 rounded-full object-cover mb-2"
                  />
                  <p className="font-semibold text-gray-800 dark:text-gray-100">
                    {user.nom}
                  </p>
                  <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                    {user.role}
                  </span>
                </div>
                <Link
                  to="/user-profile"
                  onClick={closeMenus}
                  className="flex items-center gap-3 p-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <UserCheck className="w-5 h-5" /> Voir mon profil
                </Link>
                <div className="border-t border-gray-200 dark:border-gray-600 my-1" />
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/50 transition-colors text-left"
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
          {/* Fond sombre */}
          <div
            onClick={closeMenus}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fade-in"
          ></div>

          {/* Contenu du menu */}
          <div className="fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] z-50 bg-white dark:bg-gray-800 shadow-2xl animate-slide-in-left flex flex-col">
            {/* En-tête du tiroir avec infos utilisateur */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
              <img
                src={getAvatarUrl(user.image)}
                alt="avatar"
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <p className="font-semibold text-gray-800 dark:text-gray-100">
                  {user.nom}
                </p>
                <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                  {user.role}
                </span>
              </div>
              <button
                onClick={closeMenus}
                className="p-2 ml-auto text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            {/* Liste dynamique des liens */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const shared =
                  "flex items-center gap-4 p-3 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors w-full font-medium";
                return item.path ? (
                  <Link
                    key={item.label}
                    to={item.path}
                    onClick={closeMenus}
                    className={shared}
                  >
                    <Icon className="w-6 h-6 text-gray-500" />
                    <span>{item.label}</span>
                    <ChevronRight className="w-5 h-5 ml-auto text-gray-400" />
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
                    <Icon className="w-6 h-6 text-gray-500" />
                    <span>{item.label}</span>
                    <ChevronRight className="w-5 h-5 ml-auto text-gray-400" />
                  </button>
                );
              })}
            </nav>

            {/* Pied de menu : thème + déconnexion */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
              <button
                onClick={handleThemeToggle}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 w-full"
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
                className="flex items-center gap-3 p-3 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/50 w-full"
              >
                <LogOut className="w-5 h-5" />
                <span>Déconnexion</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* --- Animations locales (Suggestion: à déplacer dans tailwind.config.js) --- */}
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
