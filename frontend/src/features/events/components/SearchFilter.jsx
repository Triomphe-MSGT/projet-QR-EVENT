import React from "react";
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
  Calendar,
  Laptop
} from "lucide-react";
import { useCategories } from "../../../hooks/useCategories";
import { useSearchParams } from "react-router-dom";

const SearchAndFilter = ({
  query,
  setQuery,
  isFilterOpen,
  setIsFilterOpen,
  setCurrentPage
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: categories } = useCategories();

  const cities = ["Douala", "Yaoundé", "Garoua", "Bamenda", "Bafoussam", "Maroua", "Ngaoundéré", "Nkongsamba", "Kumba", "Édéa", "Limbé", "Ébolowa", "Autre"];

  const types = [
    { label: "Gratuit", value: "free" },
    { label: "Payant", value: "paid" }
  ];

  const formats = [
    { label: "Présentiel", value: "Présentiel", icon: <MapPin className="w-3.5 h-3.5" /> },
    { label: "En ligne", value: "En ligne", icon: <Laptop className="w-3.5 h-3.5" /> }
  ];

  const updateFilters = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (!value || value === "" || (Array.isArray(value) && value.length === 0)) {
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
    updateFilters(key, current.filter(Boolean));
  };

  const activeTypes = searchParams.get("types")?.split(",") || [];
  const activeFormats = searchParams.get("formats")?.split(",") || [];
  const activeCities = searchParams.get("cities")?.split(",") || [];
  const activeCategories = searchParams.get("categories")?.split(",") || [];
  const activeTime = searchParams.get("time") || "";

  const totalActive = activeTypes.length + activeFormats.length + activeCities.length + activeCategories.length + (activeTime ? 1 : 0) + (searchParams.get("day") ? 1 : 0);

  return (
    <div className="w-full bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Search Bar */}
      <div className="p-3 md:p-4 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-orange-500 transition-colors" />
          <input
            type="text"
            placeholder="Rechercher par nom, lieu..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-12 pr-10 py-4 bg-slate-50 text-slate-900 placeholder-slate-400 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/10 transition-all font-medium"
          />
          {query && (
            <button onClick={() => setQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className={`flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-bold text-sm transition-all border ${
            isFilterOpen 
              ? "bg-slate-900 border-slate-900 text-white shadow-lg" 
              : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
          }`}
        >
          <Filter className="h-4 w-4" />
          <span>Filtres</span>
          {totalActive > 0 && (
            <span className="flex items-center justify-center min-w-[20px] h-5 px-1 rounded-full bg-orange-500 text-white text-[10px] font-black">
              {totalActive}
            </span>
          )}
          <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isFilterOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Expanded Filters */}
      {isFilterOpen && (
        <div className="p-6 md:p-8 border-t border-slate-50 bg-white animate-slide-down">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-8">
            
            {/* Date */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Calendar className="w-3 h-3 text-orange-500" /> Date
              </label>
              <input 
                type="date"
                value={searchParams.get("day") || ""}
                onChange={(e) => updateFilters("day", e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-orange-500 outline-none text-sm transition-all font-medium"
              />
            </div>

            {/* Price */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Zap className="w-3 h-3 text-blue-500" /> Tarif
              </label>
              <div className="flex flex-col gap-2">
                {types.map(t => (
                  <button
                    key={t.value}
                    onClick={() => toggleMultiFilter("types", t.value)}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium border transition-all ${
                      activeTypes.includes(t.value)
                        ? "bg-blue-600 border-blue-600 text-white"
                        : "bg-white border-slate-100 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {t.label}
                    {activeTypes.includes(t.value) && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Format */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Laptop className="w-3 h-3 text-emerald-500" /> Format
              </label>
              <div className="flex flex-col gap-2">
                {formats.map(f => (
                  <button
                    key={f.value}
                    onClick={() => toggleMultiFilter("formats", f.value)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium border transition-all ${
                      activeFormats.includes(f.value)
                        ? "bg-emerald-600 border-emerald-600 text-white"
                        : "bg-white border-slate-100 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span className="opacity-70">{f.icon}</span>
                    <span className="flex-1 text-left">{f.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* City */}
            <div className="space-y-3 lg:col-span-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <MapPin className="w-3 h-3 text-red-500" /> Ville
              </label>
              <select
                multiple
                value={activeCities}
                onChange={(e) => {
                  const values = Array.from(e.target.selectedOptions, opt => opt.value);
                  updateFilters("cities", values);
                }}
                className="w-full h-32 p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none custom-scrollbar font-medium"
              >
                {cities.map(c => (
                  <option key={c} value={c} className="py-2 px-3 rounded-lg mb-1 checked:bg-orange-500 checked:text-white">
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Categories */}
            <div className="space-y-3 lg:col-span-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Tag className="w-3 h-3 text-purple-500" /> Catégories
              </label>
              <div className="flex flex-col gap-1.5 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                {categories?.map(cat => (
                  <label key={cat._id || cat.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={activeCategories.includes(cat._id || cat.id)}
                      onChange={() => toggleMultiFilter("categories", cat._id || cat.id)}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${activeCategories.includes(cat._id || cat.id) ? 'bg-purple-600 border-purple-600 text-white' : 'border-slate-200'}`}>
                      {activeCategories.includes(cat._id || cat.id) && <Check size={12} />}
                    </div>
                    <span className="text-xs font-medium text-slate-700">{cat.emoji} {cat.name}</span>
                  </label>
                ))}
              </div>
            </div>

          </div>

          <div className="mt-10 pt-6 border-t border-slate-50 flex justify-between items-center">
            <button 
              onClick={() => {
                setSearchParams(new URLSearchParams());
                setQuery("");
                setCurrentPage(1);
              }}
              className="text-[10px] font-black text-slate-400 hover:text-red-500 uppercase tracking-widest flex items-center gap-2"
            >
              <X className="w-3 h-3" /> Réinitialiser tout
            </button>
            <button 
              onClick={() => setIsFilterOpen(false)}
              className="px-8 py-3 bg-slate-100 text-slate-900 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-200 transition-all"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-down { animation: slideDown 0.4s ease-out forwards; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
      `}</style>
    </div>
  );
};

export default SearchAndFilter;
