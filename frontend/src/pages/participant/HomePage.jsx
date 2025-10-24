// src/pages/participant/HomePage.jsx (Version Corrigée)

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom"; // 1. Importer useNavigate et Link
import MainLayout from "../../components/layouts/MainLayout";
import ListCategorie from "../../components/categories/CategoryList";
import {
  Search,
  MapPin,
  Loader2,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { useEvents } from "../../hooks/useEvents";
import { useUserProfile } from "../../hooks/useUserProfile"; // Pour le nom

// --- (Composant EventPreviewCard - inchangé) ---
const EventPreviewCard = ({ event }) => {
  const getImageUrl = (imagePath) => {
    if (!imagePath)
      return "https://images.pexels.com/photos/1181354/pexels-photo-1181354.jpeg";
    if (imagePath.startsWith("http")) return imagePath;
    return `http://localhost:3001/${imagePath}`;
  };
  return (
    <div className="flex-shrink-0 w-64 snap-start rounded-xl overflow-hidden shadow-lg bg-white dark:bg-[#242526]">
      <img
        src={getImageUrl(event.imageUrl)}
        alt={event.name}
        className="w-full h-32 object-cover"
      />
      <div className="p-4">
        <h3 className="font-semibold text-lg truncate text-[#050505] dark:text-[#E4E6EB]">
          {event.name}
        </h3>
        <p className="text-sm text-blue-500 dark:text-blue-400">
          {new Date(event.startDate).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
          })}
        </p>
        <p className="text-sm text-[#65676B] dark:text-[#B0B3B8] mt-1 truncate">
          📍 {event.city}
        </p>
      </div>
    </div>
  );
};

// --- (Composant EventCarousel - inchangé) ---
const EventCarousel = () => {
  const { data: allEvents, isLoading, isError } = useEvents();
  const getUpcomingEvents = () => {
    if (!allEvents) return [];
    const now = new Date();
    return allEvents
      .filter((event) => new Date(event.startDate) > now)
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
      .slice(0, 5);
  };
  const upcomingEvents = getUpcomingEvents();

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
  if (upcomingEvents.length === 0)
    return (
      <div className="h-48 flex items-center justify-center text-center text-gray-500 dark:text-gray-400">
        <p>Aucun événement à venir n'est programmé.</p>
      </div>
    );

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth">
      {upcomingEvents.map((event) => (
        <EventPreviewCard key={event.id} event={event} />
      ))}
    </div>
  );
};

// --- (Composant HomePage - MODIFIÉ) ---
const HomePage = () => {
  const { data: user } = useUserProfile();
  const userName = user?.nom || "Utilisateur"; // Récupère le nom

  // 2. Gérer l'état de la recherche et la navigation
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  // 3. Fonction pour gérer la soumission de la recherche
  const handleSearchSubmit = (e) => {
    e.preventDefault(); // Empêche le rechargement de la page
    if (query.trim()) {
      // 4. Navigue vers la page de liste en passant le 'query' comme paramètre d'URL
      navigate(`/events?search=${encodeURIComponent(query)}`);
    } else {
      navigate("/events"); // Si la recherche est vide, va à la liste de tous les événements
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen ... bg-[#F0F2F5] dark:bg-[#18191A] ... p-4 md:p-6">
        {/* --- SECTION 1: ACCUEIL ET RECHERCHE (MODIFIÉE) --- */}
        <div className="max-w-3xl mx-auto mb-10">
          <h1 className="text-3xl font-bold mb-2 dark:text-white">
            Bonjour, {userName} 👋
          </h1>
          <p className="text-lg text-[#65676B] dark:text-[#B0B3B8] mb-6">
            Prêt à découvrir votre prochain événement ?
          </p>

          {/* 5. Transformer la div de recherche en formulaire */}
          <form
            onSubmit={handleSearchSubmit}
            className="relative flex items-center shadow-lg rounded-full bg-white dark:bg-[#242526] overflow-hidden"
          >
            <input
              type="text"
              placeholder="Rechercher un événement..."
              className="w-full py-4 pl-12 pr-4 bg-transparent focus:outline-none"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Search className="absolute left-4 w-5 h-5 text-gray-400" />

            {/* Bouton de soumission optionnel (on peut aussi appuyer sur "Entrée") */}
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition"
              aria-label="Rechercher"
            >
              <Search className="w-5 h-5" />
            </button>
          </form>
        </div>

        {/* --- SECTION 2: CARROUSEL D'ÉVÉNEMENTS (MODIFIÉE) --- */}
        <div className="max-w-3xl mx-auto mb-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold dark:text-white">
              Evenements prochain...
            </h2>
            {/* 6. LE NOUVEAU BOUTON "EXPLORER TOUT" */}
            <Link
              to="/events"
              className="flex items-center gap-1 text-blue-500 dark:text-blue-400 hover:underline font-medium"
            >
              Voir tout <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <EventCarousel />
        </div>

        {/* --- SECTION 3: CATÉGORIES (Inchangée) --- */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-semibold mb-4 dark:text-white">
            Explorer par catégorie
          </h2>
          <div className="bg-white dark:bg-[#242526] ... rounded-xl ...">
            <ListCategorie />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default HomePage;
