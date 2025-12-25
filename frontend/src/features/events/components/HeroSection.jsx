import React, { useState } from "react";
import { Search, ArrowRight, SlidersHorizontal, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const searchQuery = query.trim();
    navigate(
      searchQuery
        ? `/events?search=${encodeURIComponent(searchQuery)}`
        : "/events"
    );
  };

  return (
    <section className="relative min-h-[60vh] md:min-h-[70vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-blue-700 dark:to-indigo-900">
      {/* Subtle Professional Background Elements (CSS Only) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Soft Glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-400/10 rounded-full blur-[120px] animate-pulse delay-700"></div>
        
        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        
        {/* Floating Decorative Shapes */}
        <div className="absolute top-1/4 right-10 w-24 h-24 border border-white/10 rounded-full animate-float opacity-20"></div>
        <div className="absolute bottom-1/4 left-10 w-32 h-32 border border-white/10 rounded-3xl rotate-12 animate-float-slow opacity-20"></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-20 text-center">
        {/* Premium Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white text-[10px] font-black tracking-[0.2em] mb-8 animate-fade-in-up">
          <Sparkles className="w-3 h-3 text-blue-200" />
          DÉCOUVREZ L'EXCELLENCE ÉVÉNEMENTIELLE
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-[1.1] tracking-tighter mb-8 animate-fade-in-up delay-100">
          Trouvez votre prochain <br />
          <span className="text-blue-100/90">événement mémorable</span>
        </h1>

        {/* Subtext */}
        <p className="text-lg md:text-xl text-blue-50/80 font-medium max-w-2xl mx-auto mb-12 leading-relaxed animate-fade-in-up delay-200">
          Recherchez parmi des milliers de concerts, conférences et festivals. 
          La plateforme de référence pour vos expériences au Cameroun.
        </p>

        {/* Professional Search Bar (Glassmorphism) */}
        <div className="max-w-2xl mx-auto animate-fade-in-up delay-300">
          <form
            onSubmit={handleSearchSubmit}
            className="flex flex-col md:flex-row items-stretch md:items-center gap-3 p-2 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl md:rounded-[2.5rem] shadow-2xl transition-all duration-500 hover:bg-white/15"
          >
            <div className="flex-1 flex items-center px-4 md:px-6">
              <Search className="w-5 h-5 text-blue-200 shrink-0" />
              <input
                type="text"
                placeholder="Artiste, ville, ou événement..."
                className="w-full h-12 md:h-14 bg-transparent border-none focus:ring-0 text-white placeholder-blue-100/50 text-base md:text-lg font-medium"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2 p-1">
              <button
                type="button"
                onClick={() => navigate("/events")}
                className="h-12 w-12 md:h-14 md:w-14 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-2xl md:rounded-full transition-all border border-white/10 group shrink-0"
                title="Filtres"
              >
                <SlidersHorizontal className="w-5 h-5 transition-transform group-hover:rotate-180" />
              </button>
              <button
                type="submit"
                className="flex-1 md:flex-none h-12 md:h-14 px-6 md:px-10 bg-white text-blue-600 hover:bg-blue-50 rounded-2xl md:rounded-full transition-all shadow-xl font-black text-xs md:text-sm flex items-center justify-center gap-2 group whitespace-nowrap"
              >
                Explorer
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </form>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 flex flex-wrap justify-center gap-8 opacity-60 animate-fade-in-up delay-400">
          <div className="flex items-center gap-2 text-white text-xs font-bold tracking-widest">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
            500+ ÉVÉNEMENTS
          </div>
          <div className="flex items-center gap-2 text-white text-xs font-bold tracking-widest">
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
            10+ VILLES
          </div>
          <div className="flex items-center gap-2 text-white text-xs font-bold tracking-widest">
            <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse"></div>
            SÉCURISÉ PAR QR
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0) rotate(12deg); }
          50% { transform: translateY(-30px) rotate(15deg); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-slow { animation: float-slow 8s ease-in-out infinite; }
      `}</style>
    </section>
  );
};

export default HeroSection;
