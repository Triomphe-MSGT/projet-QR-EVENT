import React from "react";
import MainLayout from "../../components/layout/MainLayout";
import { 
  BookOpen, 
  Search, 
  Zap, 
  QrCode, 
  ShieldCheck, 
  Calendar, 
  Users, 
  FileText, 
  ArrowRight,
  HelpCircle,
  Play
} from "lucide-react";
import { Link } from "react-router-dom";

const UsageGuidePage = () => {
  const sections = [
    {
      title: "Pour les Participants",
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
      steps: [
        { icon: Search, title: "Explorer", text: "Découvrez des événements exclusifs via notre catalogue filtré par catégorie et lieu." },
        { icon: Zap, title: "Réserver", text: "Réservez votre place en quelques secondes avec votre nom et email." },
        { icon: QrCode, title: "Scanner", text: "Récupérez votre Pass Digital (QR Code) dans votre espace 'Mes Billets'." }
      ]
    },
    {
      title: "Pour les Organisateurs",
      icon: Calendar,
      color: "text-orange-600",
      bg: "bg-orange-50",
      steps: [
        { icon: BookOpen, title: "Créer", text: "Configurez votre événement : date, lieu, visibilité et limite de participants." },
        { icon: ShieldCheck, title: "Valider", text: "Utilisez l'outil de scan pro pour contrôler les entrées en temps réel." },
        { icon: FileText, title: "Analyser", text: "Suivez vos statistiques d'inscription et générez des bilans PDF complets." }
      ]
    }
  ];

  return (
    <MainLayout>
      <div className="bg-slate-50 min-h-screen font-sans selection:bg-orange-100 pb-10 md:pb-20">
        
        {/* HERO SECTION */}
        <section className="bg-slate-900 pt-24 pb-16 md:pt-48 md:pb-32 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
           <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] md:w-[800px] h-[300px] md:h-[400px] bg-orange-600 rounded-full blur-[120px] md:blur-[160px] opacity-20 -mb-48 md:-mb-64"></div>
           
           <div className="max-w-5xl mx-auto px-6 text-center space-y-6 md:space-y-8 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-white/10 backdrop-blur-xl border border-white/10 rounded-full text-white font-black text-[8px] md:text-[10px] uppercase tracking-widest animate-in fade-in slide-in-from-top-4 duration-700">
                 <HelpCircle size={12} className="text-orange-500" />
                 Centre d'Aide
              </div>
              <h1 className="text-4xl md:text-8xl font-black text-white tracking-tighter uppercase leading-none animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                 Guide <span className="text-orange-500">QR-EVENT</span>
              </h1>
              <p className="text-slate-400 font-bold text-sm md:text-lg max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                 Maîtrisez la plateforme de billetterie la plus innovante en quelques minutes.
              </p>
           </div>
        </section>

        {/* GUIDES CONTENT */}
        <div className="max-w-7xl mx-auto px-4 md:px-6 -mt-8 md:-mt-16 relative z-20 space-y-12 md:space-y-24">
           
           {/* Section Cards */}
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10">
              {sections.map((section, idx) => (
                <div key={idx} className="bg-white rounded-[2rem] md:rounded-[3rem] p-8 md:p-16 shadow-xl shadow-slate-200/50 border border-slate-50 space-y-8 md:space-y-12">
                   <div className="flex items-center gap-4 md:gap-6">
                      <div className={`w-14 h-14 md:w-20 md:h-20 ${section.bg} ${section.color} rounded-2xl md:rounded-[2rem] flex items-center justify-center shadow-inner`}>
                         <section.icon size={28} md:size={40} />
                      </div>
                      <h2 className="text-2xl md:text-3xl font-black text-slate-500 uppercase tracking-tighter">{section.title}</h2>
                   </div>

                   <div className="space-y-6 md:space-y-8">
                      {section.steps.map((step, sIdx) => (
                        <div key={sIdx} className="flex gap-4 md:gap-6 group">
                           <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-50 text-slate-300 rounded-xl md:rounded-2xl flex items-center justify-center font-black text-sm md:text-lg transition-colors group-hover:bg-slate-900 group-hover:text-white shrink-0">
                              {sIdx + 1}
                           </div>
                           <div className="space-y-1 md:space-y-2">
                              <div className="flex items-center gap-2 md:gap-3">
                                 <step.icon size={16} md:size={18} className="text-orange-500" />
                                 <h4 className="text-sm md:text-base font-black text-slate-500 uppercase">{step.title}</h4>
                              </div>
                              <p className="text-slate-400 font-bold text-xs md:text-sm leading-relaxed">{step.text}</p>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
              ))}
           </div>

           {/* FEATURES SHOWCASE */}
           <section className="space-y-8 md:space-y-16">
              <div className="text-center space-y-4">
                 <h3 className="text-2xl md:text-4xl font-black text-slate-500 uppercase tracking-tighter">Fonctionnalités Clés</h3>
                 <div className="w-16 md:w-20 h-1 md:h-1.5 bg-orange-600 mx-auto rounded-full"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                 {[
                   { title: "Sécurité Maximale", text: "Chaque pass est unique et crypté, garantissant une protection contre la fraude.", icon: ShieldCheck },
                   { title: "Dashboard Temps Réel", text: "Suivez vos flux de participants en direct depuis votre console de pilotage.", icon: TrendingUp },
                   { title: "Support 24/7", text: "Nos experts sont à votre écoute pour vous accompagner dans vos projets.", icon: HelpCircle }
                 ].map((feat, i) => (
                    <div key={i} className="bg-white p-8 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm text-center space-y-4 md:space-y-6 hover:-translate-y-2 transition-all">
                       <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-50 text-orange-600 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto shadow-inner"><feat.icon size={24} md:size={28} /></div>
                       <h4 className="text-base md:text-lg font-black text-slate-500 uppercase tracking-tight">{feat.title}</h4>
                       <p className="text-slate-400 font-bold text-xs md:text-sm leading-relaxed">{feat.text}</p>
                    </div>
                 ))}
              </div>
           </section>

           {/* CTA SECTION */}
           <section className="bg-orange-600 rounded-[2.5rem] md:rounded-[4rem] p-10 md:p-24 text-center space-y-8 md:space-y-10 shadow-2xl shadow-orange-600/30 overflow-hidden relative">
              <Zap size={150} md:size={200} className="absolute -right-20 -bottom-20 text-white opacity-10 rotate-12" />
              <div className="space-y-4 relative z-10">
                 <h2 className="text-3xl md:text-6xl font-black text-white uppercase tracking-tighter leading-tight">Prêt à lancer <br className="hidden md:block"/>votre événement ?</h2>
                 <p className="text-orange-100 font-bold text-sm md:text-lg max-w-md mx-auto">Rejoignez des milliers d'organisateurs qui font confiance à QR-EVENT.</p>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
                 <Link to="/login" className="w-full sm:w-auto px-8 md:px-12 py-4 md:py-5 bg-white text-orange-600 font-black text-[10px] uppercase tracking-widest rounded-xl md:rounded-2xl shadow-xl hover:scale-105 transition-transform active:scale-95 text-center">
                    Commencer maintenant
                 </Link>
                 <Link to="/events" className="w-full sm:w-auto px-8 md:px-12 py-4 md:py-5 bg-orange-700 text-white font-black text-[10px] uppercase tracking-widest rounded-xl md:rounded-2xl flex items-center justify-center gap-3 hover:bg-orange-800 transition-colors text-center">
                    <Play size={14} className="fill-current" /> Voir la démo
                 </Link>
              </div>
           </section>

        </div>
      </div>
    </MainLayout>
  );
};

// Internal icon replacement for TrendingUp if missing from lucide
const TrendingUp = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
    <polyline points="17 6 23 6 23 12"></polyline>
  </svg>
);

export default UsageGuidePage;
