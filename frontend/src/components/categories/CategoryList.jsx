import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useCategories } from "../../hooks/useCategories";
import { Loader2, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";

/**
 * Affiche une carte individuelle pour une catégorie avec un style moderne et premium.
 */
const CategoryCard = ({ category }) => {
  return (
    <Link
      to={`/categories/${category.name}`}
      className="group relative flex flex-col items-center justify-center p-4 sm:p-6 
                 bg-white dark:bg-gray-800/50 backdrop-blur-sm
                 rounded-3xl border border-gray-100 dark:border-gray-700/50
                 shadow-sm hover:shadow-xl transition-all duration-500 ease-out
                 transform hover:-translate-y-2 min-w-[120px] sm:min-w-0"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="relative z-10 flex flex-col items-center">
        <span className="text-3xl sm:text-5xl mb-3 sm:mb-4 transition-transform duration-500 group-hover:scale-125 group-hover:rotate-6">
          {category.emoji || "📁"}
        </span>
        <p className="font-bold text-center text-xs sm:text-base text-gray-800 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate w-full">
          {category.name}
        </p>
        <div className="mt-2 w-0 group-hover:w-full h-0.5 bg-blue-500 transition-all duration-500 rounded-full"></div>
      </div>
    </Link>
  );
};

/**
 * Composant principal qui charge et affiche la grille des catégories avec option "Voir plus".
 */
const ListCategorie = () => {
  const { data: categories, isLoading, isError } = useCategories();
  const [showAll, setShowAll] = useState(false);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-red-500 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/20">
        <AlertTriangle className="w-10 h-10 mb-3" />
        <p className="font-medium">Impossible de charger les catégories.</p>
      </div>
    );
  }

  const displayedCategories = showAll ? categories : categories?.slice(0, 4);

  return (
    <div className="space-y-10">
      {/* Mobile: Horizontal Scroll | Desktop: Grid */}
      <div className="relative group/cat">
        <div className="flex overflow-x-auto pb-4 gap-4 snap-x md:grid md:grid-cols-4 md:gap-8 md:overflow-visible no-scrollbar scroll-smooth">
          {(showAll ? categories : categories?.slice(0, 8))?.map((cat) => (
            <div key={cat.id || cat._id} className="snap-center shrink-0 md:shrink">
              <CategoryCard category={cat} />
            </div>
          ))}
        </div>
        
        {/* Mobile Scroll Indicator */}
        <div className="md:hidden absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none animate-pulse">
          <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-1 rounded-full">
            <ChevronDown className="w-4 h-4 text-blue-500 -rotate-90" />
          </div>
        </div>
      </div>
      
      {/* On cache le bouton "Voir plus" sur mobile car on a le scroll horizontal, ou on le garde pour desktop */}
      {categories?.length > 4 && (
        <div className="hidden md:flex justify-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="group flex items-center gap-2 px-8 py-3 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 font-bold rounded-2xl transition-all duration-300 shadow-md hover:shadow-xl border border-blue-100 dark:border-blue-900/30 hover:-translate-y-1"
          >
            {showAll ? (
              <>
                Voir moins <ChevronUp className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
              </>
            ) : (
              <>
                Voir plus <ChevronDown className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
              </>
            )}
          </button>
        </div>
      )}
      
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};


export default ListCategorie;
