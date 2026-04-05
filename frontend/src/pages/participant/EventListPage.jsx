import React, { useState } from "react";
import MainLayout from "../../components/layout/MainLayout";
import EventList from "../../features/events/components/EventList";
import SearchAndFilter from "../../features/events/components/SearchFilter";
import { useEvents } from "../../hooks/useEvents";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { History, ArrowLeft, LayoutGrid } from "lucide-react";

const EventListPage = () => {
  const navigate = useNavigate();
  const { name: categoryName } = useParams();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("query") || "";

  const [query, setQuery] = useState(initialQuery);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const { data: events, isLoading, isError, error } = useEvents();

  if (isLoading)
    return (
      <MainLayout>
        <div className="max-w-[1900px] mx-auto px-8 py-50 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500 mx-auto mb-6"></div>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Chargement des événements...</p>
        </div>
      </MainLayout>
    );

  if (isError)
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <div className="bg-red-50 p-8 rounded-3xl inline-block border border-red-100">
            <p className="text-red-600 font-bold text-sm">Erreur: {error.message}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-red-600 text-white rounded-xl text-xs font-bold"
            >
              Réessayer
            </button>
          </div>
        </div>
      </MainLayout>
    );

  const getTitle = () => {
    if (categoryName) return categoryName;
    const q = searchParams.get("query");
    return q ? `Résultats pour "${q}"` : "Tous les événements";
  };

  const filteredEvents = (events || [])
    .filter((event) => {
      const q = query.toLowerCase();
      const matchesQuery =
        event.name?.toLowerCase().includes(q) ||
        event.description?.toLowerCase().includes(q) ||
        event.location?.toLowerCase().includes(q) ||
        event.city?.toLowerCase().includes(q);

      const categoryFilter = searchParams.get("categories")?.split(",");
      const matchesCategory =
        !categoryFilter || categoryFilter[0] === "" ||
        categoryFilter.includes(event.category?._id || event.category?.id || event.category);

      const typeFilter = searchParams.get("types")?.split(",");
      const matchesType = !typeFilter || typeFilter[0] === "" || typeFilter.some(t => {
        if (t === "free") return event.price === 0;
        if (t === "paid") return event.price > 0;
        return true;
      });

      const formatFilter = searchParams.get("formats")?.split(",");
      const matchesFormat = !formatFilter || formatFilter[0] === "" || formatFilter.includes(event.format || event.type);

      const cityFilter = searchParams.get("cities")?.split(",");
      const matchesCity = !cityFilter || cityFilter[0] === "" || cityFilter.includes(event.city);

      const dayFilter = searchParams.get("day");
      const matchesDay = !dayFilter || new Date(event.startDate).toISOString().split('T')[0] === dayFilter;

      return matchesQuery && matchesCategory && matchesType && matchesFormat && matchesCity && matchesDay;
    })
    .filter((event) => {
      const dateFilter = searchParams.get("date");
      if (!dateFilter) return true;
      const eventDay = new Date(event.startDate);
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);

      if (dateFilter === "today") return eventDay.toDateString() === today.toDateString();
      if (dateFilter === "tomorrow") return eventDay.toDateString() === tomorrow.toDateString();
      if (dateFilter === "week") return eventDay >= today && eventDay <= nextWeek;
      return true;
    });

  const eventsPerPage = 12;
  const startIndex = (currentPage - 1) * eventsPerPage;
  const currentEvents = filteredEvents.slice(startIndex, startIndex + eventsPerPage);
  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);

  return (
    <MainLayout>
      <div className="min-h-screen font-sans bg-slate-50/50 pb-20">
        
        <div className="bg-white border-b border-slate-100 pt-8 pb-10 md:pt-12 md:pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => navigate(-1)}
                  className="p-2 text-slate-400 hover:text-slate-900 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">
                  <LayoutGrid className="w-3 h-3" />
                  <span>{filteredEvents.length} événements</span>
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                  <h1 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight leading-none">
                    {getTitle()}
                  </h1>
                  <p className="text-sm md:text-base text-slate-500 max-w-xl font-medium">
                    Parcourez notre sélection exclusive pour vos prochaines expériences professionnelles.
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => navigate("/past-events")}
                    className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-slate-600 font-bold text-[11px] uppercase tracking-widest rounded-2xl border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm"
                  >
                    <History className="w-4 h-4 text-orange-500" />
                    Boutique Passée
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
          <div className="flex flex-col gap-12">
            <div className="sticky top-24 z-30">
              <SearchAndFilter
                query={query}
                setQuery={setQuery}
                isFilterOpen={isFilterOpen}
                setIsFilterOpen={setIsFilterOpen}
                setCurrentPage={setCurrentPage}
              />
            </div>

            <div className="animate-fade-in">
              <EventList
                currentEvents={currentEvents}
                currentPage={currentPage}
                totalPages={totalPages}
                setCurrentPage={setCurrentPage}
              />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fadeIn 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
      `}</style>
    </MainLayout>
  );
};

export default EventListPage;
