import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import QrCodeDisplay from "../../features/events/components/QrCodeDisplay";
import { useUserEvents } from "../../hooks/useUserProfile";
import { useUnregisterFromEvent } from "../../hooks/useEvents";
import { Trash2, ArrowLeft, History, QrCode, Calendar, MapPin, ExternalLink, X, Zap } from "lucide-react";

const UserQrCodesPage = () => {
  const navigate = useNavigate();
  const { data: eventsData, isLoading, isError, error } = useUserEvents();
  const unregisterMutation = useUnregisterFromEvent();
  const [selectedQr, setSelectedQr] = useState(null);

  const eventsWithQrCodes = eventsData?.participated?.filter((event) => event.qrCodeImage) || [];

  const formatDate = (dateString) => {
    if (!dateString) return "Date inconnue";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <Zap className="w-10 h-10 text-orange-500 animate-pulse" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Édition de vos accès sécurisés...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="bg-slate-50 min-h-screen font-sans selection:bg-orange-100 selection:text-orange-900 pb-20">
        
        {/* HEADER SECTION */}
        <section className="bg-white border-b border-slate-100 pt-16 md:pt-24 pb-12 md:pb-16 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-96 h-96 bg-orange-50 rounded-full blur-[120px] -mr-48 -mt-24 opacity-50"></div>
           <div className="absolute bottom-0 left-0 w-64 h-64 bg-slate-100 rounded-full blur-[100px] -ml-32 -mb-16 opacity-50"></div>
           
           <div className="max-w-7xl mx-auto px-6 relative z-10">
              <button 
                onClick={() => navigate(-1)}
                className="group flex items-center gap-2 text-slate-400 hover:text-orange-600 transition-all mb-10 font-bold text-[10px] tracking-widest uppercase"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Retour
              </button>

              <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                 <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-600 rounded-full font-black text-[9px] uppercase tracking-widest">
                       <QrCode className="w-3 h-3" />
                       Billetterie Digitale
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-none text-slate-900 max-w-2xl">
                       Mes Accès <span className="text-orange-600">Sécurisés</span>
                    </h1>
                    <p className="text-slate-400 font-bold text-xs md:text-sm max-w-md">Retrouvez tous vos billets d'entrée et présentez votre QR Code à l'accueil.</p>
                 </div>
                 <div className="shrink-0 flex items-center gap-4">
                    <div className="px-6 py-4 bg-white border border-slate-100 rounded-3xl shadow-sm flex flex-col items-center">
                       <span className="text-2xl font-black text-slate-900">{eventsWithQrCodes.length}</span>
                       <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Pass Actifs</span>
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* TICKETS GRID */}
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
          {eventsWithQrCodes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10 md:gap-12">
              {eventsWithQrCodes.map((event) => (
                <div key={event._id || event.id} className="group relative">
                  {/* TICKET MOCKUP */}
                  <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden transition-all duration-500 hover:shadow-[0_40px_80px_rgba(249,115,22,0.1)] hover:-translate-y-2 border border-slate-50 flex flex-col">
                    
                    {/* Event Banner Placeholder / Color */}
                    <div className="h-24 bg-slate-900 flex items-center justify-between px-8 relative overflow-hidden group-hover:bg-orange-600 transition-colors">
                       <Zap size={40} className="text-white/10 absolute -right-4 -bottom-4 rotate-12 group-hover:text-white/20 transition-all" />
                       <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] relative z-10">Billet Officiel</span>
                       <QrCode size={20} className="text-white relative z-10" />
                    </div>

                    <div className="p-8 space-y-6 relative flex-1 flex flex-col justify-between">
                       <div className="space-y-2 border-b border-slate-50 pb-6">
                          <h2 className="text-xl font-black text-slate-900 group-hover:text-orange-600 transition-colors uppercase leading-tight line-clamp-2">
                            {event.name}
                          </h2>
                          <div className="flex flex-col gap-1.5 pt-2">
                             <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                                <Calendar size={12} className="text-orange-500" /> {formatDate(event.startDate)}
                             </div>
                             <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                                <MapPin size={12} className="text-orange-500" /> {event.location || "Lieu à confirmer"}
                             </div>
                          </div>
                       </div>

                       {/* QR MINIATURE (Simulated scan area) */}
                       <div className="flex justify-center -my-2 transform group-hover:scale-105 transition-transform">
                          <div className="p-4 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-center relative group-hover:bg-white group-hover:border-orange-100 transition-all">
                             <QrCodeDisplay value={event.qrCodeImage} size={110} />
                             <div className="absolute inset-0 bg-orange-600/0 group-hover:bg-orange-600/5 transition-all rounded-3xl"></div>
                          </div>
                       </div>

                       {/* TICKET ACTIONS */}
                       <div className="flex gap-3 pt-6">
                          <button
                            onClick={() => setSelectedQr(event)}
                            className="flex-1 px-6 py-4 bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl shadow-slate-900/10 hover:bg-orange-600 hover:shadow-orange-600/30 transition-all flex items-center justify-center gap-2"
                          >
                             Scanner <ExternalLink size={14} />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm("Annuler votre participation ? Votre pass sera désactivé.")) {
                                unregisterMutation.mutate(event._id || event.id);
                              }
                            }}
                            className="p-4 bg-slate-50 text-slate-300 hover:bg-red-50 hover:text-red-500 transition-all rounded-2xl shadow-inner"
                            title="Révoquer le billet"
                          >
                            <Trash2 size={18} />
                          </button>
                       </div>
                    </div>

                    {/* TICKET CUT DECO (Side holes) */}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 bg-slate-50 rounded-full border border-slate-100 pointer-events-none shadow-inner"></div>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-8 h-8 bg-slate-50 rounded-full border border-slate-100 pointer-events-none shadow-inner"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-24 md:py-32 bg-white rounded-[4rem] border border-slate-100 shadow-xl shadow-slate-200/20 max-w-4xl mx-auto space-y-8 animate-in zoom-in-95 duration-500">
               <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-inner text-slate-200">
                 <QrCode size={40} />
               </div>
               <div className="space-y-4 px-6">
                 <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter uppercase">Aucun Ticket Actif</h2>
                 <p className="text-slate-400 font-bold text-sm max-w-sm mx-auto leading-relaxed">
                   Vous n'avez pas encore réservé de place pour un événement. Parcourez notre catalogue pour obtenir votre sésame !
                 </p>
               </div>
               <button onClick={() => navigate("/events")} className="px-10 py-5 bg-orange-600 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl shadow-orange-600/30 hover:scale-105 transition-transform active:scale-95">
                 Découvrir les événements
               </button>
            </div>
          )}
        </div>
      </div>

      {/* --- PREMIUM QR MODAL --- */}
      {selectedQr && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-xl" onClick={() => setSelectedQr(null)}></div>
          
          <div className="relative bg-white rounded-[3rem] p-10 md:p-16 max-w-lg w-full flex flex-col items-center gap-10 shadow-3xl animate-in zoom-in-95 duration-300">
             <button onClick={() => setSelectedQr(null)} className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all">
                <X size={20} />
             </button>

             <div className="text-center space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-600 rounded-full font-black text-[9px] uppercase tracking-widest">
                   Accès Validé
                </div>
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter line-clamp-1">{selectedQr.name}</h3>
                <p className="text-slate-400 font-bold text-xs">Présentez ce QR Code pour valider votre entrée.</p>
             </div>

             <div className="p-8 bg-white border-2 border-slate-50 rounded-[3rem] relative shadow-2xl shadow-slate-200">
                <QrCodeDisplay value={selectedQr.qrCodeImage} size={280} />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 p-2 bg-white -mt-4 rounded-xl border border-slate-50">
                   <Zap size={16} className="text-orange-500 fill-current" />
                </div>
             </div>

             <div className="w-full flex flex-col gap-4 text-center">
                <div className="flex justify-around border-t border-slate-100 pt-8 mt-2">
                   <div className="flex flex-col items-center">
                      <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1">Date</span>
                      <span className="text-xs font-black text-slate-900">{formatDate(selectedQr.startDate)}</span>
                   </div>
                   <div className="w-px h-8 bg-slate-100"></div>
                   <div className="flex flex-col items-center">
                      <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1">Lieu</span>
                      <span className="text-xs font-black text-slate-900 truncate max-w-[120px]">{selectedQr.location || "Standard"}</span>
                   </div>
                </div>
             </div>
          </div>
        </div>
      )}

      <style>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </MainLayout>
  );
};

export default UserQrCodesPage;
