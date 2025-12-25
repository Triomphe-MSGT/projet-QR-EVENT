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
    <div className="space-y-10">
      {currentEvents?.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 animate-fade-in-up">
            {currentEvents.map((event) => (
              <EventCard
                key={event._id || event.id}
                event={event}
                handleDetails={() => handleDetails(event._id || event.id)}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 pt-10">
              <button
                onClick={() => {
                  setCurrentPage((p) => Math.max(p - 1, 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                disabled={currentPage === 1}
                className="p-3 rounded-2xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-100 dark:border-gray-700 hover:bg-blue-600 hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-white dark:disabled:hover:bg-gray-800 shadow-sm"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              
              <div className="flex items-center gap-2">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setCurrentPage(i + 1);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`w-10 h-10 rounded-xl font-black text-sm transition-all ${
                      currentPage === i + 1
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                        : "bg-white dark:bg-gray-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-100 dark:border-gray-700"
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
                className="p-3 rounded-2xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-100 dark:border-gray-700 hover:bg-blue-600 hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-white dark:disabled:hover:bg-gray-800 shadow-sm"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 px-6 bg-white dark:bg-gray-800 rounded-[3rem] border border-dashed border-gray-200 dark:border-gray-700">
          <div className="w-20 h-20 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mb-6">
            <CalendarOff className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Aucun événement</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-center max-w-xs font-medium">
            Nous n'avons trouvé aucun événement correspondant à vos critères de recherche.
          </p>
        </div>
      )}
      
      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fade-in-up 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
      `}</style>
    </div>
  );
};

export default EventList;
