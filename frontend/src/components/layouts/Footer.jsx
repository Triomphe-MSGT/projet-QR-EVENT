import { Link, useLocation } from "react-router-dom";
import { ThemeProvider } from "../../context/ThemeContext";

const Footer = () => {
  const location = useLocation();

  // Fonction pour déterminer la route active
  const isActive = (path) => location.pathname === path;

  return (
    <ThemeProvider>
      <footer
        className="
          fixed bottom-0 left-0 right-0 
          bg-white dark:bg-[#242526] 
          border-t border-gray-200 dark:border-[#3A3B3C] 
          shadow-md z-50
          transition-colors duration-500
        "
      >
        <nav className="flex justify-around items-center p-3">
          {/* Accueil */}
          <Link
            to="/home"
            className={`flex flex-col items-center text-xs ${
              isActive("/home")
                ? "text-[#0866FF]"
                : "text-[#65676B] dark:text-[#B0B3B8] hover:text-[#0866FF]"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 mb-1"
              fill="currentColor"
              viewBox="0 0 24 24"
              stroke="none"
            >
              <path d="M3 12l9-9 9 9v8a2 2 0 01-2 2h-4a2 2 0 01-2-2v-4H9v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-8z" />
            </svg>
            <span>Accueil</span>
          </Link>

          {/* Historique */}
          <Link
            to="/createevent"
            className={`flex flex-col items-center text-xs ${
              isActive("/createevent")
                ? "text-[#0866FF]"
                : "text-[#65676B] dark:text-[#B0B3B8] hover:text-[#0866FF]"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 mb-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span>Créer</span>
          </Link>

          {/* Notifications */}
          <Link
            to="/events/1"
            className={`flex flex-col items-center text-xs ${
              isActive("/events/1")
                ? "text-[#0866FF]"
                : "text-[#65676B] dark:text-[#B0B3B8] hover:text-[#0866FF]"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 mb-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0a2 2 0 100 4 2 2 0 000-4z"
              />
            </svg>
            <span>Notifications</span>
          </Link>
        </nav>
      </footer>
    </ThemeProvider>
  );
};

export default Footer;
