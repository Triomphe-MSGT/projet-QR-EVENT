import React, { useState, useMemo, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import MainLayout from "../../components/layouts/MainLayout";
import ListCategorie from "../../components/categories/CategoryList"; // ✅ Vérifiez chemin
import {
  Search,
  MapPin,
  Loader2,
  AlertTriangle,
  ArrowRight,
  MessageSquare,
  Briefcase,
  Newspaper,
  Calendar,
  PlayCircle,
  Phone,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Button from "../../components/ui/Button";
import { useEvents } from "../../hooks/useEvents";
import { useUserProfile } from "../../hooks/useUserProfile";

// --- Service "factice" avec des liens vidéo réels ---
const fetchMockAds = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 1,
          title: "Vibrez au son de nos DJs Professionnels",
          sponsor: "EventSound Pro",
          link: "https://www.youtube.com/watch?v=K2K2J4SsAO8",
          videoUrl: "https://www.youtube.com/watch?v=zuCriEMBlg4",
        },
        {
          id: 2,
          title: "Service Traiteur d'Exception pour vos Événements",
          sponsor: "Gourmet Créations",
          link: "https://www.youtube.com/watch?v=K2K2J4SsAO8",
          videoUrl: "https://www.youtube.com/watch?v=zuCriEMBlg4",
        },
      ]);
    }, 1500);
  });
};

