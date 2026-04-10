import React, { useState, useMemo, useEffect } from "react";
import MainLayout from "../../components/layout/MainLayout";
import EventList from "../../features/events/components/EventList";
import SearchAndFilter from "../../features/events/components/SearchFilter";
import { useEvents } from "../../hooks/useEvents";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { History, ArrowLeft, LayoutGrid, Search, Filter, Calendar, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { getSafeImageUrl } from "../../utils/imageUtils";

const EventListPage = () => {
  const navigate = useNavigate();
  const { name: categoryName } = useParams();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("query") || "";

  const [query, setQuery] = useState(initialQuery);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobile, setIsMobile] = useState(false);

  const { data: events, isLoading, isError, error } = useEvents();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const getTitle = () => {
    if (categoryName) return categoryName;
    const q = searchParams.get("query");
    return q ? `Résultats pour "${q}"` : "Tous les événements";
  };

  // Filtre principal — les événements passés sont masqués pour le public
  const filteredEvents = useMemo(() => {
    const now = new Date().setHours(0, 0, 0, 0);
    return (events || [])
      .filter((event) => {
        // Masquer les événements terminés (passés) pour tous les visiteurs publics
        const isUpcoming = new Date(event.startDate || event.date) >= now;
        if (!isUpcoming) return false;

        const q = query.toLowerCase();
        const matchesQuery =
          event.name?.toLowerCase().includes(q) ||
          event.title?.toLowerCase().includes(q) ||
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
      })
      .sort((a, b) => new Date(a.startDate || a.date) - new Date(b.startDate || b.date));
  }, [events, query, searchParams]);

  const eventsPerPage = 12;
  const startIndex = (currentPage - 1) * eventsPerPage;
  const currentEvents = filteredEvents.slice(startIndex, startIndex + eventsPerPage);
  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);

  if (isLoading)
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 py-32 text-center">
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

  /* ============================================================
     VUE MOBILE : barre de recherche + liste épurée uniquement
     ============================================================ */
  if (isMobile) {
    return (
      <MainLayout noPadding>
        <div className="min-h-screen bg-slate-50 font-sans pb-32">

          {/* BARRE DE RECHERCHE + FILTRE (sticky sous la navbar) */}
          <div className="sticky top-12 z-30 bg-white/95 backdrop-blur-xl border-b border-slate-100 flex items-center gap-2 px-4 py-3 mt-12 transition-all">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher un événement..."
                className="w-full bg-slate-100 border-none rounded-xl py-2.5 pl-9 pr-4 text-[13px] focus:ring-2 focus:ring-orange-500/20 outline-none font-semibold text-slate-700 placeholder:text-slate-400"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`p-2.5 rounded-xl transition-colors ${isFilterOpen ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-600'}`}
            >
              <Filter className="w-5 h-5" />
            </button>
          </div>

          {/* PANNEAU FILTRES AVANCÉS (dépliable) */}
          {isFilterOpen && (
            <div className="bg-white border-b border-slate-100 px-4 py-4 animate-in slide-in-from-top duration-300">
              <SearchAndFilter
                query={query} setQuery={setQuery}
                isFilterOpen={isFilterOpen} setIsFilterOpen={setIsFilterOpen}
                setCurrentPage={setCurrentPage}
              />
            </div>
          )}

          {/* LISTE DES ÉVÉNEMENTS À VENIR */}
          <div className="mt-5 px-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Événements à venir
              </p>
              <span className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-bold">
                {filteredEvents.length}
              </span>
            </div>

            <div className="space-y-3">
              {filteredEvents.length > 0 ? (
                filteredEvents.map(event => (
                  <div
                    key={event._id}
                    onClick={() => navigate(`/events/${event._id}`)}
                    className="group bg-white rounded-2xl flex gap-3 shadow-[0_1px_6px_rgba(0,0,0,0.05)] border border-slate-100 active:scale-[0.98] transition-all overflow-hidden p-3 cursor-pointer"
                  >
                    {/* Gauche : image */}
                     <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-slate-100 relative self-center">
                       {getSafeImageUrl(event.coverImage || event.imageUrl) ? (
                         <img
                           src={getSafeImageUrl(event.coverImage || event.imageUrl)}
                           className="w-full h-full object-cover"
                           alt={event.title || event.name}
                           loading="lazy"
                           decoding="async"
                         />
                       ) : (
                        <div className="w-full h-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
                          <span className="text-white font-black text-3xl drop-shadow">
                            {(event.title || event.name || "E").charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Droite : description */}
                    <div className="flex-1 flex flex-col justify-between min-w-0 py-0.5">
                      <div className="space-y-1">
                        <span className="px-2 py-0.5 bg-orange-50 text-orange-600 text-[8px] font-black uppercase rounded-md border border-orange-100 tracking-wider inline-block">
                          {event.category?.name || "Événement"}
                        </span>
                        <h3 className="text-[14px] font-black text-slate-800 line-clamp-2 leading-tight">
                          {event.title || event.name}
                        </h3>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500">
                            <Calendar size={11} className="text-orange-500 flex-shrink-0" strokeWidth={2.5} />
                            <span>
                              {new Date(event.startDate || event.date).toLocaleDateString('fr-FR', {
                                day: 'numeric', month: 'short', year: 'numeric'
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500">
                            <MapPin size={11} className="text-blue-500 flex-shrink-0" strokeWidth={2.5} />
                            <span className="truncate">{event.location || event.city || "Lieu à confirmer"}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[11px] font-black text-slate-700">
                          {event.price > 0 ? `${event.price.toLocaleString()} FCFA` : "Gratuit"}
                        </span>
                        <span className="px-3 py-1 bg-slate-900 text-white rounded-lg text-[9px] font-black uppercase tracking-widest">
                          Réserver
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200">
                  <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-slate-300">
                    <Calendar size={28} />
                  </div>
                  <p className="text-slate-500 font-semibold text-sm">Aucun événement trouvé</p>
                  <p className="text-slate-300 text-xs mt-1">Essayez de modifier votre recherche</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </MainLayout>
    );
  }

  /* ============================================================
     VUE DESKTOP : layout d'origine conservé intégralement
     ============================================================ */
  return (
    <MainLayout noPadding>
      <div className="min-h-screen font-sans bg-slate-50/50 pb-20 pt-16 md:pt-20">

        <div className="bg-white border-b border-slate-100 py-8 md:py-12">
          <div className="max-w-[1900px] mx-auto px-4 md:px-8">
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => navigate(-1)}
                  className="p-2 text-slate-400 hover:text-slate-500 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">
                  <LayoutGrid className="w-3 h-3" />
                  <span>{filteredEvents.length} événements</span>
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-3 text-center md:text-left">
                  <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-500 tracking-tight leading-none">
                    {getTitle()}
                  </h1>
                  <p className="text-sm md:text-base text-slate-400 max-w-xl font-medium mx-auto md:mx-0">
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

        <div className="max-w-[1900px] mx-auto px-4 md:px-8 py-10">
          <div className="flex flex-col gap-12">
            <div className="sticky top-16 md:top-20 z-30">
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
