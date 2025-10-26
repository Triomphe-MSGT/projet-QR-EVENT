import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { ArrowRight } from "lucide-react";

// --- Composant de chargement (Splash Screen) ---
const LoadingScreen = () => {
  const positions = [
    { top: 5, left: 5 },
    { bottom: 5, left: 5 },
    { top: 5, right: 5 },
    { bottom: 5, right: 5 },
  ];

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-gradient-to-br from-blue-100 to-white dark:from-gray-900 dark:to-blue-900/50 z-[9999]">
      <div className="relative w-52 h-52 flex justify-center items-center scale-75 animate-[pulse_2s_ease-in-out_infinite_alternate]">
        {positions.map((pos, i) => (
          <div
            key={i}
            className="absolute w-10 h-10 bg-blue-400/50 rounded-lg animate-[pulse-fade_3s_infinite_ease-in-out]"
            style={{ ...pos, animationDelay: `${i * 0.5}s` }}
          />
        ))}
        <h1 className="text-7xl font-['Poppins'] font-thin bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-green-400 z-10">
          QRe
        </h1>
      </div>
      <style>{`
        @keyframes pulse-fade {
          0% { opacity: 0; transform: scale(0.5); }
          50% { opacity: 0.3; transform: scale(1); }
          100% { opacity: 0; transform: scale(1.5); }
        }
        @keyframes pulse { 0% { transform: scale(0.8); } 100% { transform: scale(0.9); } }
      `}</style>
    </div>
  );
};

