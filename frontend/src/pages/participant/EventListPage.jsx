import React, { useState } from "react";
import MainLayout from "../../components/layouts/MainLayout";
import { getEvents } from "../../services/eventService";
import EventListWithPagination from "../../components/events/EventList";
import SearchAndFilter from "../../components/events/SearchFilter";
import { useQuery } from "@tanstack/react-query";

const EventListPage = () => {
  const [query, setQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCity, setSelectedCity] = useState("Toutes");

  // ⚡ Récupération des événements via React Query
  const {
    data: events,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["events"],
    queryFn: getEvents,
    staleTime: 1000 * 60 * 5, // garde les données 5 minutes en cache
  });

  if (isLoading) return <p>Chargement des événements...</p>;
  if (isError) return <p>Erreur lors du chargement des événements.</p>;

  // Filtrage local
  const filteredEvents = (events || [])
    .filter((e) => e.name.toLowerCase().includes(query.toLowerCase()))
    .filter((e) =>
      selectedCity === "Toutes" ? true : e.localisation === selectedCity
    );

  // Pagination
  const getEventsPerPage = (page) => (page === 1 ? 5 : 10);
  const eventsPerPage = getEventsPerPage(currentPage);

  const startIndex = currentPage === 1 ? 0 : 5 + (currentPage - 2) * 10;
  const endIndex = startIndex + eventsPerPage;

  const currentEvents = filteredEvents.slice(startIndex, endIndex);

  const totalPages = Math.ceil(
    filteredEvents.length > 5
      ? 1 + (filteredEvents.length - 5) / 10
      : filteredEvents.length > 0
      ? 1
      : 0
  );

  return (
    <MainLayout>
      {/* Barre de recherche + filtre */}
      <SearchAndFilter
        query={query}
        setQuery={setQuery}
        isFilterOpen={isFilterOpen}
        setIsFilterOpen={setIsFilterOpen}
        selectedCity={selectedCity}
        setSelectedCity={setSelectedCity}
        setCurrentPage={setCurrentPage}
      />

      {/* Liste + pagination */}
      <div className="mt-6">
        <EventListWithPagination
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
