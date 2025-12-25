import React, { useState } from "react";
import MainLayout from "../../components/layouts/MainLayout";
import EventList from "../../components/events/EventList";
import SearchAndFilter from "../../components/events/SearchFilter";
import { useEvents } from "../../hooks/useEvents";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { History, Sparkles, Search, Filter, X, ArrowLeft } from "lucide-react";

const EventListPage = () => {
  console.log("EventListPage: Rendering...");
  const { name: categoryName } = useParams();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("search") || "";

  const [query, setQuery] = useState(initialQuery);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const { data: events, isLoading, isError, error } = useEvents();
  console.log("EventListPage: events data received:", events?.length, "events");

  if (isLoading)
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Chargement des événements...</p>
        </div>
      </MainLayout>
    );

  if (isError)
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-[2rem] inline-block">
            <p className="text-red-600 dark:text-red-400 font-bold">Erreur: {error.message}</p>
          </div>
        </div>
      </MainLayout>
    );

  const dateFilter = searchParams.get("date");
  const typesFilter = searchParams.get("types")?.split(",") || [];
  const formatsFilter = searchParams.get("formats")?.split(",") || [];
  const citiesFilter = searchParams.get("cities")?.split(",") || [];
  const categoriesFilter = searchParams.get("categories")?.split(",") || [];
  const dayFilter = searchParams.get("day");
  const timeFilter = searchParams.get("time");

  const filteredEvents = (events || [])
    .filter((e) => e.name.toLowerCase().includes(query.toLowerCase()))
    .filter((e) => (!categoryName ? true : e.category?.name === categoryName))
    .filter((e) => {
      if (typesFilter.length > 0) {
        const isFree = e.price === 0;
        if (typesFilter.includes("free") && isFree) return true;
        if (typesFilter.includes("paid") && !isFree) return true;
        return false;
      }
      return true;
    })
    .filter((e) => {
      if (formatsFilter.length > 0) {
        const format = e.format || e.type;
        if (!format) return true; 
        return formatsFilter.includes(format);
      }
      return true;
    })
    .filter((e) => {
      if (citiesFilter.length > 0) {
        return citiesFilter.includes(e.city);
      }
      return true;
    })
    .filter((e) => {
      if (categoriesFilter.length > 0) {
        return categoriesFilter.includes(e.category?._id || e.category?.id || e.category);
      }
      return true;
    })
    .filter((e) => {
      if (dayFilter) {
        const eventDate = new Date(e.startDate).toISOString().split("T")[0];
        return eventDate === dayFilter;
      }
      return true;
    })
    .filter((e) => {
      if (timeFilter) {
        if (!e.time) return false;
        return e.time >= timeFilter;
      }
      return true;
    })
    .filter((e) => {
      const eventStart = new Date(e.startDate);
      const now = new Date();
      if (e.time) {
        const [hours, minutes] = e.time.split(":");
        eventStart.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      } else {
        eventStart.setHours(23, 59, 59, 999);
      }
      return eventStart >= now;
    })
    .filter((e) => {
      if (!dateFilter) return true;
      const eventDate = new Date(e.startDate);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      const eventDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());

      if (dateFilter === "today") return eventDay.getTime() === today.getTime();
      if (dateFilter === "tomorrow") return eventDay.getTime() === tomorrow.getTime();
      if (dateFilter === "week") return eventDay >= today && eventDay <= nextWeek;
      return true;
    });
  
  console.log("EventListPage: filteredEvents count:", filteredEvents.length);

  const eventsPerPage = 12;
  const startIndex = (currentPage - 1) * eventsPerPage;
  const endIndex = startIndex + eventsPerPage;
  const currentEvents = filteredEvents.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);

  const getTitle = () => {
    if (categoryName) return categoryName;
    if (initialQuery) return `"${initialQuery}"`;
    if (dateFilter === "today") return "Aujourd'hui";
    if (dateFilter === "tomorrow") return "Demain";
    if (dateFilter === "week") return "Cette semaine";
    return "Tous les Événements";
  };

  return (
    <MainLayout>
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
        {/* Mobile Sticky Header */}
        <div className="md:hidden sticky top-16 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 px-4 py-3 flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-600 dark:text-gray-400 active:scale-90 transition-transform"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text"
              placeholder="Rechercher..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2.5 bg-gray-100 dark:bg-gray-800 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`p-2.5 rounded-xl transition-all ${isFilterOpen ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>

        {/* Header Section (Desktop & Mobile Title) */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 pt-8 md:pt-16 pb-8 md:pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <button 
              onClick={() => navigate(-1)}
              className="hidden md:flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors mb-8 font-black text-xs tracking-widest uppercase"
            >
              <ArrowLeft className="w-4 h-4" /> Retour
            </button>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-blue-600 font-black text-[10px] md:text-xs uppercase tracking-[0.2em]">
                  <Sparkles className="w-4 h-4" />
                  <span>Découverte</span>
                </div>
                <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-tight bg-gradient-to-r from-gray-900 via-gray-700 to-gray-500 dark:from-white dark:via-gray-200 dark:to-gray-400 bg-clip-text text-transparent">
                  {getTitle()}
                </h1>
              </div>
              
              <div className="flex items-center gap-3">
                <Link 
                  to="/past-events"
                  className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 font-black text-[10px] uppercase tracking-widest rounded-2xl border border-gray-100 dark:border-gray-700 hover:text-blue-600 transition-colors"
                >
                  <History className="w-4 h-4" />
                  Historique
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12 space-y-8 md:space-y-12">
          {/* Hide SearchAndFilter on mobile as it's integrated in sticky header */}
          <div className="hidden md:block">
            <SearchAndFilter
              query={query}
              setQuery={setQuery}
              isFilterOpen={isFilterOpen}
              setIsFilterOpen={setIsFilterOpen}
              setCurrentPage={setCurrentPage}
            />
          </div>

          {/* Mobile Filter Panel (Overlay) */}
          {isFilterOpen && (
            <div className="md:hidden fixed inset-0 z-[100] bg-white dark:bg-gray-900 overflow-y-auto animate-fade-in">
              <div className="p-6 pb-24 space-y-8">
                <div className="flex items-center justify-between sticky top-0 bg-white dark:bg-gray-900 z-10 py-2">
                  <h2 className="text-xl font-black tracking-tighter text-gray-900 dark:text-white uppercase">Filtres</h2>
                  <button onClick={() => setIsFilterOpen(false)} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <SearchAndFilter
                  query={query}
                  setQuery={setQuery}
                  isFilterOpen={true}
                  setIsFilterOpen={setIsFilterOpen}
                  setCurrentPage={setCurrentPage}
                />
                <div className="fixed bottom-6 left-6 right-6 z-20">
                  <button 
                    onClick={() => setIsFilterOpen(false)}
                    className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl shadow-2xl shadow-blue-600/40 uppercase tracking-widest active:scale-95 transition-transform"
                  >
                    Appliquer
                  </button>
                </div>
              </div>
            </div>
          )}

          <EventList
            currentEvents={currentEvents}
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
          />
        </div>
      </div>
    </MainLayout>
  );
};

export default EventListPage;