// --- Page principale (Modernisée avec logo SVG + main animée) ---
const OpenPage = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token && user) {
      navigate("/home", { replace: true });
      return;
    }
    const timer = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(timer);
  }, [token, user, navigate]);

  const handleCreateEvent = () => {
    navigate("/createevent");
  };
  const handleExploreEvents = () => {
    navigate("/home");
  };

  return (
    <div className="bg-white dark:bg-gray-900 flex flex-col min-h-screen relative overflow-hidden">
      {loading && <LoadingScreen />}

      <div
        className={`flex-grow flex flex-col justify-between transition-opacity duration-1000 ease-in-out ${
          loading ? "opacity-0" : "opacity-100"
        }`}
      >
        {/* Lueurs décoratives  */}
        <div className="absolute -top-1/4 left-1/2 -translate-x-1/2 w-full max-w-lg h-96 bg-blue-500/20 dark:bg-blue-500/30 blur-3xl rounded-full animate-pulse-slow -z-10"></div>
        <div className="absolute -bottom-1/4 right-1/4 w-full max-w-md h-80 bg-green-500/10 dark:bg-green-500/20 blur-3xl rounded-full animate-pulse-slow-delay -z-10"></div>

        {/* --- STYLES POUR LES ANIMATIONS --- */}
        <style>{`
          @keyframes pulse-slow { 50% { opacity: 0.5; } }
          .animate-pulse-slow { animation: pulse-slow 6s infinite ease-in-out; }
          .animate-pulse-slow-delay { animation: pulse-slow 6s 3s infinite ease-in-out; }

          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in-up {
            animation: fadeInUp 0.8s ease-out forwards;
            opacity: 0;
          }

          /* Animation d'entrée du logo (inchangée) */
          @keyframes logo-animate {
            0% { transform: scale(0.7) rotate(-10deg); opacity: 0; }
            50% { transform: scale(1.1) rotate(5deg); opacity: 1; }
            100% { transform: scale(1) rotate(0deg); opacity: 1; }
          }
          
          /* NOUVEAU: Réaction du logo au "tap" */
          @keyframes logo-react {
            0%, 50%, 100% { transform: scale(1); }
            40% { transform: scale(1.08); } /* Réagit au tap */
          }

          /* NOUVEAU: Animation de la main qui "tape" */
          @keyframes hand-tap {
            0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.8; }
            30% { transform: translate(-20px, -20px) scale(1.1); opacity: 1; } /* Lève la main */
            40% { transform: translate(-18px, -18px) scale(1.05); } /* "Tap" */
            60% { transform: translate(0, 0) scale(1); opacity: 0.8; } /* Retour */
          }
          .animate-hand-tap {
            /* Commence après 1.5s, dure 3s, boucle infinie */
            animation: hand-tap 3s infinite ease-in-out 1.5s;
          }
        `}</style>

        {/* 1. Logo du titre en haut au centre */}
        <header
          className="pt-8 text-center opacity-0 animate-fade-in-up"
          style={{ animationDelay: "0.1s" }}
        >
          <h1 className="text-3xl font-bold font-['Poppins'] bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-green-400">
            QRevent
          </h1>
        </header>

        {/* 2. Section "Hero" (Bienvenue) */}
        <main className="flex-grow flex flex-col items-center justify-center p-6 text-center">
          <div
            className="relative w-48 h-auto mb-8 opacity-0 animate-fade-in-up"
            style={{ animationDelay: "0.3s" }}
          >
            {/* Le logo SVG animé */}
            <svg
              viewBox="0 0 100 120"
              className="w-full h-auto object-contain
                         drop-shadow-lg z-10 relative
                         animate-[logo-animate_1s_ease-out_forwards,logo-react_3s_ease-in-out_infinite_1.5s]" /* ✅ ANIMATION CORRIGÉE */
              alt="Logo QRevent"
            >
              <defs>
                <linearGradient
                  id="logo-gradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" style={{ stopColor: "#3B82F6" }} />{" "}
                  <stop offset="100%" style={{ stopColor: "#4338CA" }} />{" "}
                </linearGradient>
              </defs>
              <circle cx="50" cy="50" r="48" fill="url(#logo-gradient)" />
              <g fill="white">
                <rect x="22" y="22" width="25" height="25" rx="2" />
                <rect
                  x="27"
                  y="27"
                  width="15"
                  height="15"
                  rx="1"
                  fill="url(#logo-gradient)"
                />
                <rect x="53" y="22" width="25" height="25" rx="2" />
                <rect
                  x="58"
                  y="27"
                  width="15"
                  height="15"
                  rx="1"
                  fill="url(#logo-gradient)"
                />
                <rect x="22" y="53" width="25" height="25" rx="2" />
                <rect
                  x="27"
                  y="58"
                  width="15"
                  height="15"
                  rx="1"
                  fill="url(#logo-gradient)"
                />
                <rect x="53" y="53" width="7" height="7" rx="1" />
                <rect x="62" y="53" width="7" height="7" rx="1" />
                <rect x="71" y="62" width="7" height="7" rx="1" />
                <rect x="53" y="71" width="7" height="7" rx="1" />
                <rect x="62" y="71" width="7" height="7" rx="1" />
              </g>
              <text
                x="50"
                y="112"
                fontFamily="Poppins, sans-serif"
                fontSize="18"
                fontWeight="bold"
                textAnchor="middle"
                fill="url(#logo-gradient)"
                className="dark:fill-white"
              >
                QRevent
              </text>
            </svg>

            {/* Image de la main animée */}
            <img
              src="/handicon.png"
              alt="Icône de main qui scanne"
              className="absolute w-28 h-auto object-contain -right-10 -bottom-8 animate-hand-tap z-20"
            />
          </div>

          <h2
            className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 font-['Poppins'] leading-tight opacity-0 animate-fade-in-up"
            style={{ animationDelay: "0.5s" }}
          >
            L'événementiel,
            <br />
            simplifié.
          </h2>
          <p
            className="text-lg text-gray-600 dark:text-gray-400 max-w-md mb-10 opacity-0 animate-fade-in-up"
            style={{ animationDelay: "0.7s" }}
          >
            Créez, gérez et participez à vos événements avec la puissance du QR
            code.
          </p>

          {/* 3. Boutons d'Action (CTA) */}
          <div
            className="w-full max-w-sm space-y-4 opacity-0 animate-fade-in-up"
            style={{ animationDelay: "0.9s" }}
          >
            <button
              onClick={handleExploreEvents}
              className="group flex items-center justify-center w-full py-4 px-6 bg-blue-600 text-white font-bold rounded-xl shadow-lg 
                         hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800
                         transition-all duration-300 transform hover:scale-[1.03]"
            >
              Explorer les événements
              <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
            </button>

            <button
              onClick={handleCreateEvent}
              className="w-full py-4 px-6 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 
                         font-semibold rounded-xl shadow-sm hover:bg-gray-200 dark:hover:bg-gray-600 
                         transition-all duration-300 transform hover:scale-[1.03]"
            >
              Créer un événement
            </button>
          </div>
        </main>

        {/* 4. Pied de page */}
        <footer
          className="p-6 text-center opacity-0 animate-fade-in-up"
          style={{ animationDelay: "1.1s" }}
        >
          <p className="text-xs text-gray-500 dark:text-gray-400">
            En continuant, vous acceptez nos{" "}
            <Link to="/terms" className="text-blue-500 hover:underline">
              Conditions d'utilisation
            </Link>{" "}
            et{" "}
            <Link to="/privacy" className="text-blue-500 hover:underline">
              Politique de confidentialité
            </Link>
            .
          </p>
        </footer>
      </div>
    </div>
  );
};

export default OpenPage;
