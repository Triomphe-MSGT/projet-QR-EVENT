import React, { useState } from "react";
import MainLayout from "../../components/layouts/MainLayout";
import EventList from "../../components/events/EventList";
import SearchAndFilter from "../../components/events/SearchFilter";
import { useEvents } from "../../hooks/useEvents";
import { useParams, useSearchParams } from "react-router-dom";

const EventListPage = () => {
  const { name: categoryName } = useParams();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("search") || "";

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

  const filteredEvents = (events || [])
    .filter((e) => e.name.toLowerCase().includes(query.toLowerCase()))
    .filter((e) => (selectedCity === "Toutes" ? true : e.city === selectedCity))
    .filter((e) => (!categoryName ? true : e.category?.name === categoryName));

  const eventsPerPage = 10;
  const startIndex = (currentPage - 1) * eventsPerPage;
  const endIndex = startIndex + eventsPerPage;
  const currentEvents = filteredEvents.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);

  const getTitle = () => {
    if (categoryName) return `Catégorie : ${categoryName}`;
    if (initialQuery) return `Résultats pour "${initialQuery}"`;
    return "Tous les Événements";
  };

  return (
    <MainLayout>
      <div className="p-4 md:p-6 space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {getTitle()}
        </h1>

        <SearchAndFilter
          query={query}
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
