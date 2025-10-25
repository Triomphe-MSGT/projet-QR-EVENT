// src/components/Navbar.jsx
import React, { useState, useMemo } from "react"; // Ajout de useEffect
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { useQueryClient } from "@tanstack/react-query";

// --- Logique d'authentification ---
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../slices/authSlice"; // ✅ Vérifiez le chemin
import { useUserProfile } from "../../hooks/useUserProfile"; // ✅ Vérifiez le chemin

// --- Icônes ---
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
  UserCheck,
  Home,
  UserCircle,
  ShieldCheck,
  QrCode,
  LayoutDashboard,
  ScanLine,
  Edit, // Edit est utilisé dans le menu latéral
} from "lucide-react";

const Navbar = () => {
  // Hooks de base
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  // Récupération de l'état d'authentification et des données utilisateur
  const { token, user: reduxUser } = useSelector((state) => state.auth);
  // Utilise React Query pour obtenir les données fraîches SI un token existe
  const { data: queryUser, isLoading } = useUserProfile({ enabled: !!token });
  // Priorité aux données fraîches de Query, sinon utilise celles de Redux
  const user = queryUser || reduxUser;

  // États locaux pour les menus
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  // Fonctions de gestion
  const handleThemeToggle = () => setTheme(theme === "dark" ? "light" : "dark");
  const closeMenus = () => {
    setMenuOpen(false);
    setProfileMenuOpen(false);
  };
  const handleLogout = () => {
    dispatch(logout()); // Vide Redux state + localStorage (si configuré)
    queryClient.clear(); // Vide le cache React Query
    navigate("/login"); // Redirige
  };

  // Création dynamique des items du menu latéral
  const menuItems = useMemo(() => {
    // Items de base pour tout utilisateur connecté
    const baseItems = [
      { label: "Retour", icon: ArrowLeft, onClick: () => navigate(-1) },
      { label: "Accueil", icon: Home, path: "/home" },
      { label: "Catégories", icon: Grid, path: "/home" }, // Assurez-vous que '/categories' existe
      { label: "Mes QR Codes", icon: QrCode, path: "/my-qrcodes" },
      { label: "Mon Profil", icon: UserCircle, path: "/user-profile" },
      // Lien "Modifier mon profil" retiré ici car "Mon Profil" mène déjà à la page où on peut modifier
      { label: "Paramètres", icon: Settings, path: "/account-settings" }, // Assurez-vous que '/account-settings' existe
    ];

    const userRole = user?.role; // Récupère le rôle

    // Ajoute les liens spécifiques pour Organisateurs et Admins
    if (userRole === "Organisateur" || userRole === "administrateur") {
      // Ajoute "Dashboard"
      const homeIndex = baseItems.findIndex((item) => item.label === "Accueil");
      baseItems.splice(homeIndex !== -1 ? homeIndex + 1 : 1, 0, {
        label: "Dashboard",
        icon: LayoutDashboard,
        path: "/dashboard",
      });

      // Ajoute "Scanner un Ticket"
      const qrIndex = baseItems.findIndex(
        (item) => item.label === "Mes QR Codes"
      );
      const scanItem = {
        label: "Scanner un Ticket",
        icon: ScanLine,
        path: "/scan-qrcode",
      };
      if (qrIndex !== -1) {
        baseItems.splice(qrIndex + 1, 0, scanItem);
      } else {
        baseItems.push(scanItem);
      }
    }
    // Ajoute le lien spécifique Admin
    if (userRole === "administrateur") {
      // Utilise la bonne casse
      baseItems.push({
        label: "Admin Dashboard",
        icon: ShieldCheck,
        path: "/admin",
      });
    }

    return baseItems;
  }, [user, navigate]); // Recalculé si l'utilisateur ou la fonction navigate change

  // Fonction utilitaire pour l'URL de l'avatar
  const getAvatarUrl = (imagePath) => {
    if (!imagePath) return "/assets/default-avatar.png"; // ✅ Avoir un avatar par défaut
    if (imagePath.startsWith("http")) return imagePath;
    return `http://localhost:3001/${imagePath}`; // URL vers le backend
  };

  // --- AFFICHAGE CONDITIONNEL ---

  // 1. Navbar pour utilisateur déconnecté
  if (!token) {
    return (
      <nav className="relative flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-900 shadow-md">
        <Link to="/" className="absolute left-1/2 -translate-x-1/2">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-green-400 bg-clip-text text-transparent select-none">
            Qr-Event
          </h1>
        </Link>
        <div className="flex-1"></div>
        <Link
          to="/login"
          className="px-4 py-1.5 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
        >
          Connexion
        </Link>
      </nav>
    );
  }

  // 2. Navbar squelette pendant le chargement (si on a un token mais pas encore l'user de query)
  if (isLoading && token && !queryUser) {
    return (
      <nav className="relative flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-900 shadow-md animate-pulse">
        <div className="h-7 w-7 bg-gray-300 dark:bg-gray-700 rounded-md"></div>
        <div className="h-7 w-24 bg-gray-300 dark:bg-gray-700 rounded-md"></div>
        <div className="flex items-center gap-4">
          <div className="h-6 w-6 bg-gray-300 dark:bg-gray-700 rounded-md"></div>
          <div className="h-8 w-8 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
        </div>
      </nav>
    );
  }

  // 3. Cas où l'utilisateur n'est pas encore défini (très bref ou si API échoue)
  if (!user) {
    console.warn("Navbar rendue sans objet 'user' défini."); // Log pour débogage
    return null; // Ou retourner le squelette
  }

  // 4. Navbar complète pour utilisateur connecté
  return (
    <nav className="relative flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-900 shadow-md transition-colors duration-300">
      {/* --- Bouton Hamburger --- */}
      <button
        onClick={() => {
          setMenuOpen(!menuOpen);
          setProfileMenuOpen(false);
        }}
        className="p-1 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition"
        aria-label="Ouvrir le menu"
      >
        {menuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
      </button>

      {/* --- Logo --- */}
      <Link to="/home" className="absolute left-1/2 -translate-x-1/2">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-green-400 bg-clip-text text-transparent select-none">
          Qr-Event
        </h1>
      </Link>

      {/* --- Section Profil + Thème --- */}
      <div className="flex items-center gap-4 relative">
        {/* Bouton Thème */}
        <button
          onClick={handleThemeToggle}
          className="p-1 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition"
          title={theme === "dark" ? "Mode clair" : "Mode sombre"}
          aria-label="Changer de thème"
        >
          {theme === "dark" ? (
            <Sun className="w-6 h-6" />
          ) : (
            <Moon className="w-6 h-6" />
          )}
        </button>

        {/* Bouton Profil */}
        <button
          onClick={() => {
            setProfileMenuOpen(!profileMenuOpen);
            setMenuOpen(false);
          }}
          className="flex items-center gap-2 text-gray-700 dark:text-gray-200"
          title="Profil utilisateur"
          aria-label="Ouvrir le menu du profil"
        >
          {user.image ? (
            <img
              src={getAvatarUrl(user.image)}
              alt="avatar"
              className="w-8 h-8 rounded-full object-cover border-2 border-gray-300 dark:border-gray-600"
            />
          ) : (
            <UserCircle className="w-8 h-8 text-gray-400" />
          )}
        </button>

        {/* --- Menu Déroulant du Profil --- */}
        {profileMenuOpen && (
          <>
            <div onClick={closeMenus} className="fixed inset-0 z-40"></div>{" "}
            {/* Backdrop */}
            <div className="absolute top-12 right-0 w-64 z-50 p-3 flex flex-col gap-1 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg animate-fade-in-down">
              <div className="flex flex-col items-center border-b dark:border-gray-600 pb-3 mb-2">
                <img
                  src={getAvatarUrl(user.image)}
                  alt="avatar"
                  className="w-16 h-16 rounded-full object-cover mb-2"
                />
                <p className="font-semibold text-gray-800 dark:text-gray-100">
                  {user.nom || "Utilisateur"}
                </p>
                <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                  {user.role || "Invité"}
                </span>
              </div>
              <Link
                to="/user-profile"
                onClick={closeMenus}
                className="flex items-center gap-3 p-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <UserCheck className="w-5 h-5" /> Voir mon profil
              </Link>
              {/* Le bouton pour changer de rôle a été retiré */}
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

      {/* --- Menu Hamburger Gauche (utilise menuItems dynamiques) --- */}
      {menuOpen && (
        <>
          <div
            onClick={closeMenus}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
          ></div>
          <div className="absolute top-16 left-4 w-72 z-50 p-4 flex flex-col gap-2 rounded-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border border-gray-200 dark:border-gray-700 shadow-lg animate-slide-in-left">
            {menuItems.map((item) => {
              const Icon = item.icon;
              if (item.path) {
                return (
                  // C'est un lien
                  <Link
                    key={item.label}
                    to={item.path}
                    onClick={closeMenus}
                    className="flex items-center gap-3 p-2 rounded-lg text-gray-800 dark:text-gray-100 hover:bg-blue-500 hover:text-white transition-colors"
                  >
                    <Icon className="w-5 h-5" /> {item.label}
                  </Link>
                );
              } else {
                return (
                  // C'est un bouton (comme "Retour")
                  <button
                    key={item.label}
                    onClick={() => {
                      if (item.onClick) item.onClick();
                      closeMenus();
                    }}
                    className="flex items-center gap-3 p-2 rounded-lg text-gray-800 dark:text-gray-100 hover:bg-blue-500 hover:text-white transition-colors text-left"
                  >
                    <Icon className="w-5 h-5" /> {item.label}
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
