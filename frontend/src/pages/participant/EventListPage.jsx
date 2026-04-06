import React, { useState } from "react";
import MainLayout from "../../components/layout/MainLayout";
import EventList from "../../features/events/components/EventList";
import SearchAndFilter from "../../features/events/components/SearchFilter";
import { useEvents } from "../../hooks/useEvents";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { History, ArrowLeft, LayoutGrid, Search, Filter, Calendar, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { useMemo, useEffect } from "react";

const EventListPage = () => {
  const navigate = useNavigate();
  const { name: categoryName } = useParams();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("query") || "";

  const [query, setQuery] = useState(initialQuery);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const [recentIdx, setRecentIdx] = useState(0);

  const { data: events, isLoading, isError, error } = useEvents();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  const recentlyAdded = useMemo(() => {
    if (!events) return [];
    return [...events]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 5);
  }, [events]);

  const upcomingEvents = useMemo(() => {
    return filteredEvents
      .filter(ev => new Date(ev.startDate || ev.date) >= new Date().setHours(0,0,0,0))
      .sort((a, b) => new Date(a.startDate || a.date) - new Date(b.startDate || b.date));
  }, [filteredEvents]);

  const pastEvents = useMemo(() => {
    return filteredEvents
      .filter(ev => new Date(ev.startDate || ev.date) < new Date().setHours(0,0,0,0))
      .sort((a, b) => new Date(b.startDate || b.date) - new Date(a.startDate || a.date));
  }, [filteredEvents]);

  const nextRecent = () => setRecentIdx((prev) => (prev + 1) % recentlyAdded.length);
  const prevRecent = () => setRecentIdx((prev) => (prev - 1 + recentlyAdded.length) % recentlyAdded.length);

  if (isMobile) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-slate-50 font-sans pb-32">
          
          {/* 1. FIXED SEARCH & FILTER BAR */}
          <div className="sticky top-20 z-30 bg-white/95 backdrop-blur-xl border-b border-slate-100 p-3 flex items-center gap-2 -mx-4 px-8 mt-[-32px]">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Rechercher..." 
                className="w-full bg-slate-100 border-none rounded-xl py-2.5 pl-9 pr-4 text-sm focus:ring-2 focus:ring-orange-500/20 outline-none"
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

          {isFilterOpen && (
             <div className="bg-white border-b border-slate-100 p-4 -mx-4 px-8 animate-in slide-in-from-top duration-300">
                <SearchAndFilter 
                   query={query} setQuery={setQuery} 
                   isFilterOpen={isFilterOpen} setIsFilterOpen={setIsFilterOpen} 
                   setCurrentPage={setCurrentPage} 
                />
             </div>
          )}

          {/* 2. RECENTLY ADDED SLIDER */}
          {recentlyAdded.length > 0 && (
            <div className="mt-4 px-4">
              <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Récemment ajoutés (Nouveautés)</h2>
              <div className="relative group rounded-3xl overflow-hidden aspect-[16/9] shadow-lg bg-slate-200">
                {recentlyAdded.map((event, idx) => (
                  <div 
                    key={event._id || idx}
                    className={`absolute inset-0 transition-all duration-500 transform ${idx === recentIdx ? 'opacity-100 scale-100' : 'opacity-0 scale-110 pointer-events-none'}`}
                    onClick={() => navigate(`/events/${event._id}`)}
                  >
                    {event.coverImage || event.imageUrl ? (
                      <img src={event.coverImage || event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-orange-500 to-amber-600 text-white font-black text-5xl flex items-center justify-center">
                        {(event.title || event.name)?.charAt(0).toUpperCase() || "?"}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-4">
                      <span className="text-white font-bold text-sm truncate">{event.title || event.name}</span>
                      <span className="text-white/70 text-[10px]">{event.category?.name || "Événement"}</span>
                    </div>
                  </div>
                ))}
                
                <button onClick={(e) => { e.stopPropagation(); prevRecent(); }} className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/20 backdrop-blur-md rounded-full text-white active:scale-90 transition-transform"><ChevronLeft className="w-5 h-5" /></button>
                <button onClick={(e) => { e.stopPropagation(); nextRecent(); }} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/20 backdrop-blur-md rounded-full text-white active:scale-90 transition-transform"><ChevronRight className="w-5 h-5" /></button>
              </div>
            </div>
          )}

          {/* 3. AVAILABLE EVENTS */}
          <div className="mt-8 px-4 space-y-6">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Liste des événements</h2>
            <div className="space-y-4">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map(event => (
                  <div 
                    key={event._id} 
                    onClick={() => navigate(`/events/${event._id}`)} 
                    className="group bg-white p-4 rounded-[1.5rem] flex gap-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-slate-100 active:scale-[0.98] transition-all hover:shadow-md"
                  >
                    {/* Image / Fallback Container */}
                    <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 bg-slate-100 flex items-center justify-center relative">
                      {event.coverImage || event.imageUrl ? (
                        <img src={event.coverImage || event.imageUrl} className="w-full h-full object-cover transition-transform group-hover:scale-105" alt={event.title} />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center shadow-inner">
                          <span className="text-white font-black text-4xl drop-shadow-md">
                            {(event.title || event.name)?.charAt(0).toUpperCase() || "?"}
                          </span>
                        </div>
                      )}
                      {/* Price Badge on Image (Mobile) */}
                      <div className="absolute top-1 right-1 px-2 py-1 bg-white/90 backdrop-blur-md rounded-lg text-[9px] font-black text-slate-900 shadow-sm border border-white/50">
                        {event.price > 0 ? `${event.price.toLocaleString()} F` : 'GRATUIT'}
                      </div>
                    </div>

                    {/* Info Container */}
                    <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                           <span className="px-2 py-0.5 bg-orange-50 text-orange-600 text-[8px] font-black uppercase rounded-md border border-orange-100 tracking-wider">
                             {event.category?.name || "Événement"}
                           </span>
                        </div>
                        <h3 className="text-[15px] font-black text-slate-900 truncate leading-tight">
                          {event.title || event.name}
                        </h3>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                             <Calendar size={12} className="text-orange-500" strokeWidth={3} />
                             <span>{new Date(event.startDate || event.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                             <MapPin size={12} className="text-blue-500" strokeWidth={3} />
                             <span className="truncate">{event.location || event.city || "Abidjan, CI"}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-end mt-2">
                         <div className="p-1 px-3 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest active:bg-orange-600">
                            Réserver
                         </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs italic">Aucun événement trouvé</div>
              )}
            </div>
          </div>

          {/* 4. HISTORY */}
          {pastEvents.length > 0 && (
            <div className="mt-12 px-4 space-y-6">
              <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Événements passés</h2>
              <div className="space-y-4">
                {pastEvents.slice(0, 3).map(event => (
                  <div key={event._id} onClick={() => navigate(`/events/${event._id}`)} className="bg-slate-100/50 p-3 rounded-2xl flex gap-4 border border-slate-100 grayscale-[0.8] opacity-70">
                    <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-slate-200">
                      {event.coverImage || event.imageUrl ? (
                        <img src={event.coverImage || event.imageUrl} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-slate-300 flex items-center justify-center font-black text-slate-500 text-xl">
                          {(event.title || event.name)?.charAt(0).toUpperCase() || "?"}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col justify-center py-0.5">
                      <h3 className="text-xs font-bold text-slate-700 line-clamp-1">{event.title || event.name}</h3>
                      <div className="flex items-center gap-2 mt-1 text-[9px] font-medium text-slate-400"><History size={10} /><span>Terminé</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </MainLayout>
    );
  }

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
                <div className="space-y-3 text-center md:text-left">
                  <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-slate-900 tracking-tight leading-none">
                    {getTitle()}
                  </h1>
                  <p className="text-sm md:text-base text-slate-500 max-w-xl font-medium mx-auto md:mx-0">
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
