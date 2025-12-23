import React, { useState } from "react";
import { 
  Search, 
  Filter, 
  MapPin, 
  X, 
  Tag, 
  Clock, 
  Zap, 
  Check,
  ChevronDown,
  Calendar
} from "lucide-react";
import { useCategories } from "../../hooks/useCategories";
import { useSearchParams } from "react-router-dom";

const SearchAndFilter = ({
  query,
  setQuery,
  isFilterOpen,
  setIsFilterOpen,
  setCurrentPage,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: categories } = useCategories();

  const cities = [
    "Douala", "Yaoundé", "Garoua", "Bamenda", "Bafoussam", "Maroua", 
    "Ngaoundéré", "Nkongsamba", "Kumba", "Édéa", "Loum", "Dschang", "Foumban", 
    "Mbouda", "Limbé", "Ébolowa", "Kousséri", "Tiko", "Bafang", "Mbalmayo", 
    "Guider", "Yagoua", "Bafia", "Buéa", "Kumbo", "Sangmélima", "Batouri", 
    "Mokolo", "Meïganga", "Mora", "Wum", "Bangangté"
  ];

  const times = [
    { label: "Matin", value: "08:00", icon: "🌅" },
    { label: "Après-midi", value: "12:00", icon: "☀️" },
    { label: "Soirée", value: "18:00", icon: "🌙" }
  ];

  const types = [
    { label: "Gratuit", value: "free" },
    { label: "Payant", value: "paid" }
  ];

  const updateFilters = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === null || value === "" || (Array.isArray(value) && value.length === 0)) {
      newParams.delete(key);
    } else {
      newParams.set(key, Array.isArray(value) ? value.join(",") : value);
    }
    setSearchParams(newParams);
    setCurrentPage(1);
  };

  const toggleMultiFilter = (key, value) => {
    const current = searchParams.get(key)?.split(",") || [];
    const index = current.indexOf(value);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(value);
    }
    updateFilters(key, current);
  };

  const formats = [
    { label: "Présentiel", value: "Présentiel", icon: "📍" },
    { label: "En ligne", value: "En ligne", icon: "💻" }
  ];

  const activeTypes = searchParams.get("types")?.split(",") || [];
  const activeFormats = searchParams.get("formats")?.split(",") || [];
  const activeCities = searchParams.get("cities")?.split(",") || [];
  const activeCategories = searchParams.get("categories")?.split(",") || [];
  const activeTime = searchParams.get("time") || "";

  const clearAll = () => {
    setSearchParams(new URLSearchParams());
    setQuery("");
    setCurrentPage(1);
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search Bar */}
        <div className="relative flex-1 group">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Rechercher par nom, artiste, lieu..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-14 pr-12 py-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 border border-gray-100 dark:border-gray-700 rounded-[2rem] focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm font-medium"
          />
          {query && (
            <button 
              onClick={() => setQuery("")}
              className="absolute inset-y-0 right-0 pr-5 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Filter Toggle Button */}
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className={`flex items-center justify-center gap-3 px-8 py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] transition-all shadow-lg border-2 ${
            isFilterOpen 
              ? "bg-blue-600 border-blue-600 text-white shadow-blue-500/30 scale-105" 
              : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-100 dark:border-gray-700 hover:border-blue-600/30"
          }`}
        >
          <Filter className={`h-4 w-4 ${isFilterOpen ? "animate-pulse" : ""}`} />
          <span>Filtres</span>
          {(activeTypes.length + activeFormats.length + activeCities.length + activeCategories.length + (activeTime ? 1 : 0)) > 0 && (
            <span className="flex items-center justify-center w-5 h-5 bg-white text-blue-600 rounded-full text-[10px] font-black">
              {activeTypes.length + activeFormats.length + activeCities.length + activeCategories.length + (activeTime ? 1 : 0)}
            </span>
          )}
        </button>
      </div>

      {/* Expanded Filters Panel */}
      {isFilterOpen && (
        <div className="p-8 md:p-10 bg-white dark:bg-gray-800 rounded-[3rem] border border-gray-100 dark:border-gray-700 shadow-2xl animate-fade-in-up space-y-10">
          <div className="flex items-center justify-between border-b border-gray-50 dark:border-gray-700 pb-6">
            <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Personnaliser ma recherche</h3>
            <button 
              onClick={clearAll}
              className="text-xs font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest flex items-center gap-2"
            >
              <X className="w-4 h-4" /> Réinitialiser
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Type Filter */}
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                <Zap className="w-3 h-3 text-amber-500" /> Accès
              </label>
              <div className="flex flex-col gap-2">
                {types.map(type => (
                  <button
                    key={type.value}
                    onClick={() => toggleMultiFilter("types", type.value)}
                    className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-[11px] font-bold transition-all border-2 ${
                      activeTypes.includes(type.value)
                        ? "bg-blue-600 border-blue-600 text-white shadow-md"
                        : "bg-gray-50 dark:bg-gray-900 border-transparent text-gray-500 hover:border-gray-200"
                    }`}
                  >
                    {type.label}
                    {activeTypes.includes(type.value) && <Check className="w-3 h-3" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Format Filter */}
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                <Calendar className="w-3 h-3 text-green-500" /> Format
              </label>
              <div className="flex flex-col gap-2">
                {formats.map(f => (
                  <button
                    key={f.value}
                    onClick={() => toggleMultiFilter("formats", f.value)}
                    className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-[11px] font-bold transition-all border-2 ${
                      activeFormats.includes(f.value)
                        ? "bg-green-600 border-green-600 text-white shadow-md"
                        : "bg-gray-50 dark:bg-gray-900 border-transparent text-gray-500 hover:border-gray-200"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{f.icon}</span>
                      {f.label}
                    </span>
                    {activeFormats.includes(f.value) && <Check className="w-3 h-3" />}
                  </button>
                ))}
              </div>
            </div>

            {/* City Filter */}
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                <MapPin className="w-3 h-3 text-red-500" /> Villes
              </label>
              <div className="relative">
                <select
                  multiple
                  value={activeCities}
                  onChange={(e) => {
                    const values = Array.from(e.target.selectedOptions, option => option.value);
                    updateFilters("cities", values);
                  }}
                  className="w-full h-32 p-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 no-scrollbar"
                >
                  {cities.map(city => (
                    <option key={city} value={city} className="py-1 px-2 rounded-lg mb-1 checked:bg-blue-600 checked:text-white">
                      {city}
                    </option>
                  ))}
                </select>
                <div className="absolute bottom-2 right-2 pointer-events-none">
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Time Filter */}
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                <Clock className="w-3 h-3 text-blue-500" /> Moment de la journée
              </label>
              <div className="grid grid-cols-1 gap-2">
                {times.map(time => (
                  <button
                    key={time.value}
                    onClick={() => updateFilters("time", activeTime === time.value ? "" : time.value)}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all border-2 ${
                      activeTime === time.value
                        ? "bg-blue-600 border-blue-600 text-white shadow-md"
                        : "bg-gray-50 dark:bg-gray-900 border-transparent text-gray-500 hover:border-gray-200"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-base">{time.icon}</span>
                      {time.label}
                    </span>
                    {activeTime === time.value && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                <Tag className="w-3 h-3 text-purple-500" /> Catégories
              </label>
              <div className="h-32 overflow-y-auto pr-2 space-y-2 no-scrollbar">
                {categories?.map(cat => (
                  <button
                    key={cat._id || cat.id}
                    onClick={() => toggleMultiFilter("categories", cat._id || cat.id)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-[11px] font-bold transition-all border-2 ${
                      activeCategories.includes(cat._id || cat.id)
                        ? "bg-purple-600 border-purple-600 text-white shadow-md"
                        : "bg-gray-50 dark:bg-gray-900 border-transparent text-gray-500 hover:border-gray-200"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{cat.emoji}</span>
                      {cat.name}
                    </span>
                    {activeCategories.includes(cat._id || cat.id) && <Check className="w-3 h-3" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fadeInUp 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default SearchAndFilter;
