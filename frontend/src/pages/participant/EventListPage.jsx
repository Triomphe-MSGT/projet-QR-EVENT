// src/pages/participant/EventListPage.jsx
import React, { useState } from "react";
import MainLayout from "../../components/layouts/MainLayout";
import EventList from "../../components/events/EventList";
import SearchAndFilter from "../../components/events/SearchFilter";
import { useEvents } from "../../hooks/useEvents";

const EventListPage = () => {
  const [query, setQuery] = useState("");
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
    .filter((e) =>
      selectedCity === "Toutes" ? true : e.city === selectedCity
    );

  const eventsPerPage = 10;
  const startIndex = (currentPage - 1) * eventsPerPage;
  const endIndex = startIndex + eventsPerPage;
  const currentEvents = filteredEvents.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);

  return (
    <MainLayout>
      <div className="p-4 md:p-6 space-y-6">
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
