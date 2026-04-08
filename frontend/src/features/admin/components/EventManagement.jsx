import React from "react";
import { useEvents, useDeleteEvent } from "../../../hooks/useEvents";
import { Link, useNavigate } from "react-router-dom";
import { PlusCircle, Edit, Trash2, Loader2, Calendar, MapPin, User, ChevronRight } from "lucide-react";

const EventManagement = () => {
  const { data: events = [], isLoading, isError, error } = useEvents();
  const deleteEventMutation = useDeleteEvent();
  const navigate = useNavigate();

  const handleDelete = (eventId, eventName) => {
    if (window.confirm(`Supprimer l'événement "${eventName}" ?`)) {
      deleteEventMutation.mutate(eventId);
    }
  };

  const handleEdit = (eventId) => navigate(`/createevent?edit=${eventId}`);

  const formatDate = (dateString) =>
    dateString ? new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric"
    }) : "-";

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
      <Loader2 className="w-10 h-10 animate-spin mb-4 text-orange-500" />
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Inventaire en cours...</p>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h2 className="text-2xl font-black text-slate-500 uppercase tracking-tighter">Flux Événementiel</h2>
           <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none mt-1">
              Surveillance de {events.length} sessions
           </p>
        </div>
        <Link to="/createevent" className="w-full md:w-auto">
          <button className="w-full px-6 py-4 bg-orange-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-orange-700 transition-all shadow-xl shadow-orange-600/20 flex items-center justify-center gap-2">
            <PlusCircle size={16} /> Lancer un Événement
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {events.map((event) => (
          <div key={event._id || event.id} className="group bg-white rounded-3xl p-5 md:p-6 border border-slate-100 hover:border-orange-100 transition-all flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-xl hover:shadow-slate-900/5">
             
             <div className="flex items-center gap-6 w-full md:w-auto">
                <div className="w-14 h-14 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center font-black group-hover:bg-slate-900 group-hover:text-white transition-all shrink-0 border border-slate-100">
                   {event.name?.substring(0, 2).toUpperCase()}
                </div>
                <div className="space-y-1 min-w-0 flex-1">
                   <h3 className="text-lg font-black text-slate-500 uppercase tracking-tight group-hover:text-orange-600 truncate transition-colors">
                      {event.name}
                   </h3>
                   <div className="flex flex-wrap items-center gap-4 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                      <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-0.5 rounded-md">
                         <Calendar size={12} className="text-orange-500" />
                         {formatDate(event.startDate)}
                      </div>
                      <div className="flex items-center gap-1.5">
                         <MapPin size={12} className="text-slate-300" />
                         {event.city}
                      </div>
                   </div>
                </div>
             </div>

             <div className="flex items-center justify-between w-full md:w-auto md:justify-end gap-8 pt-4 md:pt-0 border-t md:border-t-0 border-slate-50">
                <div className="flex items-center gap-3">
                   <div className="text-right">
                      <p className="text-[9px] font-black text-slate-200 uppercase tracking-widest">Responsable</p>
                      <p className="text-xs font-black text-slate-500">{event.organizer?.nom || "N/A"}</p>
                   </div>
                   <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-black text-slate-400">
                      {event.organizer?.nom?.charAt(0)}
                   </div>
                </div>
                
                <div className="flex items-center gap-2">
                   <button 
                     onClick={() => handleEdit(event._id || event.id)}
                     className="p-3 bg-slate-50 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all"
                   >
                      <Edit size={14} />
                   </button>
                   <button 
                     onClick={() => handleDelete(event._id || event.id, event.name)}
                     className="p-3 bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                     disabled={deleteEventMutation.isPending}
                   >
                      <Trash2 size={14} />
                   </button>
                   <Link to={`/events/${event._id || event.id}`} className="p-3 bg-slate-900 text-white rounded-xl hover:bg-orange-600 transition-all ml-2">
                      <ChevronRight size={14} />
                   </Link>
                </div>
             </div>

          </div>
        ))}
      </div>
    </div>
  );
};

export default EventManagement;
