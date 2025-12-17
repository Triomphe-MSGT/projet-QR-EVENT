import React, { useState } from "react";
import { Search, ArrowRight } from "lucide-react";
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
    <section className="max-w-4xl md:max-w-full mx-auto px-6 md:px-0 md:py-20 rounded-b-3xl md:rounded-none bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-blue-700 dark:to-indigo-800 shadow-2xl md:shadow-none relative overflow-hidden">
      {/* Background decoration for desktop */}
      <div className="hidden md:block absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:flex md:items-center md:gap-12">
        {/* Colonne Gauche : Texte */}
        <div className="md:w-1/2 text-center md:text-left">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 text-white leading-tight md:leading-tight animate-fade-in-up">
            Trouvez votre prochain événement
          </h1>
          <p className="text-lg md:text-xl text-blue-100 dark:text-blue-200 mb-10 max-w-3xl mx-auto md:mx-0 animate-fade-in-up delay-100">
            Recherchez parmi des milliers de concerts, conférences, et plus
            encore. La plateforme tout-en-un pour vos expériences.
          </p>
          <form
            onSubmit={handleSearchSubmit}
            className="relative flex items-center shadow-lg rounded-full bg-white/90 dark:bg-gray-800/90 overflow-hidden border border-transparent max-w-xl md:max-w-full mx-auto md:mx-0 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-2xl animate-fade-in-up delay-200 group"
          >
            <Search className="absolute left-5 w-5 h-5 text-gray-500 pointer-events-none group-focus-within:text-blue-600 transition-colors" />
            <input
              type="text"
              placeholder="Rechercher un événement..."
              className="w-full h-16 py-4 pl-14 pr-20 bg-transparent focus:outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-lg"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button
              type="submit"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 transition-all duration-300 hover:scale-110 active:scale-95"
              aria-label="Rechercher"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        </div>

        {/* Colonne Droite : Image/Illustration (Visible uniquement sur Desktop) */}
        <div className="hidden md:block md:w-1/2 relative animate-fade-in-up delay-300">
          {/* Cercle décoratif derrière l'image */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/30 rounded-full blur-3xl animate-pulse"></div>
          <img
            src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
            alt="Event Illustration"
            className="relative z-10 rounded-2xl shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-700 border-4 border-white/20 animate-float"
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
