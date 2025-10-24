// src/pages/participant/EventListPage.jsx (Corrigé)

import React, { useState } from "react";
import MainLayout from "../../components/layouts/MainLayout";
import EventList from "../../components/events/EventList";
import SearchAndFilter from "../../components/events/SearchFilter";
import { useEvents } from "../../hooks/useEvents";
// 1. IMPORTER 'useSearchParams' en plus de 'useParams'
import { useParams, useSearchParams } from "react-router-dom";

const EventListPage = () => {
  // 2. LIRE les deux types de paramètres de l'URL
  const { name: categoryName } = useParams(); // Pour /categories/Conférence
  const [searchParams] = useSearchParams(); // Pour ?search=...
  const initialQuery = searchParams.get("search") || ""; // Récupère le terme de recherche

  // 3. MODIFICATION : Initialiser 'query' avec le terme de l'URL
  const [query, setQuery] = useState(initialQuery);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCity, setSelectedCity] = useState("Toutes");

  const { data: events, isLoading, isError, error } = useEvents();

  if (isLoading)
    return (
      <MainLayout>
        <div className="p-6 text-center">Chargement...</div>
      </MainLayout>
    );
  if (isError)
    return (
      <MainLayout>
        <div className="p-6 text-center text-red-500">
          Erreur: {error.message}
        </div>
      </MainLayout>
    );

  // 4. La logique de filtrage est maintenant correcte
  // car 'query' est initialisé avec la valeur de l'URL.
  const filteredEvents = (events || [])
    .filter((e) => e.name.toLowerCase().includes(query.toLowerCase()))
    .filter((e) => (selectedCity === "Toutes" ? true : e.city === selectedCity))
    .filter((e) => (!categoryName ? true : e.category?.name === categoryName));

  const eventsPerPage = 10;
  const startIndex = (currentPage - 1) * eventsPerPage;
  const endIndex = startIndex + eventsPerPage;
  const currentEvents = filteredEvents.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);

  // 5. AJOUT: Créer un titre dynamique
  const getTitle = () => {
    if (categoryName) return `Catégorie : ${categoryName}`;
    if (initialQuery) return `Résultats pour "${initialQuery}"`;
    return "Tous les Événements";
  };

  return (
    <MainLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Titre dynamique */}
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {getTitle()}
        </h1>

        <SearchAndFilter
          query={query} // Le champ est pré-rempli
          setQuery={setQuery}
          isFilterOpen={isFilterOpen}
          setIsFilterOpen={setIsFilterOpen}
          selectedCity={selectedCity}
          setSelectedCity={setSelectedCity}
          setCurrentPage={setCurrentPage}
        />
        <EventList
          currentEvents={currentEvents}
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
        />
      </div>
    </MainLayout>
  );
};

export default EventListPage;
