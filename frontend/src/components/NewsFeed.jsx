import React, { useRef, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Rss, Image as ImageIcon, ExternalLink } from "lucide-react";

// --- 1. MODIFIÉ: Récupère 15 articles comme demandé ---
const fetchTechNews = async () => {
  const response = await fetch(
    "https://dev.to/api/articles?tag=web&per_page=15" // Changé de 10 à 15
  );
  if (!response.ok) {
    throw new Error("Erreur lors de la récupération des actualités");
  }
  return response.json();
};

// --- 2. SUPPRIMÉ: Les styles d'animation CSS ne sont plus nécessaires ---
// const carouselAnimationStyles = `...`; // Nous n'en avons plus besoin

/**
 * --- Composant "Carte" (j'ai juste corrigé w-50 en w-72) ---
 */
const NewsCard = ({ article }) => (
  <a
    href={article.url}
    target="_blank"
    rel="noopener noreferrer"
    className="
      flex-shrink-0
      w-72 /* CORRIGÉ: w-50 n'existe pas, w-72 (288px) est mieux */
      mr-6
      bg-white dark:bg-gray-800
      rounded-lg
      shadow-md
      overflow-hidden
      border border-gray-200 dark:border-gray-700
      transition-all duration-300
      hover:shadow-xl hover:-translate-y-1
    "
  >
    {/* Image */}
    {article.cover_image ? (
      <img
        src={article.cover_image}
        alt={article.title}
        className="h-40 w-full object-cover"
      />
    ) : (
      <div className="h-40 w-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
        <ImageIcon className="w-12 h-12 text-gray-400" />
      </div>
    )}
    {/* Texte en dessous */}
    <div className="p-4">
      <span className="text-blue-500 text-xs font-semibold">
        #{article.tags.split(",")[0]}
      </span>
      <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mt-1 truncate">
        {article.title}
      </h3>
      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mt-2">
        <img
          src={article.user.profile_image_90}
          alt={article.user.name}
          className="w-6 h-6 rounded-full mr-2"
        />
        <span>{article.user.name}</span>
      </div>
    </div>
  </a>
);

/**
 * --- COMPOSANT PRINCIPAL (Logique entièrement revue) ---
 */
const FeaturedNewsCarousel = () => {
  const {
    data: articles,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["featuredNews"],
    queryFn: fetchTechNews,
    // Votre demande "pas d'actualisation avant 15" est déjà gérée ici :
    // React Query ne rafraîchira pas les données avant 15 minutes.
    refetchInterval: 1000 * 60 * 15,
    refetchOnWindowFocus: false,
  });

  // --- 3. NOUVELLE LOGIQUE: Défilement JavaScript ---
  const scrollRef = useRef(null);
  const animationFrameRef = useRef(null);
  // Un état pour savoir si l'utilisateur interagit (survol, clic, etc.)
  const [isInteracting, setIsInteracting] = useState(false);

  // Vitesse de défilement (0.5 pixel par frame). Augmentez pour aller plus vite.
  const SCROLL_SPEED = 0.5;

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    // Fonction d'animation fluide
    const autoScroll = () => {
      // N'autoscroll pas si l'utilisateur interagit
      if (!isInteracting) {
        const scrollWidth = scrollContainer.scrollWidth;
        const scrollLeft = scrollContainer.scrollLeft;

        // Fait défiler
        scrollContainer.scrollLeft += SCROLL_SPEED;

        // Logique de boucle infinie :
        // Quand on atteint la moitié (la fin du 1er set de 15),
        // on retourne au début sans que l'utilisateur le voie.
        if (scrollLeft >= scrollWidth / 2) {
          scrollContainer.scrollLeft = 0;
        }
      }
      // Continue la boucle d'animation
      animationFrameRef.current = requestAnimationFrame(autoScroll);
    };

    // Lance l'animation
    animationFrameRef.current = requestAnimationFrame(autoScroll);

    // Nettoyage à la suppression du composant
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isInteracting]); // L'effet dépend de l'état d'interaction

  // Fonctions pour mettre en pause le défilement
  const handleInteractionStart = () => setIsInteracting(true);
  const handleInteractionEnd = () => setIsInteracting(false);
  // --- Fin de la nouvelle logique ---

  if (isLoading || isError || !articles) {
    return (
      <div className="text-center p-8 text-gray-600 dark:text-gray-300">
        <Rss className="w-8 h-8 mx-auto animate-pulse" />
        <p className="mt-2">Chargement du carrousel...</p>
      </div>
    );
  }

  // Sous-composant pour les cartes (inchangé)
  const CardItems = ({ items, setKey }) => (
    <>
      {items.map((article) => (
        <NewsCard key={`${setKey}-${article.id}`} article={article} />
      ))}
    </>
  );

  return (
    <>
      {/* 4. SUPPRIMÉ: La balise <style> n'est plus nécessaire */}

      <div className="w-full overflow-hidden py-8 bg-gray-50 dark:bg-gray-900">
        <h2 className="text-2xl font-bold mb-6 px-4 sm:px-6 lg:px-8 text-gray-800 dark:text-gray-100">
          News-Tech
        </h2>

        {/* * --- 5. MODIFIÉ: Le conteneur de défilement ---
         * C'est maintenant un vrai conteneur de scroll (overflow-x-auto)
         * que l'utilisateur peut "attraper" (cursor-grab).
         */}
        <div
          className="relative flex overflow-x-auto cursor-grab active:cursor-grabbing"
          ref={scrollRef}
          // Événements pour pauser l'autoscroll
          onMouseEnter={handleInteractionStart}
          onMouseLeave={handleInteractionEnd}
          onPointerDown={handleInteractionStart} // Clic souris
          onPointerUp={handleInteractionEnd}
          onTouchStart={handleInteractionStart} // Doigt sur écran
          onTouchEnd={handleInteractionEnd}
          // Style pour cacher la barre de défilement

          style={{ msOverflowStyle: "none" }} /* IE */
        >
          {/* Webkit (Chrome, Safari) - nécessite un pseudo-élément CSS 
              ou l'installation de 'tailwind-scrollbar-hide' */}
          <style>
            {`
              .overflow-x-auto::-webkit-scrollbar {
                display: none;
              }
            `}
          </style>

          {/* Les cartes sont dupliquées pour la boucle infinie */}
          <CardItems items={articles} setKey="set1" />
          <CardItems items={articles} setKey="set2" />
        </div>
      </div>
    </>
  );
};

export default FeaturedNewsCarousel;
