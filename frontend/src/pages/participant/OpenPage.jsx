import React, { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const CAROUSEL_ITEMS = [
  {
    title: "Votre passeport numérique",
    subtitle: "Validez votre entrée aux événements en un seul scan.",
    bgColor: "2C3E50",
    text: "Scan+QR+Code",
  },
  {
    title: "Vibrez au rythme de la musique",
    subtitle: "Concerts, festivals et scènes ouvertes à portée de main.",
    bgColor: "87CEFA",
    text: "Concert",
  },
  {
    title: "Nourrissez votre curiosité",
    subtitle: "Conférences, workshops et sessions de networking.",
    bgColor: "90EE90",
    text: "Conférence",
  },
  {
    title: "Célébrez les moments uniques",
    subtitle: "Mariages, anniversaires et fêtes privées.",
    bgColor: "FFB6C1",
    text: "Mariage",
  },
  {
    title: "Ne manquez rien de l'action",
    subtitle: "Rencontres sportives, démonstrations et ateliers.",
    bgColor: "FFA500",
    text: "Sport",
  },
  {
    title: "Atteignez vos objectifs",
    subtitle: "Soutenances, galas et remises de diplômes.",
    bgColor: "9370DB",
    text: "Soutenance",
  },
];

// Composant de chargement
const LoadingScreen = () => {
  const positions = [
    { top: 5, left: 5 },
    { bottom: 5, left: 5 },
    { top: 5, right: 5 },
    { bottom: 5, right: 5 },
  ];

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-gradient-to-br from-blue-100 to-white z-[9999]">
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
          0% {
            opacity: 0;
            transform: scale(0.5);
          }
          50% {
            opacity: 0.3;
            transform: scale(1);
          }
          100% {
            opacity: 0;
            transform: scale(1.5);
          }
        }
        @keyframes pulse {
          0% {
            transform: scale(0.8);
          }
          100% {
            transform: scale(0.9);
          }
        }
      `}</style>
    </div>
  );
};

// En-tête
const Header = () => (
  <header className="fixed top-0 left-0 right-0 p-4 flex justify-between items-center bg-white shadow-md z-20">
    <h1 className="text-3xl font-bold font-['Poppins'] bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-green-400">
      Qr-Event
    </h1>
  </header>
);

// Élément du carrousel
const CarouselItem = ({ item }) => (
  <div
    className="min-w-full h-96 bg-cover bg-center flex flex-col justify-end p-6"
    style={{
      backgroundImage: `url('https://placehold.co/600x400/${item.bgColor}/FFFFFF?text=${item.text}')`,
    }}
  >
    <div className="text-white bg-gradient-to-t from-gray-900 via-transparent to-transparent -mx-6 -mb-6 p-6 pt-16">
      <h2 className="text-3xl font-bold mb-2 font-['Poppins']">{item.title}</h2>
      <p className="text-gray-200 text-base">{item.subtitle}</p>
    </div>
  </div>
);

// Carrousel principal
const Carousel = () => {
  const [index, setIndex] = useState(0);
  const total = CAROUSEL_ITEMS.length;

  useEffect(() => {
    const timer = setInterval(() => setIndex((i) => (i + 1) % total), 4000);
    return () => clearInterval(timer);
  }, [total]);

  return (
    <div className="relative w-full max-w-lg mb-8 overflow-hidden rounded-3xl shadow-xl">
      <div
        className="flex w-full transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {CAROUSEL_ITEMS.map((item, i) => (
          <CarouselItem key={i} item={item} />
        ))}
      </div>
      <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
        {CAROUSEL_ITEMS.map((_, i) => (
          <span
            key={i}
            onClick={() => setIndex(i)}
            className={`w-2.5 h-2.5 rounded-full cursor-pointer transition-all duration-300 ${
              i === index ? "bg-white scale-125" : "bg-gray-400/70"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

// Contenu principal
const MainContent = () => {
  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.auth);

  const handleCreateEvent = () => {
    if (!token || !user) {
      navigate("/login");
    } else {
      navigate("/createevent");
    }
  };
  const handleGoHome = () => {
    if (!token || !user) {
      navigate("/login");
    } else {
      navigate("/home");
    }
  };

  return (
    <>
      <main className="flex-grow p-4 md:p-8 text-center pt-24 md:pt-16 flex flex-col items-center">
        <Carousel />
        <section className="max-w-md mx-auto p-4">
          <h2 className="text-4xl font-extrabold text-gray-800 mb-4 font-['Poppins']">
            L'événementiel simplifié
          </h2>
          <p className="text-gray-600 mb-8">
            Trouvez, organisez et participez à des événements qui vous
            ressemblent, avec une gestion d'accès par QR code ultra-rapide.
          </p>
          <button
            onClick={handleGoHome}
            className="block w-full py-4 px-6 bg-blue-500 text-white font-extrabold rounded-xl shadow-lg hover:bg-blue-600 transition-transform transform hover:scale-[1.02] mb-4"
          >
            Explorer les événements
          </button>

          <button
            onClick={handleCreateEvent}
            className="block w-full py-4 px-6 bg-green-400 text-white font-extrabold rounded-xl shadow-lg hover:bg-green-500 transition-transform transform hover:scale-[1.02]"
          >
            Créer un événement
          </button>

          <p className="text-xs text-gray-500 mt-4">
            En utilisant Qr-Event, vous acceptez nos{" "}
            <a href="#" className="text-blue-500 hover:text-blue-700 underline">
              Conditions d'utilisation
            </a>{" "}
            et notre{" "}
            <a href="#" className="text-blue-500 hover:text-blue-700 underline">
              Politique de confidentialité
            </a>
            .
          </p>
        </section>
      </main>
      ;
    </>
  );
};

//Page principale
const OpenPage = () => {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-gray-50 flex flex-col min-h-screen">
      {loading && <LoadingScreen />}
      <div
        className={`min-h-screen pt-16 transition-all duration-1000 ${
          loading ? "blur-md opacity-0" : "blur-none opacity-100"
        }`}
      >
        <Header />
        <MainContent />
      </div>
    </div>
  );
};

export default OpenPage;
