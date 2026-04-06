// src/pages/organizer/ScanQrPage.jsx
import React, { useState } from "react";
import MainLayout from "../../components/layout/MainLayout";
import QrScanner from "../../features/events/components/QrScanner";
import { useMyOrganizedEvents, useEvents } from "../../hooks/useEvents"; // Importer useEvents pour l'admin
import { useUserProfile } from "../../hooks/useUserProfile"; // Pour obtenir le rôle
import { Loader2, ArrowLeft, Scan, Zap, AlertTriangle } from "lucide-react";
import Button from "../../components/ui/Button";

const ScanQrPage = () => {
  const [selectedEventName, setSelectedEventName] = useState("");
  const [showScanner, setShowScanner] = useState(false);

  // 1. Récupérer le profil de l'utilisateur pour connaître son rôle
  const {
    data: user,
    isLoading: isLoadingUser,
    isError: isUserError,
    error: userError,
  } = useUserProfile();
  const isAdmin = user?.role?.toLowerCase() === "administrateur"; 

  // 2. Charger les événements appropriés en fonction du rôle
  // Pour les organisateurs : seulement leurs événements
  const {
    data: organizedEvents = [],
    isLoading: isLoadingOrgEvents,
    isError: isOrgEventsError,
    error: orgEventsError,
  } = useMyOrganizedEvents({ enabled: !isAdmin && !!user }); // Ne charge que si c'est un Orga

  // Pour les admins : tous les événements (pour le sélecteur)
  const {
    data: allEvents = [],
    isLoading: isLoadingAllEvents,
    isError: isAllEventsError,
    error: allEventsError,
  } = useEvents({ enabled: isAdmin && !!user }); // Ne charge que si c'est un Admin

  // Combine les états de chargement et d'erreur
  const isLoading =
    isLoadingUser || (isAdmin ? isLoadingAllEvents : isLoadingOrgEvents);
  const isError =
    isUserError || (isAdmin ? isAllEventsError : isOrgEventsError);
  const error = userError || (isAdmin ? allEventsError : orgEventsError);

  // Détermine la liste d'événements à afficher dans le sélecteur
  const eventListForSelector = isAdmin ? allEvents : organizedEvents;

  const handleStartScan = () => {
    if (selectedEventName) {
      setShowScanner(true);
    } else {
      alert("Veuillez sélectionner l'événement pour lequel vous scannez.");
    }
  };

  const handleStopScan = () => {
    setShowScanner(false);
  };

  return (
    <MainLayout>
      <div className="bg-slate-50 min-h-screen font-sans selection:bg-orange-100 pb-20">
        
        {/* HEADER SECTION - Streamlined SaaS Style */}
        <section className="bg-white pt-20 pb-16 md:pt-32 md:pb-24 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-full h-full bg-slate-50/50 opacity-10"></div>
           
           <div className="max-w-7xl mx-auto px-6 relative z-10 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-50 rounded-full text-orange-600 font-black text-[9px] uppercase tracking-widest mb-6">
                 <Scan size={12} />
                 Module de Contrôle
              </div>
              <h1 className="text-4xl md:text-7xl font-black text-slate-500 tracking-tighter uppercase leading-none mb-6">
                 Validation <span className="text-orange-600">Flash</span>
              </h1>
              <p className="text-slate-400 font-bold text-sm md:text-lg max-w-xl">
                 Interface de check-in haute performance pour le contrôle d'accès sécurisé à vos événements.
              </p>
           </div>
        </section>

        <div className="max-w-xl mx-auto px-4 md:px-6 -mt-12 md:-mt-16 relative z-20">
           
           {isLoading ? (
             <div className="bg-white rounded-[2.5rem] p-16 shadow-2xl border border-slate-100 flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Initialisation du studio...</p>
             </div>
           ) : isError ? (
             <div className="bg-red-50 rounded-[2.5rem] p-12 shadow-2xl border border-red-100 text-center space-y-4">
                <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
                <h3 className="text-lg font-black text-red-600 uppercase">Erreur Système</h3>
                <p className="text-red-400 font-bold text-sm tracking-tight">{error.message}</p>
             </div>
           ) : !isAdmin && organizedEvents.length === 0 ? (
             <div className="bg-white rounded-[2.5rem] p-12 shadow-2xl border border-slate-100 text-center space-y-8">
                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto text-slate-200">
                   <Zap size={40} />
                </div>
                <div className="space-y-4">
                  <h2 className="text-xl font-black text-slate-500 uppercase tracking-tighter">Aucun Événement</h2>
                  <p className="text-slate-400 font-bold text-sm leading-relaxed">
                    Vous devez être l'organisateur d'au moins un événement pour accéder à l'interface de scan.
                  </p>
                </div>
                <Button variant="primary" onClick={() => navigate("/createevent")} className="w-full">
                   Créer un événement
                </Button>
             </div>
           ) : (
             <div className="space-y-6">
                {!showScanner ? (
                  /* --- Étape 1 : Sélection de l'événement --- */
                  <div className="bg-white rounded-[2.5rem] md:rounded-[3rem] p-10 md:p-14 shadow-[0_40px_80px_rgba(0,0,0,0.06)] border border-slate-50 space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Sélection de l'Expérience</label>
                       <div className="relative group">
                          <select
                            id="eventSelect"
                            value={selectedEventName}
                            onChange={(e) => setSelectedEventName(e.target.value)}
                            className="w-full px-8 py-6 bg-slate-50 rounded-2xl border-2 border-slate-50 focus:border-orange-500 outline-none transition-all font-black text-slate-500 appearance-none shadow-inner"
                          >
                            <option value="" disabled>-- Choisir un événement --</option>
                            {eventListForSelector.map((event) => (
                              <option key={event._id || event.id} value={event.name}>
                                {event.name}
                              </option>
                            ))}
                          </select>
                          <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300 group-focus-within:text-orange-500 transition-colors">
                             <Zap size={20} className="fill-current" />
                          </div>
                       </div>
                    </div>

                    <div className="space-y-6 pt-4 border-t border-slate-50">
                       <Button
                         variant="primary"
                         onClick={handleStartScan}
                         disabled={!selectedEventName}
                         className="w-full py-6 md:py-7 bg-slate-900 hover:bg-orange-600 shadow-2xl shadow-slate-900/10 hover:shadow-orange-600/30 font-black text-[11px] uppercase tracking-[0.25em]"
                       >
                         {selectedEventName ? "Activer le Scanner" : "Sélection requise"}
                       </Button>
                       <p className="text-center text-[9px] font-black text-slate-300 uppercase tracking-widest">
                          Autorisation caméra requise pour continuer
                       </p>
                    </div>
                  </div>
                ) : (
                  /* --- Étape 2 : Affichage du Scanner --- */
                  <div className="animate-in fade-in zoom-in-95 duration-500 space-y-6">
                    <div className="bg-orange-50/50 backdrop-blur-md border border-orange-100 rounded-3xl p-6 flex items-center justify-between shadow-sm">
                       <div className="space-y-1">
                          <p className="text-[8px] font-black text-orange-400 uppercase tracking-widest">Point de contrôle</p>
                          <h3 className="text-sm font-black text-slate-500 uppercase truncate max-w-[200px]">{selectedEventName}</h3>
                       </div>
                       <div className="w-10 h-10 bg-orange-600 text-white rounded-xl flex items-center justify-center shadow-lg animate-pulse">
                          <Scan size={20} />
                       </div>
                    </div>

                    <div className="bg-white rounded-[3rem] p-4 shadow-3xl border border-slate-100 relative group overflow-hidden">
                       <QrScanner eventName={selectedEventName} />
                    </div>

                    <button
                      onClick={handleStopScan}
                      className="w-full flex items-center justify-center gap-3 px-6 py-5 bg-slate-100 text-slate-400 hover:text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all hover:bg-slate-200"
                    >
                      <ArrowLeft size={16} /> Changer d'événement
                    </button>
                  </div>
                )}
             </div>
           )}
        </div>
      </div>
    </MainLayout>
  );
};

export default ScanQrPage;
