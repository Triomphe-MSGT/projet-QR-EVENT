import React, { useState, useMemo, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { API_BASE_URL } from "../../slices/axiosInstance";

import MainLayout from "../../components/layouts/MainLayout";
import ListCategorie from "../../components/categories/CategoryList";
import HeroSection from "../../components/home/HeroSection";
import EventCard from "../../components/events/EventCard";
import {
  MapPin,
  Loader2,
  AlertTriangle,
  ArrowRight,
  MessageSquare,
  Briefcase,
  History,
  Sparkles,
  Zap,
  TrendingUp,
  ChevronRight
} from "lucide-react";

import Button from "../../components/ui/Button";
import { useEvents } from "../../hooks/useEvents";
import { useUserProfile } from "../../hooks/useUserProfile";
import UpgradeToOrganizerModal from "../../components/dashboard/UpgradeToOrganizerModal";
import NewsFeed from "../../components/NewsFeed";

const STATIC_BASE_URL = API_BASE_URL.replace("/api", "");

// --- Composant EventCarousel ---
const EventCarousel = ({ dateFilter }) => {
  const { data: allEvents, isLoading, isError } = useEvents();
  const navigate = useNavigate();

  const filteredEvents = useMemo(() => {
    if (!allEvents) return [];
    console.log("EventCarousel: Total events received:", allEvents.length);
    const now = new Date();
    
    try {
      return allEvents
        .filter((event) => {
          if (!event.startDate) return false;
          const eventStart = new Date(event.startDate);
          if (event.time) {
            const [hours, minutes] = event.time.split(":");
            eventStart.setHours(parseInt(hours), parseInt(minutes), 0, 0);
          } else {
            eventStart.setHours(23, 59, 59, 999);
          }

          // Basic "upcoming" check
          if (eventStart < now && dateFilter === 'all') return false;

          if (dateFilter === 'today') {
            const today = new Date();
            return eventStart.toDateString() === today.toDateString();
          }
          if (dateFilter === 'tomorrow') {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            return eventStart.toDateString() === tomorrow.toDateString();
          }
          if (dateFilter === 'week') {
            const nextWeek = new Date();
            nextWeek.setDate(nextWeek.getDate() + 7);
            return eventStart >= now && eventStart <= nextWeek;
          }

          return eventStart >= now;
        })
        .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
        .slice(0, 8);
    } catch (e) {
      console.error("Erreur filtrage événements:", e);
      return [];
    }
  }, [allEvents, dateFilter]);

  console.log("EventCarousel: filteredEvents count:", filteredEvents.length);

  if (isLoading)
    return (
      <div className="h-80 flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-400 font-black text-[10px] tracking-widest">Chargement des pépites...</p>
      </div>
    );
    
  if (isError)
    return (
      <div className="h-80 flex flex-col items-center justify-center text-red-500 bg-red-50 dark:bg-red-900/10 rounded-[3rem]">
        <AlertTriangle className="w-10 h-10 mb-4" />
        <p className="font-bold">Impossible de charger les événements.</p>
      </div>
    );

  if (filteredEvents.length === 0 && !isLoading)
    return (
      <div className="h-80 flex flex-col items-center justify-center text-center bg-gray-50 dark:bg-gray-900/50 rounded-[3rem] border border-dashed border-gray-200 dark:border-gray-700 animate-fade-in-up">
        <p className="text-gray-500 font-bold">Aucun événement trouvé pour cette période.</p>
      </div>
    );

  return (
    <div className="relative group animate-fade-in-up">
      <div className="flex gap-6 overflow-x-auto pb-10 snap-x snap-mandatory no-scrollbar -mx-4 px-4 md:mx-0 md:px-0 scroll-smooth">
        {filteredEvents.map((event) => (
          <div key={event._id || event.id} className="shrink-0 w-[85vw] sm:w-[400px] snap-center">
            <EventCard 
              event={event} 
              handleDetails={() => navigate(`/events/${event._id || event.id}`)} 
            />
          </div>
        ))}
        
        {/* View All Card */}
        <Link
          to="/events"
          className="shrink-0 w-[85vw] sm:w-[300px] snap-center rounded-[2.5rem] bg-blue-600 flex flex-col items-center justify-center text-center p-8 transition-all transform hover:scale-[1.02] shadow-2xl shadow-blue-500/20 group/all"
        >
          <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mb-6 group-hover/all:scale-110 transition-transform duration-500">
            <ArrowRight className="w-10 h-10 text-white" />
          </div>
          <h3 className="font-black text-2xl text-white tracking-tighter leading-none mb-2">
            Voir tout
          </h3>
          <p className="text-blue-100 text-sm font-medium opacity-80">
            Découvrez plus de {allEvents?.length || 0} événements passionnants.
          </p>
        </Link>
      </div>

      {/* Mobile Scroll Indicator */}
      <div className="md:hidden absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none animate-bounce-horizontal">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-2 rounded-full shadow-lg border border-white/20">
          <ChevronRight className="w-5 h-5 text-blue-600" />
        </div>
      </div>
    </div>
  );
};

// --- Composant HomePage ---
const HomePage = () => {
  const { data: user } = useUserProfile();
  const navigate = useNavigate();
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState('all');

  const filters = [
    { label: "Tout", value: "all" },
    { label: "Aujourd'hui", value: "today" },
    { label: "Demain", value: "tomorrow" },
    { label: "Cette semaine", value: "week" },
  ];

  return (
    <>
      <MainLayout>
        <div className="min-h-screen bg-white dark:bg-gray-900 overflow-hidden">
          
          {/* Hero Section */}
          <HeroSection />

          {/* Categories Section */}
          <section className="max-w-7xl mx-auto px-4 py-24">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-blue-600 font-black text-xs tracking-[0.2em]">
                  <Sparkles className="w-4 h-4" />
                  <span>Exploration</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-gray-900 dark:text-white leading-none">
                  Parcourir par <br /> <span className="text-blue-600">Catégorie</span>
                </h2>
              </div>
            </div>
            
            <ListCategorie />

            {/* Date Filters - Scrollable on mobile */}
            <div className="relative mt-12">
              <div className="flex overflow-x-auto pb-4 gap-3 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap md:justify-center scroll-smooth">
                {filters.map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => setDateFilter(filter.value)}
                    className={`px-6 md:px-8 py-3 md:py-3.5 rounded-2xl font-black text-[10px] md:text-xs tracking-widest transition-all border-2 shrink-0 md:shrink ${
                      dateFilter === filter.value
                        ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/25 scale-105"
                        : "bg-transparent border-gray-100 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:border-blue-600/30 hover:text-blue-600"
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
              {/* Mobile Scroll Indicator */}
              <div className="md:hidden absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none animate-pulse">
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </div>
            </div>
          </section>

          {/* Featured Events Section */}
          <section className="bg-gray-50 dark:bg-gray-800/50 py-24">
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex items-center justify-between mb-12">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-amber-500 font-black text-xs tracking-[0.2em]">
                    <TrendingUp className="w-4 h-4" />
                    <span>Tendances</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-gray-900 dark:text-white leading-none">
                    À la une
                  </h2>
                </div>
                
                <Link
                  to="/events"
                  className="hidden md:flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 rounded-2xl text-gray-900 dark:text-white font-black text-xs tracking-widest border border-gray-100 dark:border-gray-700 hover:text-blue-600 transition-all shadow-sm"
                >
                  Voir tout <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              
              <EventCarousel dateFilter={dateFilter} />
            </div>
          </section>

          {/* News Section */}
          <NewsFeed />

          {/* History Section */}
          <section className="max-w-7xl mx-auto px-4 py-24">
            <div className="bg-gray-900 rounded-[3.5rem] p-8 md:p-20 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-[100px]"></div>
              <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-600/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-[80px]"></div>
              
              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div className="space-y-8">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-blue-400 text-xs font-black tracking-widest border border-white/10">
                    <History className="w-4 h-4" />
                    <span>Archives</span>
                  </div>
                  <h2 className="text-4xl md:text-6xl font-black text-white leading-[0.9] tracking-tighter">
                    Revivez vos <br /> <span className="text-blue-500">Souvenirs</span>
                  </h2>
                  <p className="text-gray-400 text-lg md:text-xl font-medium leading-relaxed max-w-lg">
                    Accédez à l'historique complet de tous les événements passés. Retrouvez les moments qui ont marqué l'année.
                  </p>
                  <Link 
                    to="/past-events"
                    className="inline-flex items-center gap-4 px-10 py-5 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all hover:scale-105 shadow-xl shadow-blue-600/20 group"
                  >
                    Explorer l'historique 
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                  </Link>
                </div>
                
                <div className="relative">
                  <div className="flex flex-row md:flex-col gap-4 md:gap-6 overflow-x-auto md:overflow-visible no-scrollbar -mx-4 px-4 md:mx-0 md:px-0 scroll-smooth">
                    <img src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=80" className="w-[70vw] md:w-full h-48 md:h-64 object-cover rounded-[2rem] md:rounded-[2.5rem] md:rotate-2 shadow-2xl border-4 border-white/10 shrink-0" alt="" />
                    <img src="https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=600&q=80" className="w-[70vw] md:w-full h-48 md:h-64 object-cover rounded-[2rem] md:rounded-[2.5rem] md:-rotate-2 shadow-2xl border-4 border-white/10 shrink-0" alt="" />
                  </div>
                  {/* Mobile Scroll Indicator */}
                  <div className="md:hidden absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none animate-pulse">
                    <ChevronRight className="w-6 h-6 text-white/50" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Organizer CTA Section */}
          {user && (
            <section className="max-w-7xl mx-auto px-4 pb-24">
              <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[2.5rem] md:rounded-[3.5rem] p-8 md:p-20 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12">
                  <div className="max-w-2xl space-y-4 md:space-y-6 text-center md:text-left">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 mx-auto md:mx-0">
                      <MessageSquare className="w-6 h-6 md:w-8 md:h-8 text-white" />
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black tracking-tighter leading-none">
                      Vous êtes <br className="hidden md:block" /> <span className="text-indigo-200">Organisateur ?</span>
                    </h2>
                    <p className="text-indigo-100 text-base md:text-lg font-medium leading-relaxed">
                      Utilisez nos outils pour créer, gérer, et sécuriser vos événements. De la billetterie à la validation par QR code.
                    </p>
                  </div>
                  
                  <div className="shrink-0 w-full md:w-auto">
                    {user?.role === "Participant" ? (
                      <button
                        onClick={() => setIsUpgradeModalOpen(true)}
                        className="w-full md:w-auto px-10 md:px-12 py-4 md:py-5 bg-white text-indigo-600 font-black rounded-2xl hover:bg-indigo-50 transition-all hover:scale-105 shadow-2xl text-sm md:text-base"
                      >
                        Devenir Organisateur
                      </button>
                    ) : (
                      <button
                        onClick={() => navigate(user.role === "administrateur" ? "/admin" : "/dashboard")}
                        className="w-full md:w-auto px-10 md:px-12 py-4 md:py-5 bg-white text-indigo-600 font-black rounded-2xl hover:bg-indigo-50 transition-all hover:scale-105 shadow-2xl text-sm md:text-base"
                      >
                        Mon Dashboard
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* About Section */}
          <section className="max-w-4xl mx-auto text-center px-4 py-24 border-t border-gray-100 dark:border-gray-800">
            <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-gray-100 dark:border-gray-700">
              <Briefcase className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter mb-6">À Propos de Qr-Event</h2>
            <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
              Qr-Event est votre plateforme centralisée pour découvrir et gérer des événements au Cameroun. 
              Notre mission est de simplifier l'accès à l'événementiel grâce à une technologie de QR code rapide et sécurisée.
            </p>
          </section>
        </div>
      </MainLayout>

      {isUpgradeModalOpen && (
        <UpgradeToOrganizerModal onClose={() => setIsUpgradeModalOpen(false)} />
      )}
      
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounceHorizontal {
          0%, 100% { transform: translateX(0) translateY(-50%); }
          50% { transform: translateX(5px) translateY(-50%); }
        }
        .animate-fade-in-up { animation: fade-in-up 1s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
        .animate-bounce-horizontal { animation: bounceHorizontal 1.5s ease-in-out infinite; }
      `}</style>
    </>
  );
};

export default HomePage;
