import React, { useMemo } from "react";
import { useEvents } from "../../hooks/useEvents";
import { Calendar, History, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import EventCard from "../../features/events/components/EventCard";

const PastEventsPage = () => {
  const navigate = useNavigate();
  const { data: events, isLoading } = useEvents();

  const groupedPastEvents = useMemo(() => {
    if (!events) return {};
    console.log("PastEventsPage: Total events received:", events.length);

    const now = new Date();
    
    const pastEvents = events.filter(event => {
      const dateStr = event.startDate || event.date;
      if (!dateStr) return false;
      const eventDate = new Date(dateStr);
      if (event.time) {
        const [hours, minutes] = event.time.split(':');
        if (hours && minutes) {
          eventDate.setHours(parseInt(hours), parseInt(minutes));
        }
      }
      return eventDate < now;
    });

    pastEvents.sort((a, b) => new Date(b.startDate || b.date) - new Date(a.startDate || a.date));

    return pastEvents.reduce((groups, event) => {
      const date = new Date(event.startDate || event.date);
      const monthYear = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
      const key = monthYear.charAt(0).toUpperCase() + monthYear.slice(1);
      
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(event);
      return groups;
    }, {});
  }, [events]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500 font-bold tracking-widest text-xs">Chargement de l'historique...</p>
        </div>
      </div>
    );
  }

  const hasPastEvents = Object.keys(groupedPastEvents).length > 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      {/* Mobile Sticky Header */}
      <div className="md:hidden sticky top-16 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 px-4 py-3 flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-600 dark:text-gray-400"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white">Historique</h2>
        <div className="w-9"></div> {/* Spacer for balance */}
      </div>

      {/* Header Section */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 pt-8 md:pt-28 pb-10">
        <div className="max-w-7xl mx-auto px-4">
          <button 
            onClick={() => navigate(-1)}
            className="hidden md:flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors mb-8 font-black text-xs tracking-widest uppercase"
          >
            <ArrowLeft className="w-4 h-4" /> Retour
          </button>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-blue-600 font-black text-[10px] md:text-xs uppercase tracking-[0.2em]">
                <History className="w-4 h-4" />
                <span>Archives QR-EVENT</span>
              </div>
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tighter uppercase leading-tight bg-gradient-to-r from-gray-900 via-gray-700 to-gray-500 dark:from-white dark:via-gray-200 dark:to-gray-400 bg-clip-text text-transparent">
                L'historique des événements
              </h1>
            </div>
            <div className="flex items-center">
              <div className="px-5 py-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 border border-blue-100 dark:border-blue-800/50">
                <Calendar className="w-4 h-4" />
                {Object.values(groupedPastEvents).flat().length} Souvenirs
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-16">
        {!hasPastEvents ? (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-[3rem] border border-dashed border-gray-200 dark:border-gray-700">
            <div className="w-20 h-20 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6">
              <History className="w-10 h-10 text-gray-300" />
            </div>
            <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Aucun historique</h2>
            <p className="text-gray-500 mt-2 font-medium">Les événements terminés apparaîtront ici automatiquement.</p>
          </div>
        ) : (
          <div className="space-y-20 md:space-y-32">
            {Object.entries(groupedPastEvents).map(([month, monthEvents]) => (
              <section key={month} className="animate-fade-in-up">
                <div className="flex items-center gap-4 mb-8 md:mb-12">
                  <div className="w-1.5 h-8 bg-blue-600 rounded-full"></div>
                  <h2 className="text-xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tighter uppercase">
                    {month}
                  </h2>
                  <div className="h-px flex-1 bg-gradient-to-r from-gray-200 dark:from-gray-700 to-transparent"></div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
                  {monthEvents.map((event) => (
                    <EventCard 
                      key={event._id || event.id}
                      event={event}
                      handleDetails={() => navigate(`/events/${event._id || event.id}`)}
                      isArchived={true}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>

      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fade-in-up 1s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
      `}</style>
    </div>
  );
};

export default PastEventsPage;
