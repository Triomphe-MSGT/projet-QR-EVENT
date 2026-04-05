import React from "react";
import { useNavigate } from "react-router-dom";
import EventCard from "./EventCard";
import { ChevronLeft, ChevronRight, CalendarOff } from "lucide-react";

const EventList = ({
  currentEvents,
  currentPage,
  totalPages,
  setCurrentPage,
}) => {
  const navigate = useNavigate();
  const handleDetails = (id) => navigate(`/events/${id}`);

  return (
    <div className="space-y-16 mt-8">
      {currentEvents?.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 animate-fade-in-up">
            {currentEvents.map((event) => (
              <EventCard
                key={event._id || event.id}
                event={event}
                handleDetails={() => handleDetails(event._id || event.id)}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-6 pt-12 border-t border-slate-100">
              <button
                onClick={() => {
                  setCurrentPage((p) => Math.max(p - 1, 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                disabled={currentPage === 1}
                className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-500 hover:text-orange-600 border border-slate-200 rounded-xl transition-all disabled:opacity-20"
              >
                <ChevronLeft className="w-5 h-5" />
                Précédent
              </button>
              
              <div className="hidden md:flex items-center gap-1">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setCurrentPage(i + 1);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${
                      currentPage === i + 1
                        ? "bg-slate-900 text-white"
                        : "text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  setCurrentPage((p) => Math.min(p + 1, totalPages));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                disabled={currentPage === totalPages}
                className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-500 hover:text-orange-600 border border-slate-200 rounded-xl transition-all disabled:opacity-20"
              >
                Suivant
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 px-6 bg-white rounded-3xl border border-slate-100 italic">
          <CalendarOff className="w-12 h-12 text-slate-200 mb-4" />
          <p className="text-slate-400 font-medium">Aucun événement ne correspond à vos filtres.</p>
        </div>
      )}
      
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fadeInUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
      `}</style>
    </div>
  );
};

export default EventList;