// --- Composant EventPreviewCard (Stylisé) ---
const EventPreviewCard = ({ event }) => {
  const getImageUrl = (imagePath) => {
    if (!imagePath)
      return `https://placehold.co/600x400/${Math.floor(
        Math.random() * 16777215
      ).toString(16)}/FFFFFF?text=${encodeURIComponent(
        event.name.charAt(0)
      )}&font=lora`;
    if (imagePath.startsWith("http")) return imagePath;
    return `http://localhost:3001/${imagePath}`;
  };

  const formatPrice = (price) => {
    if (!price || price === 0) return "Gratuit";
    return `${price.toLocaleString("fr-FR")} FCFA`;
  };

  return (
    <Link
      to={`/events/${event.id}`}
      className="flex-shrink-0 w-72 snap-start rounded-xl overflow-hidden shadow-lg bg-white dark:bg-gray-800 transition-all transform hover:shadow-2xl hover:-translate-y-1 duration-300 ease-in-out block group"
    >
      <div className="relative w-full h-40">
        <img
          src={getImageUrl(event.imageUrl)}
          alt={event.name}
          className="w-full h-full object-cover"
        />
        {event.category && (
          <span className="absolute top-2 right-2 bg-black/50 text-white text-xs font-semibold px-2 py-1 rounded-full backdrop-blur-sm">
            {event.category.emoji} {event.category.name}
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg truncate text-gray-800 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {event.name}
        </h3>
        <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mt-1">
          {new Date(event.startDate).toLocaleDateString("fr-FR", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 flex items-center">
          <MapPin size={14} className="mr-1.5 inline-block shrink-0" />
          <span className="truncate">{event.neighborhood || event.city}</span>
        </p>
        <p
          className={`text-md font-semibold mt-3 ${
            event.price === 0
              ? "text-green-600 dark:text-green-400"
              : "text-gray-800 dark:text-gray-100"
          }`}
        >
          {formatPrice(event.price)}
        </p>
      </div>
    </Link>
  );
};

// --- Composant EventCarousel ---
const EventCarousel = () => {
  const { data: allEvents, isLoading, isError } = useEvents();

  const upcomingEvents = useMemo(() => {
    if (!allEvents) return [];
    const now = new Date();
    try {
      return allEvents
        .filter((event) => new Date(event.startDate) > now)
        .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
        .slice(0, 5);
    } catch (e) {
      console.error("Erreur filtrage événements:", e);
      return [];
    }
  }, [allEvents]);

  if (isLoading)
    return (
      <div className="h-56 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  if (isError)
    return (
      <div className="h-56 flex flex-col items-center justify-center text-red-500">
        <AlertTriangle className="w-8 h-8 mb-2" />
        <p>Impossible de charger les événements.</p>
      </div>
    );
  if (upcomingEvents.length === 0 && !isLoading)
    return (
      <div className="h-56 flex items-center justify-center text-center text-gray-500 dark:text-gray-400">
        <p>Aucun événement à venir n'est programmé.</p>
      </div>
    );

  return (
    <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth -mx-4 px-4 md:-mx-6 md:px-6">
      {upcomingEvents.map((event) => (
        <EventPreviewCard key={event.id} event={event} />
      ))}
      <Link
        to="/events"
        className="flex-shrink-0 w-72 snap-start rounded-xl shadow-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex flex-col items-center justify-center text-center p-6 transition-all transform hover:shadow-2xl hover:-translate-y-1 duration-300 ease-in-out"
      >
        <div className="w-16 h-16 rounded-full bg-blue-500 text-white flex items-center justify-center mb-4">
          <ArrowRight className="w-8 h-8" />
        </div>
        <span className="font-semibold text-lg text-blue-700 dark:text-blue-300">
          Voir tous les événements
        </span>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Découvrez ce qui se passe près de chez vous.
        </p>
      </Link>
    </div>
  );
};

// --- Composant AdCard (Squelette de chargement) ---
const AdCardSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border dark:border-gray-700 p-4 animate-pulse">
    <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
      <PlayCircle className="w-12 h-12 text-gray-400 dark:text-gray-600" />
    </div>
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md mt-4 w-3/4"></div>
    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-md mt-2 w-1/2"></div>
  </div>
);

const AdCard = ({ ad }) => {
  const videoRef = useRef(null);

  const handleMouseEnter = () => {
    if (videoRef.current) {
      videoRef.current.play().catch((error) => {
        console.warn("Autoplay vidéo bloqué par le navigateur:", error);
      });
    }
  };

  // Fonction pour arrêter la vidéo à la sortie
  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0; // Rembobine au début
    }
  };

  return (
    <a
      href={ad.link}
      key={ad.id}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-white dark:bg-gray-800 rounded-xl shadow-lg border dark:border-gray-700 overflow-hidden group transition-all transform hover:shadow-2xl hover:-translate-y-1 duration-300 ease-in-out"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="w-full h-40 bg-black overflow-hidden relative">
        <video
          ref={videoRef} // Référence attachée
          src={ad.videoUrl}
          loop
          muted
          playsInline
          preload="metadata" // Charge juste assez pour démarrer
          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300"
        />
        {/* Superposition avec icône Play (disparaît au survol) */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-all duration-300">
          <div
            className="p-3 bg-white/20 rounded-full backdrop-blur-sm 
                        scale-100 group-hover:scale-0 group-hover:opacity-0 
                        transition-all duration-300"
          >
            <PlayCircle className="w-8 h-8 text-white opacity-90" />
          </div>
        </div>
      </div>
      <div className="p-4">
        <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
          {ad.sponsor} - Annonce
        </p>
        <h3 className="font-semibold text-md text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
          {ad.title}
        </h3>
      </div>
    </a>
  );
};

// --- Composant HomePage (Restructuré) ---
const HomePage = () => {
  const { data: user } = useUserProfile();
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const { data: ads, isLoading: isLoadingAds } = useQuery({
    queryKey: ["homeAds"],
    queryFn: fetchMockAds,
    staleTime: 1000 * 60 * 60,
  });

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const searchQuery = query.trim();
    navigate(
      searchQuery
        ? `/events?search=${encodeURIComponent(searchQuery)}`
        : "/events"
    );
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-100 p-4 md:p-8 space-y-16 md:space-y-24">
        <section className="max-w-4xl mx-auto text-center pt-8 pb-12 px-6 rounded-b-3xl md:rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-blue-700 dark:to-indigo-800 shadow-2xl">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-white leading-tight">
            Trouvez votre prochain événement
          </h1>
          <p className="text-lg text-blue-100 dark:text-blue-200 mb-8">
            Recherchez parmi des milliers de concerts, conférences, et plus
            encore.
          </p>
          <form
            onSubmit={handleSearchSubmit}
            className="relative flex items-center shadow-lg rounded-full bg-white/90 dark:bg-gray-800/90 overflow-hidden border border-transparent max-w-xl mx-auto backdrop-blur-sm"
          >
            <Search className="absolute left-5 w-5 h-5 text-gray-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Rechercher un événement..."
              className="w-full h-16 py-4 pl-14 pr-20 bg-transparent focus:outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-lg"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button
              type="submit"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 transition duration-150"
              aria-label="Rechercher"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        </section>

        {/* --- SECTION 2: EXPLORER PAR CATÉGORIE --- */}
        <section className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 text-center sm:text-left">
            Catégories
          </h2>
          <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-4 md:p-6 border dark:border-gray-700">
            <ListCategorie />
          </div>
        </section>

        {/* --- SECTION 3: ÉVÉNEMENTS À LA UNE --- */}
        <section className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6 px-4 md:px-0">
            <h2 className="text-3xl font-bold dark:text-white">À la une</h2>
            <Link
              to="/events"
              className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline font-semibold"
            >
              Tout voir <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <EventCarousel />
        </section>

        {/* --- SECTION 4: ESPACE PUBLICITAIRE (MISE À JOUR) --- */}
        <section className="max-w-4xl mx-auto px-4 md:px-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold dark:text-white">Sponsorisé</h2>
            <a
              href="#"
              className="text-xs text-gray-500 dark:text-gray-400 hover:underline"
            >
              Pourquoi cette pub ?
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {isLoadingAds ? (
              <>
                <AdCardSkeleton />
                <AdCardSkeleton />
              </>
            ) : (
              // Utilisation du nouveau composant AdCard
              ads?.map((ad) => <AdCard key={ad.id} ad={ad} />)
            )}
          </div>
        </section>

        {/* --- SECTION 5: ACTUALITÉS --- */}
        <section className="max-w-4xl mx-auto px-4 md:px-0">
          <h2 className="text-3xl font-bold mb-6 text-center sm:text-left">
            Actualités
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border dark:border-gray-700 p-6 flex items-start gap-4">
              <div className="flex-shrink-0 p-3 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                <Newspaper className="w-6 h-6 text-blue-600 dark:text-blue-300" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1 dark:text-white">
                  Lancement de Qr-Event
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Notre plateforme est désormais ouverte ! Créez votre premier
                  événement dès aujourd'hui.
                </p>
                <a
                  href="#"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline mt-2 inline-block"
                >
                  Lire la suite...
                </a>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border dark:border-gray-700 p-6 flex items-start gap-4">
              <div className="flex-shrink-0 p-3 bg-green-100 dark:bg-green-900/50 rounded-lg">
                <Calendar className="w-6 h-6 text-green-600 dark:text-green-300" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1 dark:text-white">
                  Partenariat avec les Villes
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Nous collaborons avec Douala et Yaoundé pour les événements
                  culturels.
                </p>
                <a
                  href="#"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline mt-2 inline-block"
                >
                  Lire la suite...
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* --- SECTION 6: APPEL À L'ACTION (CONTACT) --- */}
        <section className="max-w-4xl mx-auto px-4 md:px-0">
          <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-8 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-700 dark:to-purple-700 text-white p-8 md:p-12 rounded-2xl shadow-2xl">
            <div>
              <MessageSquare className="w-12 h-12 opacity-80 mb-4" />
              <h2 className="text-3xl font-bold mb-3">
                Vous êtes organisateur ?
              </h2>
              <p className="text-indigo-200 leading-relaxed">
                Utilisez nos outils pour créer, gérer, et sécuriser vos
                événements. De la billetterie à la validation par QR code, nous
                avons ce qu'il vous faut.
              </p>
            </div>
            <div className="text-center">
              {user?.role === "Participant" ? (
                <Link to="/user-profile">
                  <Button
                    variant="light"
                    size="lg"
                    className="w-full md:w-auto"
                  >
                    Devenir Organisateur
                  </Button>
                </Link>
              ) : (
                <Link to="/createevent">
                  <Button
                    variant="light"
                    size="lg"
                    className="w-full md:w-auto"
                  >
                    Créer un Événement
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* --- SECTION 7: À PROPOS DE NOUS --- */}
        <section className="max-w-3xl mx-auto text-center px-4 md:px-0">
          <Briefcase className="w-10 h-10 text-gray-500 dark:text-gray-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">À Propos de Qr-Event</h2>
          <p className="text-md text-gray-600 dark:text-gray-400 leading-relaxed">
            Qr-Event est votre plateforme centralisée pour découvrir et gérer
            des événements au Cameroun et au-delà. Notre mission est de
            simplifier l'accès à l'événementiel grâce à une technologie de QR
            code rapide et sécurisée, connectant organisateurs et participants.
          </p>
        </section>

        {/* --- SECTION 8: FOOTER --- */}
        <footer className="max-w-3xl mx-auto text-center border-t border-gray-200 dark:border-gray-700 pt-8 mt-16 px-4 md:px-0">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} Qr-Event. Tous droits réservés.
          </p>
          <div className="mt-3 space-x-4">
            <Link
              to="/privacy"
              className="text-sm text-blue-600 hover:underline dark:text-blue-400"
            >
              Politique de Confidentialité
            </Link>
            <span className="text-gray-400 dark:text-gray-600">|</span>
            <Link
              to="/terms"
              className="text-sm text-blue-600 hover:underline dark:text-blue-400"
            >
              Conditions d'Utilisation
            </Link>

            <a
              href="tel:+237657785435"
              className="text-sm text-blue-600 hover:underline dark:text-blue-400 flex items-center gap-1"
            >
              <Phone size={14} /> Contacter l'Admin (+237 657785435)
            </a>
          </div>
        </footer>
      </div>
    </MainLayout>
  );
};

export default HomePage;
