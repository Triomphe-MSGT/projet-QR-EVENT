import React from "react";
import { Link } from "react-router-dom"; // ✅ BUG FIX: Importé depuis react-router-dom
import { useCategories } from "../../hooks/useCategories"; // ✅ BUG FIX: Utilise le hook React Query
import { Loader2, AlertTriangle } from "lucide-react";

/**
 * Affiche une carte individuelle pour une catégorie.
 * STYLE MODIFIÉ: Plus petit, style "flat" (puce) pour une grille mobile dense.
 */
const CategoryCard = ({ category }) => {
  return (
    <Link
      to={`/categories/${category.name}`}
      className="flex flex-col items-center justify-center p-3 sm:p-4 
                 bg-gray-100 dark:bg-gray-800 
                 rounded-2xl
                 transition-all duration-200 ease-in-out
                 transform hover:scale-105 
                 hover:bg-gray-200 dark:hover:bg-gray-700 group"
    >
      {/* L'emoji est plus petit */}
      <span className="text-3xl sm:text-4xl mb-2 transition-transform duration-300 group-hover:scale-110">
        {category.emoji || "📁"} {/* Emoji par défaut */}
      </span>
      {/* Le texte est plus petit */}
      <p className="font-semibold text-center text-xs sm:text-sm text-gray-700 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
        {category.name}
      </p>
    </Link>
  );
};

/**
 * Composant principal qui charge et affiche la grille des catégories.
 */
const ListCategorie = () => {
  // ✅ Utilisation du hook 'useCategories' pour charger les données
  const { data: categories, isLoading, isError } = useCategories();

  // État de chargement
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // État d'erreur
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-32 text-red-500">
        <AlertTriangle className="w-8 h-8 mb-2" />
        <p>Impossible de charger les catégories.</p>
      </div>
    );
  }

  // Rendu de la grille
  return (
    // ✅ STYLE MODIFIÉ: Commence avec 3 colonnes sur mobile, puis 4, puis 5.
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 sm:gap-4">
      {categories?.map((cat) => (
        <CategoryCard key={cat.id} category={cat} />
      ))}
    </div>
  );
};

export default ListCategorie;
