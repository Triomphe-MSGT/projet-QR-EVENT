// src/components/Navbar.jsx
import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { useQueryClient } from "@tanstack/react-query";
import {
  Menu,
  X,
  Settings,
  Grid,
  ArrowLeft,
  Sun,
  Moon,
  User,
  LogOut,
  RefreshCw,
  UserCheck,
  Edit,
  Home,
  UserCircle,
  ShieldCheck,
  QrCode,
} from "lucide-react";
import { useUserProfile } from "../../hooks/useUserProfile";

const Navbar = () => {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useUserProfile();

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  // Logique pour déterminer le rôle et la vue
  const isActualOrganizer = user?.role === "Organisateur";
  const [isOrganizerView, setIsOrganizerView] = useState(isActualOrganizer);

  useEffect(() => {
    if (user) {
      setIsOrganizerView(user.role === "Organisateur");
    }
  }, [user]);

  // Fonctions de gestion
  const handleThemeToggle = () => setTheme(theme === "dark" ? "light" : "dark");
  const closeMenus = () => {
    setMenuOpen(false);
    setProfileMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    queryClient.clear(); // Vide le cache React Query pour le prochain utilisateur
    navigate("/login");
  };

  const handleRoleToggle = () => {
    setIsOrganizerView((prev) => !prev);
    closeMenus();
  };

  // Création dynamique des items du menu
  const menuItems = useMemo(() => {
    const items = [
      // Cet item a un 'onClick', il sera rendu comme un <button>
      { label: "Retour", icon: ArrowLeft, onClick: () => navigate(-1) },
      // Ces items ont un 'path', ils seront rendus comme des <Link>
      { label: "Accueil", icon: Home, path: "/home" },
      { label: "Catégories", icon: Grid, path: "/categories" },
      { label: "Mes QR Codes", icon: QrCode, path: "/my-qrcodes" },
      { label: "Mon Profil", icon: UserCircle, path: "/user-profile" },
      { label: "Paramètres", icon: Settings, path: "/account-settings" },
    ];

    // Ajoute le lien "Admin" seulement si l'utilisateur a le bon rôle
    if (user?.role === "Administrateur") {
      // Utilise la bonne casse pour le rôle
      items.push({
        label: "Admin Dashboard",
        icon: ShieldCheck,
        path: "/admin",
      });
    }

    return items;
  }, [user, navigate]); // Recalculé si 'user' ou 'navigate' change

  // Fonction utilitaire pour l'avatar
  const getAvatarUrl = (imagePath) => {
    if (!imagePath) return "/assets/default-avatar.png";
    if (imagePath.startsWith("http")) return imagePath;
    return `http://localhost:3001/${imagePath}`;
  };

  // Affiche un squelette de chargement pendant que le profil est récupéré
  if (isLoading) {
    return (
      <nav className="relative flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-900 shadow-md">
        <div className="h-7 w-7 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
        <div className="h-7 w-24 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
        <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
      </nav>
    );
  }

  return (
    <nav className="relative flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-900 shadow-md transition-colors duration-300">
      {/* ---- Bouton Hamburger ---- */}
      <button
        onClick={() => {
          setMenuOpen(!menuOpen);
          setProfileMenuOpen(false);
        }}
        className="text-gray-700 dark:text-gray-200 hover:text-blue-500 transition"
        aria-label="Ouvrir le menu"
      >
        {menuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
      </button>

      {/* ---- Logo ---- */}
      <Link to="/home" className="absolute left-1/2 -translate-x-1/2">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-green-400 bg-clip-text text-transparent select-none">
          Qr-Event
        </h1>
      </Link>

      {/* ---- Section Profil + Thème ---- */}
      <div className="flex items-center gap-4 relative">
        <button
          onClick={handleThemeToggle}
          className="text-gray-700 dark:text-gray-200 hover:text-blue-500 transition"
          title={theme === "dark" ? "Mode clair" : "Mode sombre"}
          aria-label="Changer de thème"
        >
          {theme === "dark" ? (
            <Sun className="w-6 h-6" />
          ) : (
            <Moon className="w-6 h-6" />
          )}
        </button>

        <button
          onClick={() => {
            setProfileMenuOpen(!profileMenuOpen);
            setMenuOpen(false);
          }}
          className="flex items-center gap-2 text-gray-700 dark:text-gray-200 hover:text-blue-500 transition"
          title="Profil utilisateur"
          aria-label="Ouvrir le menu du profil"
        >
          {user?.image ? (
            <img
              src={getAvatarUrl(user.image)}
              alt="avatar"
              className="w-8 h-8 rounded-full object-cover border border-gray-300 dark:border-gray-600"
            />
          ) : (
            <User className="w-6 h-6" />
          )}
        </button>

        {/* ---- Menu Déroulant du Profil ---- */}
        {profileMenuOpen && (
          <>
            <div onClick={closeMenus} className="fixed inset-0 z-40"></div>
            <div className="absolute top-12 right-0 w-64 z-50 p-3 flex flex-col gap-1 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg animate-fade-in-down">
              <div className="flex flex-col items-center border-b dark:border-gray-600 pb-3 mb-2">
                <img
                  src={getAvatarUrl(user?.image)}
                  alt="avatar"
                  className="w-16 h-16 rounded-full object-cover mb-2"
                />
                <p className="font-semibold text-gray-800 dark:text-gray-100">
                  {user?.nom}
                </p>
                <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                  {user?.role}
                </span>
              </div>
              <Link
                to="/user-profile"
                onClick={closeMenus}
                className="flex items-center gap-3 p-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <UserCheck className="w-5 h-5" /> Voir mon profil
              </Link>
              {isActualOrganizer && (
                <button
                  onClick={handleRoleToggle}
                  className="flex items-center gap-3 p-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
                >
                  <RefreshCw className="w-5 h-5" /> Passer en mode{" "}
                  <strong className="font-semibold ml-1">
                    {isOrganizerView ? "Participant" : "Organisateur"}
                  </strong>
                </button>
              )}
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

      {/* ---- Menu Hamburger Gauche (CORRECTION PRINCIPALE) ---- */}
      {menuOpen && (
        <>
          <div
            onClick={closeMenus}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
          ></div>
          <div className="absolute top-16 left-4 w-72 z-50 p-4 flex flex-col gap-2 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-gray-200 dark:border-gray-700 shadow-lg animate-slide-in-left">
            {menuItems.map((item) => {
              const Icon = item.icon;
              // --- Logique de rendu conditionnel ---
              if (item.path) {
                // Si l'item a un 'path', on rend un <Link>
                return (
                  <Link
                    key={item.label}
                    to={item.path}
                    onClick={closeMenus}
                    className="flex items-center gap-3 p-2 rounded-lg text-gray-800 dark:text-gray-100 hover:bg-blue-500 hover:text-white transition-colors"
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                );
              } else {
                // Sinon (s'il a un 'onClick'), on rend un <button>
                return (
                  <button
                    key={item.label}
                    onClick={() => {
                      if (item.onClick) item.onClick(); // Exécute l'action (ex: navigate(-1))
                      closeMenus();
                    }}
                    className="flex items-center gap-3 p-2 rounded-lg text-gray-800 dark:text-gray-100 hover:bg-blue-500 hover:text-white transition-colors text-left"
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </button>
                );
              }
            })}
          </div>
        </>
      )}
    </nav>
  );
};

export default Navbar;
