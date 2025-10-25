// src/pages/participant/HomePage.jsx
import React, { useState, useMemo } from "react"; // ✅ Assurez-vous que useMemo est importé
import { useNavigate, Link } from "react-router-dom";
import MainLayout from "../../components/layouts/MainLayout";
import ListCategorie from "../../components/categories/CategoryList";
import {
  Search,
  MapPin,
  Loader2,
  AlertTriangle,
  ArrowRight,
  MessageSquare,
  Info,
  ShieldCheck,
} from "lucide-react";
import { useEvents } from "../../hooks/useEvents";

import Button from "../../components/ui/Button"; // ✅ Assurez-vous que le chemin est correct
import { useUserProfile } from "../../hooks/useUserProfile";

// --- Composant EventPreviewCard (Inchangé) ---
const EventPreviewCard = ({ event }) => {
  const getImageUrl = (imagePath) => {
    if (!imagePath)
      return `https://placehold.co/600x400/A0AEC0/FFFFFF?text=${encodeURIComponent(
        event.name.charAt(0)
      )}`;
    if (imagePath.startsWith("http")) return imagePath;
    return `http://localhost:3001/${imagePath}`;
  };
  return (
    <Link
      to={`/events/${event.id}`}
      className="flex-shrink-0 w-64 snap-start rounded-xl overflow-hidden shadow-lg bg-white dark:bg-gray-800 transition transform hover:scale-105 duration-300 ease-in-out block"
    >
      <img
        src={getImageUrl(event.imageUrl)}
        alt={event.name}
        className="w-full h-36 object-cover"
      />
      <div className="p-4">
        <h3 className="font-semibold text-md truncate text-gray-800 dark:text-gray-100">
          {event.name}
        </h3>
        <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mt-1">
          {new Date(event.startDate).toLocaleDateString("fr-FR", {
            weekday: "short",
            day: "numeric",
            month: "short",
          })}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center">
          <MapPin size={12} className="mr-1 inline-block" /> {event.city}
        </p>
      </div>
    </Link>
  );
};

