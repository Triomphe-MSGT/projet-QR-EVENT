import React from "react";
import MainLayout from "../../components/layout/MainLayout";
import { 
  Bell, 
  Search, 
  Plus, 
  QrCode, 
  LayoutDashboard, 
  User, 
  Ticket, 
  Home, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  HelpCircle
} from "lucide-react";
import { Link } from "react-router-dom";

const UsageGuidePage = () => {
  const actions = [
    { 
      icon: Home, 
      id: "home", 
      title: "Accueil", 
      desc: "Revenez à la page d'accueil pour voir les événements les plus imminents.",
      role: "Tous" 
    },
    { 
      icon: Search, 
      id: "search", 
      title: "Rechercher", 
      desc: "Utilisez la barre loupe en haut pour trouver un événement par son nom ou sa ville.",
      role: "Tous" 
    },
    { 
      icon: Bell, 
      id: "notif", 
      title: "Notifications", 
      desc: "La cloche vous informe de vos réservations réussies ou des messages de l'organisateur.",
      role: "Tous" 
    },
    { 
      icon: Ticket, 
      id: "tickets", 
      title: "Mes Billets", 
      desc: "C'est ici que sont stockés vos précieux Pass QR pour accéder aux événements.",
      role: "Participant" 
    },
    { 
      icon: Plus, 
      id: "create", 
      title: "Créer un Événement", 
      desc: "Cliquez sur le bouton (+) pour ouvrir le formulaire de création d'événement.",
      role: "Organisateur" 
    },
    { 
      icon: LayoutDashboard, 
      id: "dashbord", 
      title: "Dashboard / Stats", 
      desc: "Accédez à votre espace pro pour voir vos ventes et gérer vos listes d'attente.",
      role: "Organisateur" 
    },
    { 
      icon: QrCode, 
      id: "scan", 
      title: "Espace de Scan", 
      desc: "Le bouton (+) vous permet aussi d'ouvrir le scanner pour valider les entrées.",
      role: "Organisateur" 
    },
    { 
      icon: User, 
      id: "profile", 
      title: "Espace Profil", 
      desc: "Cliquez sur votre photo/lettre pour modifier vos infos, accéder au guide ou vous déconnecter.",
      role: "Tous" 
    }
  ];

  return (
    <MainLayout>
      <div className="bg-white min-h-screen pb-20">
        
        {/* HEADER MODERNE SLIM */}
        <section className="bg-slate-50 pt-16 pb-12 md:pt-24 md:pb-20 border-b border-slate-100">
           <div className="max-w-4xl mx-auto px-6 text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-600 rounded-full font-black text-[9px] uppercase tracking-widest">
                 <HelpCircle size={12} /> Aide & Guide
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase">
                 Navigation <span className="text-orange-600">&</span> Actions
              </h1>
              <p className="text-slate-400 font-bold text-xs md:text-sm max-w-lg mx-auto">
                 Toutes les réponses à la question "Où cliquer ?" suivant votre profil.
              </p>
           </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 md:px-6 py-12 md:py-20 space-y-20">
           
           {/* GUIDE DES BOUTONS */}
           <section className="space-y-12">
              <div className="flex items-center gap-4">
                 <div className="h-8 w-1.5 bg-orange-600 rounded-full"></div>
                 <h2 className="text-xl md:text-2xl font-black text-slate-800 uppercase tracking-tight">Répertoire des Actions</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                 {actions.map((act, i) => (
                    <div key={act.id} className="group bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-orange-100 transition-all duration-300 relative overflow-hidden">
                       <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                          <act.icon size={60} className="text-orange-600" />
                       </div>
                       
                       <div className="relative z-10 space-y-4">
                          <div className={`w-12 h-12 flex items-center justify-center rounded-2xl ${act.role === 'Organisateur' ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20' : act.role === 'Participant' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-slate-900 text-white'}`}>
                             <act.icon size={20} />
                          </div>
                          
                          <div className="space-y-1">
                             <span className={`text-[8px] font-black uppercase tracking-widest ${act.role === 'Organisateur' ? 'text-orange-500' : act.role === 'Participant' ? 'text-blue-500' : 'text-slate-400'}`}>
                                {act.role}
                             </span>
                             <h4 className="text-sm font-black text-slate-800 uppercase leading-none">{act.title}</h4>
                          </div>
                          
                          <p className="text-[10px] text-slate-400 font-bold leading-relaxed">{act.desc}</p>
                       </div>
                    </div>
                 ))}
              </div>
           </section>

           {/* QUESTIONS FREQUENTES VISUELLES */}
           <section className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              
              {/* POUR LES PARTICIPANTS */}
              <div className="bg-blue-50/50 rounded-[3rem] p-10 space-y-8 border border-blue-100">
                 <h3 className="text-lg font-black text-blue-700 uppercase tracking-tighter flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center"><CheckCircle2 size={18} /></div>
                    Je suis Participant
                 </h3>
                 <div className="space-y-4">
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-blue-50 space-y-2">
                       <h5 className="text-[11px] font-black text-slate-700 uppercase">Où sont mes billets ?</h5>
                       <p className="text-[10px] text-slate-400 font-bold leading-relaxed">Cliquez sur l'icône <Ticket size={14} className="inline mx-1 text-blue-600"/> (en bas sur mobile ou menu profil PC) pour accéder à vos QR Codes.</p>
                    </div>
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-blue-50 space-y-2">
                       <h5 className="text-[11px] font-black text-slate-700 uppercase">Comment réserver ?</h5>
                       <p className="text-[10px] text-slate-400 font-bold leading-relaxed">Allez sur l'événement de votre choix et cliquez sur le bouton <span className="px-2 py-0.5 bg-blue-600 text-white rounded font-black text-[8px] uppercase">Réserver</span> en bas de la page.</p>
                    </div>
                 </div>
              </div>

              {/* POUR LES ORGANISATEURS */}
              <div className="bg-orange-50/50 rounded-[3rem] p-10 space-y-8 border border-orange-100">
                 <h3 className="text-lg font-black text-orange-700 uppercase tracking-tighter flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-orange-600 text-white flex items-center justify-center"><ShieldCheck size={18} /></div>
                    Je suis Organisateur
                 </h3>
                 <div className="space-y-4">
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-orange-50 space-y-2">
                       <h5 className="text-[11px] font-black text-slate-700 uppercase">Où accéder à mon Dashboard ?</h5>
                       <p className="text-[10px] text-slate-400 font-bold leading-relaxed">Cliquez sur <Plus size={14} className="inline mx-1 text-orange-600"/> puis sélectionnez <LayoutDashboard size={14} className="inline mx-1 text-slate-500"/> Dashboard.</p>
                    </div>
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-orange-50 space-y-2">
                       <h5 className="text-[11px] font-black text-slate-700 uppercase">Comment créer un événement ?</h5>
                       <p className="text-[10px] text-slate-400 font-bold leading-relaxed">Directement via le bouton <Plus size={14} className="inline mx-1 text-orange-600"/> centre ou depuis votre Dashboard personnel.</p>
                    </div>
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-orange-50 space-y-2">
                       <h5 className="text-[11px] font-black text-slate-700 uppercase">Où est l'espace de Scan ?</h5>
                       <p className="text-[10px] text-slate-400 font-bold leading-relaxed">Utilisez le bouton <Plus size={14} className="inline mx-1 text-orange-600"/> en bas, puis choisissez l'icône <QrCode size={14} className="inline mx-1 text-slate-500"/> Scan.</p>
                    </div>
                 </div>
              </div>

           </section>

           {/* RETOUR ACCUEIL */}
           <div className="text-center pt-10">
              <Link to="/home" className="inline-flex items-center gap-3 px-12 py-5 bg-slate-900 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-2xl hover:bg-black transition-all group">
                 Retourner à la navigation <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
           </div>

        </div>
      </div>
    </MainLayout>
  );
};

export default UsageGuidePage;
