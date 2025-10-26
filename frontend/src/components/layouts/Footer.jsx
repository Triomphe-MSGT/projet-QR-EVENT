import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { Home, Search, QrCode, User, Plus } from "lucide-react";

const Footer = () => {
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  // Fonction pour déterminer la route active
  const isActive = (path) => location.pathname === path;

  // Définit les rôles qui peuvent voir le bouton "Créer"
  const isCreator =
    user?.role === "Organisateur" || user?.role === "administrateur";

  // Définition des onglets de navigation
  const navItems = [
    { label: "Accueil", path: "/home", icon: Home },
    { label: "Explorer", path: "/events", icon: Search },
    { label: "Qrcode", path: "/my-qrcodes", icon: QrCode },
    { label: "Profil", path: "/user-profile", icon: User },
  ];

  return (
    <>
      {/* Le bouton "Créer" est séparé et flotte au-dessus de la barre.
        Il ne s'affiche que si l'utilisateur est un créateur (Orga ou Admin).
      */}
      {isCreator && (
        <Link
          to="/createevent"
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-20 
                     w-14 h-14 bg-gradient-to-r from-blue-500 to-green-400 rounded-full 
                     flex items-center justify-center text-white 
                     shadow-lg hover:shadow-xl hover:scale-110 
                     transition-all duration-300 ease-in-out"
          aria-label="Créer un événement"
        >
          <Plus size={28} />
        </Link>
      )}

      {/* La barre de navigation principale
       */}
      <footer
        className="
          fixed bottom-0 left-0 right-0 z-10
          bg-white dark:bg-gray-800 
          border-t border-gray-200 dark:border-gray-700
          shadow-[0_-4px_10px_-1px_rgba(0,0,0,0.05)] 
          transition-colors duration-300
        "
      >
        <nav className="flex justify-around items-center h-16 px-2">
          {navItems.map((item, index) => {
            // Ajoute un espace au milieu si un créateur est connecté (pour le bouton FAB)
            const spacer = isCreator && index === 1;
            const active = isActive(item.path);

            return (
              <React.Fragment key={item.label}>
                <Link
                  to={item.path}
                  className={`flex flex-col items-center justify-center w-16 p-2 rounded-lg
                              transition-all duration-200
                              ${
                                active
                                  ? "text-blue-600 dark:text-blue-400 scale-105" // Style actif
                                  : "text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400" // Style inactif
                              }`}
                >
                  <item.icon
                    className="w-6 h-6"
                    strokeWidth={active ? 2.5 : 2}
                  />
                  <span
                    className={`text-xs font-medium mt-0.5 ${
                      active ? "font-bold" : ""
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>

                {/* Ajoute un espace vide au milieu pour le bouton "Créer" */}
                {spacer && <div className="w-16" aria-hidden="true"></div>}
              </React.Fragment>
            );
          })}
        </nav>
      </footer>
    </>
  );
};

export default Footer;