// --- Composant EventCarousel (CORRIGÉ) ---
const EventCarousel = () => {
  const { data: allEvents, isLoading, isError } = useEvents();

  // ✅ CORRECTION : Implémentation de la logique de filtrage à l'intérieur de useMemo
  const upcomingEvents = useMemo(() => {
    if (!allEvents) return []; // Si allEvents est undefined ou null, retourne un tableau vide

    const now = new Date();
    try {
      return allEvents
        .filter((event) => new Date(event.startDate) > now) // Garde les événements futurs
        .sort((a, b) => new Date(a.startDate) - new Date(b.startDate)) // Trie par date
        .slice(0, 5); // Prend les 5 premiers
    } catch (e) {
      console.error("Erreur lors du filtrage des événements:", e);
      return []; // Retourne un tableau vide en cas d'erreur de date
    }
  }, [allEvents]); // Se recalcule uniquement si 'allEvents' change

  // Gestion des états
  if (isLoading)
    return (
      <div className="h-48 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  if (isError)
    return (
      <div className="h-48 flex flex-col items-center justify-center text-red-500">
        <AlertTriangle className="w-8 h-8 mb-2" />
        <p>Impossible de charger les événements.</p>
      </div>
    );
  if (upcomingEvents.length === 0 && !isLoading)
    // Affiche seulement si pas en chargement
    return (
      <div className="h-48 flex items-center justify-center text-center text-gray-500 dark:text-gray-400">
        <p>Aucun événement à venir n'est programmé.</p>
      </div>
    );

  // Rendu du carrousel
  return (
    <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth -mx-4 px-4 md:-mx-6 md:px-6">
      {upcomingEvents.map(
        (
          event // ✅ Ne crashera plus
        ) => (
          <EventPreviewCard key={event.id} event={event} />
        )
      )}
      <Link
        to="/events"
        className="flex-shrink-0 w-64 snap-start rounded-xl shadow-lg bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-700 dark:to-gray-800 flex flex-col items-center justify-center text-center p-4 transition transform hover:scale-105 duration-300 ease-in-out"
      >
        <ArrowRight className="w-10 h-10 text-blue-500 dark:text-blue-400 mb-2" />
        <span className="font-semibold text-blue-700 dark:text-blue-300">
          Voir tous les événements
        </span>
      </Link>
    </div>
  );
};

// --- Composant HomePage (Le reste du fichier) ---
const HomePage = () => {
  const { data: user } = useUserProfile();
  const userName = user?.nom || "visiteur";

  const [query, setQuery] = useState("");
  const navigate = useNavigate();

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
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-100 p-4 md:p-8 space-y-12 md:space-y-16">
        {/* Section 1: Accueil et Recherche */}
        <section className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Bienvenue,{" "}
            <span className="text-blue-600 dark:text-blue-400">{userName}</span>{" "}
            !
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Découvrez, participez, organisez. Votre aventure événementielle
            commence ici.
          </p>
          <form
            onSubmit={handleSearchSubmit}
            className="relative flex items-center shadow-lg rounded-full bg-white dark:bg-gray-700 overflow-hidden border dark:border-gray-600 max-w-xl mx-auto"
          >
            <Search className="absolute left-4 w-5 h-5 text-gray-400 dark:text-gray-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Rechercher un événement, une ville..."
              className="w-full h-14 py-3 pl-12 pr-16 bg-transparent focus:outline-none dark:text-white dark:placeholder-gray-400"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-gray-700 transition duration-150"
              aria-label="Rechercher"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        </section>

        {/* Section 2: Événements à venir (Carrousel) */}
        <section className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-5 px-4 md:px-0">
            <h2 className="text-2xl font-semibold">Prochainement</h2>
            <Link
              to="/events"
              className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              Tout voir <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <EventCarousel />
        </section>

        {/* Section 3: Explorer par Catégorie */}
        <section className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-semibold mb-5 text-center sm:text-left">
            Explorer par Catégorie
          </h2>
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-xl p-2 md:p-4 border dark:border-gray-700">
            <ListCategorie />
          </div>
        </section>

        {/* Section 4: Contacter un Organisateur */}
        <section className="max-w-3xl mx-auto text-center bg-gradient-to-r from-indigo-50 dark:from-indigo-900/50 to-purple-50 dark:to-purple-900/50 p-8 rounded-xl shadow border dark:border-gray-700">
          <MessageSquare className="w-12 h-12 text-indigo-500 dark:text-indigo-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-3">
            Besoin d'aide ou d'informations ?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-5">
            Contactez directement les organisateurs pour toute question
            spécifique sur un événement.
          </p>
          <Link to="/events">
            <Button variant="secondary" size="md">
              Trouver un événement & contacter
            </Button>
          </Link>
        </section>

        {/* Section 5: À Propos de Nous */}
        <section className="max-w-3xl mx-auto text-center">
          <Info className="w-8 h-8 text-gray-500 dark:text-gray-400 mx-auto mb-3" />
          <h2 className="text-xl font-semibold mb-3">À Propos de Qr-Event</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
            Qr-Event est votre plateforme centralisée pour découvrir et gérer
            des événements au Cameroun. Notre mission est de simplifier l'accès
            à l'événementiel grâce à une technologie de QR code rapide et
            sécurisée, connectant organisateurs et participants.
          </p>
        </section>

        {/* Section 6: Pied de page */}
        <footer className="max-w-3xl mx-auto text-center border-t border-gray-200 dark:border-gray-700 pt-6 mt-12">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} Qr-Event. Tous droits réservés.
          </p>
          <div className="mt-2 space-x-4">
            <Link
              to="/privacy"
              className="text-xs text-blue-600 hover:underline dark:text-blue-400"
            >
              Politique de Confidentialité
            </Link>
            <span className="text-gray-400 dark:text-gray-600">|</span>
            <Link
              to="/terms"
              className="text-xs text-blue-600 hover:underline dark:text-blue-400"
            >
              Conditions d'Utilisation
            </Link>
          </div>
        </footer>
      </div>
    </MainLayout>
  );
};

export default HomePage;
