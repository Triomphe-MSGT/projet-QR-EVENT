import React, { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Rss, Image as ImageIcon, ExternalLink, ArrowRight, Zap, ChevronRight, Clock } from "lucide-react";

const fetchTechNews = async () => {
  const response = await fetch(
    "https://dev.to/api/articles?tag=web&per_page=20"
  );
  if (!response.ok) {
    throw new Error("Erreur lors de la récupération des actualités");
  }
  return response.json();
};

const FeaturedNewsCarousel = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  const {
    data: articles,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["featuredNews"],
    queryFn: fetchTechNews,
    refetchInterval: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  });

  const nextSlide = useCallback(() => {
    if (articles?.length) {
      setActiveIndex((prev) => (prev + 1) % articles.length);
      setProgress(0);
    }
  }, [articles]);

  useEffect(() => {
    if (isPaused || !articles?.length) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          nextSlide();
          return 0;
        }
        return prev + 0.7; // Vitesse augmentée (env. 4.3s par article)
      });
    }, 30);

    return () => clearInterval(interval);
  }, [isPaused, articles, nextSlide]);

  if (isLoading || isError || !articles?.length) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="h-[600px] bg-gray-100 dark:bg-gray-800/50 rounded-[2.5rem] animate-pulse flex items-center justify-center">
          <Rss className="w-12 h-12 text-blue-500/20" />
        </div>
      </div>
    );
  }

  const currentArticle = articles[activeIndex];

  return (
    <section className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
            <span className="text-blue-600 text-xs font-black uppercase tracking-widest">Live Tech Pulse</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-gray-900 dark:text-white uppercase">
            L'ACTU <span className="text-blue-600">PREMIUM</span>
          </h2>
        </div>
      </div>

      <div 
        className="relative flex flex-col lg:grid lg:grid-cols-12 gap-6 lg:gap-8 lg:h-[650px]"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* --- MAIN HERO DISPLAY --- */}
        <div className="lg:col-span-8 relative group overflow-hidden rounded-[2rem] lg:rounded-[2.5rem] bg-gray-900 shadow-2xl h-[450px] md:h-[500px] lg:h-full">
          {/* Background Image with Transition */}
          <div className="absolute inset-0 transition-all duration-1000 ease-in-out transform">
            <img 
              key={currentArticle.id}
              src={currentArticle.cover_image || currentArticle.social_image} 
              className="w-full h-full object-cover opacity-60 animate-fade-in scale-105 group-hover:scale-100 transition-transform duration-[2000ms]"
              alt={currentArticle.title}
            />
          </div>
          
          {/* Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent hidden lg:block"></div>

          {/* Content */}
          <div className="absolute bottom-0 left-0 p-6 md:p-12 lg:p-16 w-full max-h-full overflow-y-auto custom-scrollbar">
            <div className="max-w-3xl animate-fade-in-up">
              <div className="flex items-center gap-3 mb-4 lg:mb-6">
                <span className="px-3 py-1 lg:px-4 lg:py-1.5 bg-blue-600 text-white text-[10px] lg:text-xs font-bold rounded-full uppercase tracking-widest">
                  #{currentArticle.tags.split(",")[0]}
                </span>
                <span className="flex items-center gap-1.5 text-white/70 text-[10px] lg:text-xs font-medium">
                  <Clock className="w-3 h-3 lg:w-3.5 lg:h-3.5" />
                  {new Date(currentArticle.published_at).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })}
                </span>
              </div>
              
              <h3 className="text-2xl md:text-4xl lg:text-6xl font-black text-white mb-4 lg:mb-6 leading-[1.2] lg:leading-[1.1] tracking-tighter">
                {currentArticle.title}
              </h3>
              
              <p className="text-gray-300 text-sm lg:text-xl mb-6 lg:mb-10 line-clamp-3 md:line-clamp-none font-medium leading-relaxed">
                {currentArticle.description}
              </p>

              <div className="flex flex-wrap items-center gap-4 lg:gap-6">
                <a 
                  href={currentArticle.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 lg:px-8 lg:py-4 bg-white text-black text-sm lg:text-base font-black rounded-full hover:bg-blue-600 hover:text-white transition-all hover:scale-105 flex items-center gap-2 shadow-xl"
                >
                  Lire <span className="hidden sm:inline">l'article</span> <ChevronRight className="w-4 h-4 lg:w-5 lg:h-5" />
                </a>
                
                <div className="flex items-center gap-2 lg:gap-3">
                  <img src={currentArticle.user.profile_image_90} className="w-8 h-8 lg:w-10 lg:h-10 rounded-full border-2 border-white/20" alt="" />
                  <span className="text-white text-xs lg:text-base font-bold truncate max-w-[100px] lg:max-w-none">{currentArticle.user.name}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="absolute bottom-0 left-0 w-full h-1 lg:h-1.5 bg-white/10">
            <div 
              className="h-full bg-blue-600 transition-all duration-300 ease-linear"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* --- SIDEBAR CATEGORIES --- */}
        <div className="lg:col-span-4 flex flex-row lg:flex-col gap-3 lg:gap-4 overflow-x-auto lg:overflow-y-auto pb-4 lg:pb-0 pr-0 lg:pr-2 lg:custom-scrollbar snap-x lg:snap-none lg:h-full">
          {articles.map((article, index) => (
            <div 
              key={article.id}
              onClick={() => {
                setActiveIndex(index);
                setProgress(0);
              }}
              className={`
                group flex flex-row items-center gap-3 lg:gap-4 p-3 lg:p-4 rounded-2xl lg:rounded-[1.5rem] cursor-pointer transition-all duration-300
                min-w-[280px] sm:min-w-[320px] lg:min-w-0 snap-center
                ${activeIndex === index 
                  ? 'bg-blue-600 shadow-lg shadow-blue-500/20 lg:translate-x-2' 
                  : 'bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-700/50 border border-transparent hover:border-blue-500/20'}
              `}
            >
              <div className="w-14 h-14 lg:w-20 lg:h-20 shrink-0 rounded-xl lg:rounded-2xl overflow-hidden relative">
                <img 
                  src={article.cover_image || article.social_image || article.user.profile_image_90} 
                  className="w-full h-full object-cover"
                  alt=""
                />
                {activeIndex === index && (
                  <div className="absolute inset-0 bg-blue-600/40 flex items-center justify-center">
                    <Zap className="w-5 h-5 lg:w-6 lg:h-6 text-white fill-current animate-pulse" />
                  </div>
                )}
              </div>
              
              <div className="flex flex-col justify-center min-w-0 flex-1">
                <span className={`text-[9px] lg:text-[10px] font-black uppercase tracking-widest mb-0.5 lg:mb-1 ${activeIndex === index ? 'text-white/80' : 'text-blue-600'}`}>
                  #{article.tags.split(",")[0]}
                </span>
                <h4 className={`font-bold text-xs lg:text-sm line-clamp-2 leading-tight ${activeIndex === index ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                  {article.title}
                </h4>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 0.6; }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 1s ease-out forwards; }
        .animate-fade-in-up { animation: fade-in-up 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
        
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { 
          background: rgba(0, 0, 0, 0.03); 
          border-radius: 10px;
          margin: 5px 0;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb { 
          background: rgba(59, 130, 246, 0.4); 
          border-radius: 10px; 
          border: 2px solid transparent;
          background-clip: content-box;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(59, 130, 246, 0.8); }
      `}</style>
    </section>
  );
};

export default FeaturedNewsCarousel;
