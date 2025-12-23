import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCategories } from "../../hooks/useCategories";
import MainLayout from "../../components/layouts/MainLayout";
import { X, Filter, Check, ChevronLeft, Clock, Calendar as CalendarIcon } from "lucide-react";
import Button from "../../components/ui/Button";

const cameroonianCities = [
  "Yaoundé", "Douala", "Garoua", "Bamenda", "Maroua", "Bafoussam", 
  "Ngaoundéré", "Bertoua", "Ebolowa", "Buea", "Kumba", "Nkongsamba", 
  "Limbe", "Edéa", "Kribi", "Dschang", "Foumban", "Mbouda", 
  "Sangmélima", "Bafang", "Bafia", "Kousséri", "Guider", "Meiganga", 
  "Yagoua", "Tiko", "Mbalmayo", "Kumbo", "Wum", "Akonolinga", 
  "Eséka", "Mamfé", "Obala"
].sort();

const AdvancedFilterPage = () => {
  const navigate = useNavigate();
  const { data: categories } = useCategories();

  const [filters, setFilters] = useState({
    types: [], // 'paid', 'free'
    formats: [], // 'online', 'in-person'
    cities: [],
    categories: [],
    time: "",
    day: ""
  });

  const toggleFilter = (category, value) => {
    setFilters(prev => {
      const current = prev[category];
      if (current.includes(value)) {
        return { ...prev, [category]: current.filter(v => v !== value) };
      } else {
        return { ...prev, [category]: [...current, value] };
      }
    });
  };

  const handleApply = () => {
    const params = new URLSearchParams();
    if (filters.types.length > 0) params.set("types", filters.types.join(","));
    if (filters.formats.length > 0) params.set("formats", filters.formats.join(","));
    if (filters.cities.length > 0) params.set("cities", filters.cities.join(","));
    if (filters.categories.length > 0) params.set("categories", filters.categories.join(","));
    if (filters.time) params.set("time", filters.time);
    if (filters.day) params.set("day", filters.day);
    
    navigate(`/events?${params.toString()}`);
  };

  const FilterSection = ({ title, items, category }) => (
    <div className="mb-8">
      <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
        {title}
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {items.map((item) => {
          const value = item.id || item.name || item;
          const label = item.name || item;
          const isSelected = filters[category].includes(value);
          
          return (
            <button
              key={value}
              onClick={() => toggleFilter(category, value)}
              className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-200 ${
                isSelected 
                  ? "bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/30 dark:border-blue-400 dark:text-blue-300 shadow-sm" 
                  : "bg-white border-gray-200 text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 hover:border-blue-300 dark:hover:border-blue-700"
              }`}
            >
              <span className="text-sm font-medium truncate">
                {item.emoji && <span className="mr-2">{item.emoji}</span>}
                {label}
              </span>
              {isSelected && <Check className="w-4 h-4 shrink-0" />}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Filtres Avancés</h1>
          <button 
            onClick={() => setFilters({ types: [], formats: [], cities: [], categories: [], time: "", day: "" })}
            className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            Réinitialiser
          </button>
        </div>

        <div className="space-y-10">
          {/* Jour et Heure */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-blue-500" /> Choisir un jour
              </h3>
              <input 
                type="date" 
                value={filters.day}
                onChange={(e) => setFilters({...filters, day: e.target.value})}
                className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-500" /> Heure précise
              </h3>
              <input 
                type="time" 
                value={filters.time}
                onChange={(e) => setFilters({...filters, time: e.target.value})}
                className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Type de prix */}
          <FilterSection 
            title="Type d'événement" 
            category="types" 
            items={[
              { id: "free", name: "Gratuit" },
              { id: "paid", name: "Payant" }
            ]} 
          />

          {/* Format */}
          <FilterSection 
            title="Format" 
            category="formats" 
            items={[
              { id: "presentiel", name: "Présentiel" },
              { id: "en-ligne", name: "En ligne" }
            ]} 
          />

          {/* Catégories */}
          {categories && (
            <FilterSection 
              title="Catégories" 
              category="categories" 
              items={categories} 
            />
          )}

          {/* Villes */}
          <FilterSection 
            title="Villes" 
            category="cities" 
            items={cameroonianCities} 
          />
        </div>

        <div className="sticky bottom-8 mt-12 flex justify-center">
          <Button 
            onClick={handleApply}
            variant="primary" 
            size="lg" 
            className="w-full max-w-md shadow-2xl py-4 text-lg rounded-2xl"
          >
            <Filter className="w-5 h-5 mr-2" />
            Appliquer les filtres
          </Button>
        </div>
      </div>
    </MainLayout>
  );
};

export default AdvancedFilterPage;
