import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
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
  MessageSquare,
  Globe,
  Edit,
  Megaphone,
  Users,
  Info,
  Home,
  UserCircle,
} from "lucide-react";

// --- Auth placeholder (à remplacer par ton vrai AuthContext plus tard) ---
const useAuth = () => {
  const [isOrganizer, setIsOrganizer] = useState(false);
  const [user] = useState({ name: "John Doe", role: "Participant" });

  const toggleRole = () => {
    setIsOrganizer((prev) => !prev);
    console.log(
      `Switched to ${isOrganizer ? "Participant" : "Organisateur"} mode.`
    );
  };

  const logout = () => {
    console.log("User logged out.");
  };

  return { user, isOrganizer, toggleRole, logout };
};
// -------------------------------------------------------------------------

const Navbar = () => {
  const { theme, setTheme } = useTheme();
  const { user, isOrganizer, toggleRole, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleThemeToggle = () => setTheme(theme === "dark" ? "light" : "dark");
  const closeMenus = () => {
    setMenuOpen(false);
    setProfileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    closeMenus();
    navigate("/login");
  };

  const handleRoleToggle = () => {
    toggleRole();
    closeMenus();
  };

  // 🧭 Tableau des liens dynamiques du menu latéral
  const menuItems = [
    {
      label: "Retour à la page précédente",
      icon: ArrowLeft,
      onClick: () => navigate(-1),
    },
    {
      label: "Paramètres du compte",
      icon: Settings,
      path: "/account-settings",
    },
    { label: "Catégories", icon: Grid, path: "/categories" },
    { label: "Événements confondus", icon: Home, path: "/events" },
    { label: "Actualité", icon: Megaphone, path: "/news" },
    { label: "Autre langue", icon: Globe, path: "/language" },
    { label: "Modifier mon profil", icon: Edit, path: "/edit-profile" },
    { label: "Commentaires", icon: MessageSquare, path: "/comments" },
    {
      label: "Contacter un administrateur",
      icon: Users,
      path: "/contact-admin",
    },
    {
      label: `${user.name} : ${user.role}`,
      icon: UserCircle,
      path: "/profile",
    },
  ];

  return (
    <nav className="relative flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-900 shadow-md transition-colors duration-300">
      {/* ---- Bouton Hamburger ---- */}
      <button
        onClick={() => {
          setMenuOpen(!menuOpen);
          setProfileMenuOpen(false);
        }}
        className="text-gray-700 dark:text-gray-200 hover:text-blue-500 transition"
      >
        {menuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
      </button>

      {/* ---- Logo ---- */}
      <h1 className="absolute left-1/2 -translate-x-1/2 text-2xl font-bold bg-gradient-to-r from-blue-500 to-green-400 bg-clip-text text-transparent select-none">
        Qr-Event
      </h1>

      {/* ---- Profil + Thème ---- */}
      <div className="flex items-center gap-4 relative">
        {/* Thème */}
        <button
          onClick={handleThemeToggle}
          className="text-gray-700 dark:text-gray-200 hover:text-blue-500 transition"
          title={theme === "dark" ? "Mode clair" : "Mode sombre"}
        >
          {theme === "dark" ? (
            <Sun className="w-6 h-6" />
          ) : (
            <Moon className="w-6 h-6" />
          )}
        </button>

        {/* Profil */}
        <button
          onClick={() => {
            setProfileMenuOpen(!profileMenuOpen);
            setMenuOpen(false);
          }}
          className="text-gray-700 dark:text-gray-200 hover:text-blue-500 transition"
          title="Profil utilisateur"
        >
          <User className="w-6 h-6" />
        </button>

        {/* ---- Menu Profil ---- */}
        {profileMenuOpen && (
          <>
            <div
              onClick={closeMenus}
              className="fixed inset-0 bg-transparent z-40"
            ></div>
            <div
              className="absolute top-10 right-0 w-64 z-50 p-3 flex flex-col gap-2 rounded-xl
                            bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg transition-all duration-300"
            >
              {/* Voir profil */}
              <Link
                to="/profile"
                className="flex items-center gap-3 p-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-blue-500 hover:text-white transition-colors"
                onClick={closeMenus}
              >
                <UserCheck className="w-5 h-5" />
                Voir mon profil
              </Link>

              {/* Changer de rôle */}
              <button
                onClick={handleRoleToggle}
                className="flex items-center gap-3 p-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-blue-500 hover:text-white transition-colors text-left"
              >
                <RefreshCw className="w-5 h-5" />
                Passer en mode{" "}
                <strong className="font-semibold ml-1">
                  {isOrganizer ? "Participant" : "Organisateur"}
                </strong>
              </button>

              <div className="border-t border-gray-200 dark:border-gray-700 my-1" />

              {/* Déconnexion */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 p-2 rounded-lg text-red-500 hover:bg-red-500 hover:text-white transition-colors text-left"
              >
                <LogOut className="w-5 h-5" />
                Déconnexion
              </button>
            </div>
          </>
        )}
      </div>

      {/* ---- Menu Hamburger Gauche ---- */}
      {menuOpen && (
        <>
          <div
            onClick={closeMenus}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
          ></div>

          <div
            className="absolute top-16 left-4 w-72 z-50 p-4 flex flex-col gap-4 rounded-xl
                          bg-white/70 dark:bg-gray-800/70 backdrop-blur-md
                          border border-gray-200 dark:border-gray-700 shadow-lg transition-all duration-300"
          >
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              if (item.path) {
                return (
                  <Link
                    key={index}
                    to={item.path}
                    className="flex items-center gap-3 text-gray-700 dark:text-gray-200 hover:text-blue-500 transition-colors"
                    onClick={closeMenus}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                );
              }
              return (
                <button
                  key={index}
                  onClick={() => {
                    item.onClick?.();
                    closeMenus();
                  }}
                  className="flex items-center gap-3 text-gray-700 dark:text-gray-200 hover:text-blue-500 transition-colors text-left"
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </button>
              );
            })}

            <div className="border-t border-gray-300 dark:border-gray-700 my-1" />

            {/* Thème */}
            <button
              onClick={() => {
                handleThemeToggle();
                closeMenus();
              }}
              className="flex items-center gap-3 text-gray-700 dark:text-gray-200 hover:text-blue-500 transition-colors"
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
              {theme === "dark" ? "Mode clair" : "Mode sombre"}
            </button>
          </div>
        </>
      )}
    </nav>
  );
};

export default Navbar;
