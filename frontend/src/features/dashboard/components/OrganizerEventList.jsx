import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDeleteEvent } from "../../../hooks/useEvents";
import { useSelector } from "react-redux";
import {
  Edit,
  Trash2,
  PlusCircle,
  Users,
  Loader2,
  Download,
  AlertCircle,
  Eye,
  Lock,
  ChevronRight,
  TrendingUp,
  MapPin,
  CalendarDays,
  FileText
} from "lucide-react";

import Button from "../../../components/ui/Button";
import ParticipantManagementModal from "./ParticipantManagementModal";
import { downloadEventReport } from "../../../services/dashboardService";

const OrganizerEventList = ({ events }) => {
  const navigate = useNavigate();
  const deleteMutation = useDeleteEvent();
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.role === "Administrateur";

  const [managingEvent, setManagingEvent] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [isChoiceModalOpen, setIsChoiceModalOpen] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return "?";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const isDeletionAllowed = (event) => {
    if (isAdmin) return true;
    const creationDate = event.createdAt
      ? new Date(event.createdAt)
      : new Date(parseInt((event._id || event.id).substring(0, 8), 16) * 1000);
    const now = new Date();
    const diffInHours = (now - creationDate) / (1000 * 60 * 60);
    return diffInHours <= 24;
  };

  const handleDelete = (event) => {
    const eventId = event._id || event.id;
    if (!isDeletionAllowed(event)) {
      alert("Délai de suppression de 24h dépassé.");
      return;
    }
    if (window.confirm(`Supprimer l'événement "${event.name}" ?`)) {
      deleteMutation.mutate(eventId);
    }
  };

  const handleEdit = (eventId) => navigate(`/createevent?edit=${eventId}`);

  const handleManageParticipants = (event) => {
    if (!event.participants) {
      alert("Données participants manquantes.");
      return;
    }
    setManagingEvent(event);
  };

  const handleDownload = async (e, eventId, eventName) => {
    e.stopPropagation();
    const format = window.prompt("Format (pdf ou csv) :", "pdf");
    if (!format || (format !== "pdf" && format !== "csv")) return;
    setDownloadingId(eventId);
    try {
      await downloadEventReport(eventId, eventName, format);
    } catch (error) {
      alert("Échec du téléchargement.");
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <>
      {managingEvent && (
        <ParticipantManagementModal
          event={managingEvent}
          onClose={() => setManagingEvent(null)}
        />
      )}

      {isChoiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-[3.5rem] p-12 max-w-2xl w-full shadow-2xl border border-white/20 animate-scale-up">
            <div className="text-center space-y-6 mb-12">
               <div className="w-20 h-20 bg-orange-50 rounded-[2rem] flex items-center justify-center mx-auto text-orange-600 shadow-inner">
                  <TrendingUp size={40} />
               </div>
               <h3 className="text-3xl font-black text-gray-900 tracking-tighter">
                 Nouveau <span className="text-orange-600">Projet</span>
               </h3>
               <p className="text-slate-400 font-bold max-w-sm mx-auto">Choisissez la visibilité broadcast pour votre prochain événement.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button
                onClick={() => navigate("/createevent?visibility=public")}
                className="group p-8 bg-slate-50 rounded-[3rem] border-2 border-transparent hover:border-orange-500 hover:bg-white hover:shadow-2xl transition-all text-left"
              >
                <div className="w-14 h-14 bg-black text-white rounded-2xl flex items-center justify-center mb-6 group-hover:bg-orange-600 transition-colors">
                  <span className="font-black text-xl">01</span>
                </div>
                <h4 className="text-xl font-black text-gray-900 mb-2">Public</h4>
                <p className="text-xs text-slate-400 font-bold leading-relaxed">Visible par toute la communauté sur le hub principal.</p>
              </button>

              <button
                onClick={() => navigate("/createevent?visibility=private")}
                className="group p-8 bg-slate-50 rounded-[3rem] border-2 border-transparent hover:border-orange-500 hover:bg-white hover:shadow-2xl transition-all text-left"
              >
                <div className="w-14 h-14 bg-black text-white rounded-2xl flex items-center justify-center mb-6 group-hover:bg-orange-600 transition-colors">
                  <span className="font-black text-xl">02</span>
                </div>
                <h4 className="text-xl font-black text-gray-900 mb-2">Privé</h4>
                <p className="text-xs text-slate-400 font-bold leading-relaxed">Uniquement accessible via un lien de diffusion direct.</p>
              </button>
            </div>

            <button
              onClick={() => setIsChoiceModalOpen(false)}
              className="mt-10 w-full py-4 text-[10px] font-black text-slate-300 hover:text-gray-900 uppercase tracking-widest transition-colors"
            >
              Fermer la fenêtre
            </button>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-2 gap-4">
          <div>
             <h2 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Gestion Locative</h2>
             <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Contrôle complet de vos interfaces</p>
          </div>
          <button
            onClick={() => setIsChoiceModalOpen(true)}
            className="w-full sm:w-auto px-10 py-5 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:scale-105 active:scale-100 transition-all flex items-center justify-center gap-3"
          >
            <PlusCircle size={18} className="text-orange-500" /> Nouvel Event
          </button>
        </div>

        {!events || events.length === 0 ? (
          <div className="text-center py-24 px-6 border-4 border-dashed border-slate-50 rounded-[3rem] bg-slate-50/30">
            <h3 className="text-2xl font-black text-slate-400 opacity-50 uppercase tracking-tighter">Désert Événementiel</h3>
            <p className="text-slate-400 font-bold mt-2">Votre liste est actuellement vide.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {events.map((event) => {
              const allowed = isDeletionAllowed(event);
              const partCount = event.participants?.length || 0;
              return (
                <div
                  key={event._id || event.id}
                  className="group p-6 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-orange-200 transition-all flex flex-col md:flex-row justify-between md:items-center gap-8 relative overflow-hidden"
                >
                  {/* Status Bar */}
                  <div className={`absolute top-0 left-0 w-2 h-full ${event.visibility === 'public' ? 'bg-orange-500' : 'bg-black'}`}></div>
                  
                  <Link to={`/events/${event._id || event.id}`} className="flex-grow flex items-start gap-6">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-orange-50 group-hover:text-orange-600 transition-all shadow-inner shrink-0 leading-none">
                       <span className="font-black text-xl">{event.name.substring(0, 1).toUpperCase()}</span>
                    </div>
                    <div className="min-w-0 space-y-2">
                      <div className="flex items-center gap-3">
                         <span className={`text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-widest border ${event.visibility === 'public' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-slate-900 text-white border-slate-800'}`}>
                           {event.visibility === 'public' ? <Eye size={10} className="inline mr-1" /> : <Lock size={10} className="inline mr-1" />}
                           {event.visibility}
                         </span>
                         <div className="flex items-center gap-1.5 text-[8px] font-black text-slate-400 uppercase tracking-widest">
                            <MapPin size={12} className="text-orange-500" />
                            <span className="truncate">{event.city || "Multi-site"}</span>
                         </div>
                      </div>
                      <h3 className="text-xl font-black text-gray-900 truncate tracking-tight">{event.name}</h3>
                      <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400">
                         <div className="flex items-center gap-1.5"><CalendarDays size={14} className="text-orange-500/50" /> {formatDate(event.startDate)}</div>
                         <div className="w-1 h-1 bg-slate-200 rounded-full"></div>
                         <div className="flex items-center gap-1.5"><Users size={14} className="text-orange-500/50" /> <span className="text-orange-600 font-black">{partCount}</span> Inscrits</div>
                      </div>
                    </div>
                  </Link>

                  <div className="flex items-center gap-3 self-end md:self-center">
                    <button
                      onClick={() => handleManageParticipants(event)}
                      className="px-6 py-3.5 bg-orange-50 text-orange-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-orange-600 hover:text-white transition-all shadow-sm flex items-center gap-2"
                    >
                      <Users size={14} /> Gérer
                    </button>

                    <button
                      onClick={(e) => handleDownload(e, event._id || event.id, event.name)}
                      disabled={downloadingId === (event._id || event.id)}
                      className="px-6 py-3.5 bg-black text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 disabled:opacity-50 transition-all shadow-sm flex items-center gap-2"
                    >
                      {downloadingId === (event._id || event.id) ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <FileText size={14} className="text-orange-500" />
                      )}
                      Rapport
                    </button>

                    <div className="h-10 w-[2px] bg-slate-100 hidden md:block mx-1"></div>

                    <button
                      onClick={() => handleEdit(event._id || event.id)}
                      className="p-3.5 text-slate-400 hover:text-gray-900 hover:bg-slate-100 rounded-xl transition-all"
                    >
                      <Edit size={18} />
                    </button>

                    <button
                      onClick={() => handleDelete(event)}
                      disabled={!allowed || (deleteMutation.isPending && deleteMutation.variables === (event._id || event.id))}
                      className={`p-3.5 rounded-xl transition-all ${allowed ? "text-slate-400 hover:text-red-500 hover:bg-red-50" : "opacity-30 cursor-not-allowed"}`}
                    >
                      {deleteMutation.isPending && deleteMutation.variables === (event._id || event.id) ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Trash2 size={18} />
                      )}
                    </button>
                    
                    <ChevronRight size={20} className="text-slate-200 group-hover:translate-x-1 group-hover:text-orange-500 transition-all ml-2" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleUp { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
        .animate-scale-up { animation: scaleUp 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
      `}</style>
    </>
  );
};

export default OrganizerEventList;
