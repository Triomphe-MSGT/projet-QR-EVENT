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
  Play,
  CheckCircle,
  Smartphone,
  Globe
} from "lucide-react";
import { Link } from "react-router-dom";

const HelpPage = () => {
  const sections = [
    {
      title: "Expérience Participant",
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
      description: "Comment trouver et réserver vos places en un clin d'œil.",
      steps: [
        { icon: Search, title: "Explorer", text: "Découvrez des événements exclusifs via notre catalogue filtré par ville et catégorie." },
        { icon: CheckCircle, title: "Réserver", text: "Inscrivez-vous instantanément avec votre adresse e-mail." },
        { icon: QrCode, title: "Présenter", text: "Accédez à votre pass QR unique dans votre espace personnel." }
      ]
    },
    {
      title: "Expérience Organisateur",
      icon: Calendar,
      color: "text-orange-600",
      bg: "bg-orange-50",
      description: "Gérez vos événements comme un professionnel.",
      steps: [
        { icon: BookOpen, title: "Publier", text: "Créez votre page d'événement personnalisée en moins de 2 minutes." },
        { icon: Smartphone, title: "Scanner", text: "Utilisez notre outil de scan mobile pour valider les entrées." },
        { icon: FileText, title: "Analyser", text: "Suivez vos statistiques et téléchargez vos bilans PDF." }
      ]
    }
  ];

  return (
    <MainLayout>
      <div className="bg-slate-50 min-h-screen font-sans selection:bg-orange-100 selection:text-orange-900 pb-20">
        
        {/* HERO SECTION - Light SaaS Style */}
        <section className="bg-white pt-24 pb-20 md:pt-40 md:pb-32 relative overflow-hidden border-b border-slate-50">
           <div className="absolute top-0 right-0 w-full h-full bg-slate-50/30 opacity-50"></div>
           <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-orange-50 rounded-full blur-[140px] opacity-20 -mb-48"></div>
           
           <div className="max-w-5xl mx-auto px-6 text-center space-y-8 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-50 rounded-full text-orange-600 font-black text-[9px] uppercase tracking-[0.3em]">
                 <HelpCircle size={14} />
                 Base de Connaissances
              </div>
              <h1 className="text-4xl md:text-8xl font-black text-slate-500 tracking-tighter uppercase leading-none">
                 Guide <span className="text-orange-500">Pratique</span>
              </h1>
              <p className="text-slate-400 font-bold text-base md:text-xl max-w-2xl mx-auto leading-relaxed">
                 Apprenez à utiliser la plateforme QR-EVENT étape par étape.
              </p>
           </div>
        </section>

        {/* GUIDES CONTENT */}
        <div className="max-w-7xl mx-auto px-6 -mt-12 md:-mt-20 relative z-20 space-y-24">
           
           {/* Section Cards */}
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
              {sections.map((section, idx) => (
                <div key={idx} className="bg-white rounded-[2.5rem] md:rounded-[3.5rem] p-10 md:p-20 shadow-2xl shadow-slate-200/50 border border-slate-50 flex flex-col justify-between group hover:border-orange-200 transition-all">
                   <div className="space-y-12">
                      <div className="space-y-4">
                        <div className={`w-20 h-20 ${section.bg} ${section.color} rounded-3xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform`}>
                           <section.icon size={44} />
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black text-slate-500 uppercase tracking-tighter">{section.title}</h2>
                        <p className="text-slate-400 font-bold text-sm tracking-tight">{section.description}</p>
                      </div>

                      <div className="space-y-8">
                         {section.steps.map((step, sIdx) => (
                           <div key={sIdx} className="flex gap-6">
                              <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center font-black text-sm shrink-0">
                                 {sIdx + 1}
                              </div>
                              <div className="space-y-1.5">
                                 <div className="flex items-center gap-3">
                                    <step.icon size={16} className="text-orange-600" />
                                    <h4 className="text-[13px] font-black text-slate-500 uppercase tracking-tight">{step.title}</h4>
                                 </div>
                                 <p className="text-slate-400 font-bold text-[13px] leading-relaxed">{step.text}</p>
                              </div>
                           </div>
                         ))}
                      </div>
                   </div>
                </div>
              ))}
           </div>

           {/* FEATURES GRID */}
           <section className="bg-white p-12 md:p-24 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-16">
              <div className="text-center space-y-4">
                 <h3 className="text-3xl font-black text-slate-500 uppercase tracking-tighter shrink-0">L'écosystème <span className="text-orange-600">QR-EVENT</span></h3>
                 <p className="text-slate-400 font-bold text-xs uppercase tracking-widest leading-none">Une technologie conçue pour la performance</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                 {[
                   { title: "Universalité", text: "Fonctionne sur tous les navigateurs et appareils mobiles.", icon: Globe },
                   { title: "Sécurité", text: "QR Codes cryptés et uniques pour chaque réservation.", icon: ShieldCheck },
                   { title: "Rapidité", text: "Validation des entrées en moins d'une seconde par participant.", icon: Zap }
                 ].map((feat, i) => (
                    <div key={i} className="text-center space-y-6">
                       <div className="w-16 h-16 bg-slate-50 text-orange-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner"><feat.icon size={28} /></div>
                       <h4 className="text-base font-black text-slate-500 uppercase tracking-tight">{feat.title}</h4>
                       <p className="text-slate-400 font-bold text-sm leading-relaxed">{feat.text}</p>
                    </div>
                 ))}
              </div>
           </section>

           {/* CTA */}
           <div className="bg-orange-600 rounded-[3rem] md:rounded-[4rem] p-12 md:p-24 text-center space-y-10 shadow-3xl shadow-orange-600/30 overflow-hidden relative group">
              <Zap size={240} className="absolute -right-20 -bottom-20 text-white/10 rotate-12 group-hover:scale-110 transition-transform" />
              <div className="space-y-4 relative z-10">
                 <h2 className="text-4xl md:text-7xl font-black text-white uppercase tracking-tighter leading-none">L'aventure <br/>commence ici.</h2>
                 <p className="text-orange-100 font-bold text-lg max-w-sm mx-auto">Prêt à transformer votre expérience événementielle ?</p>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 relative z-10 pt-4">
                 <Link to="/login" className="w-full sm:w-auto px-12 py-5 bg-white text-orange-600 font-black text-[11px] uppercase tracking-widest rounded-2xl shadow-2xl hover:bg-slate-50 transition-all">
                    Créer mon compte libre
                 </Link>
                 <Link to="/events" className="w-full sm:w-auto px-12 py-5 bg-orange-700 text-white font-black text-[11px] uppercase tracking-widest rounded-2xl shadow-xl flex items-center justify-center gap-3 hover:bg-orange-800 transition-all">
                    Explorer les Events <ArrowRight size={16} />
                 </Link>
              </div>
           </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default HelpPage;
