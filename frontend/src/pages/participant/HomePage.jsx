import React, { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import { QrCode, Search, MapPin, Calendar, ArrowRight, Sparkles,
 Zap,
 Globe,
 Settings,
 User as UserIcon,
 Plus,
 Mail,
 MessageCircle,
 Smartphone
} from "lucide-react";
import { useEvents } from "../../hooks/useEvents";
import { useUserProfile } from "../../hooks/useUserProfile";
import { useCategories } from "../../hooks/useCategories";
import Reveal from "../../components/ui/Reveal";

const HomePage = () => {
  const navigate = useNavigate();
  const { data: user } = useUserProfile();
  const { data: events, isLoading: eventsLoading } = useEvents();
  const { data: categories } = useCategories();
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [dateQuery, setDateQuery] = useState("");
  
  const [liveNews, setLiveNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const scrollRef = useRef(null);

  // Auto-scroll logic that allows manual scrolling
  useEffect(() => {
    let scrollInterval;
    if (!newsLoading && scrollRef.current) {
      scrollInterval = setInterval(() => {
        if (scrollRef.current && !scrollRef.current.matches(':hover')) {
          scrollRef.current.scrollLeft += 0.5;
          // Reset scroll when reaching the halfway point (due to duplicated items array)
          if (scrollRef.current.scrollLeft >= (scrollRef.current.scrollWidth - scrollRef.current.clientWidth) / 2) {
            scrollRef.current.scrollLeft = 0;
          }
        }
      }, 30); // 0.5px every 30ms -> super slow and smooth
    }
    return () => clearInterval(scrollInterval);
  }, [newsLoading, liveNews]);

  // Fetch real-time tech events/news from DEV.to API
  useEffect(() => {
    fetch("https://dev.to/api/articles?tag=tech&per_page=10")
      .then(res => res.json())
      .then(data => {
        setLiveNews(data || []);
        setNewsLoading(false);
      })
      .catch(err => {
        console.error("Error fetching news API:", err);
        setNewsLoading(false);
      });
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.append("search", searchQuery);
    if (locationQuery) params.append("city", locationQuery);
    navigate(`/events?${params.toString()}`);
  };



  return (
    <MainLayout noPadding>
      <div className="min-h-screen">
        
        {/* ==========================================
            SECTION 1: HERO (ACCUEIL & RECHERCHE)
            ========================================== */}
        <section className="relative pt-40 pb-20 md:pt-60 md:pb-72 overflow-hidden font-sans bg-gradient-to-tr from-sky-100 via-white to-blue-50">
          {/* Saturated Decorative Elements for Depth */}
          <div className="absolute -top-32 -right-32 w-[900px] h-[900px] bg-sky-400/20 blur-[180px] rounded-full -z-10 animate-pulse hidden md:block"></div>
          <div className="absolute bottom-0 -left-24 w-[700px] h-[700px] bg-blue-300/30 blur-[150px] rounded-full -z-10 hidden md:block"></div>
          
          <div className="max-w-[1800px] mx-auto px-4 sm:px-6 md:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24 items-center">
            
            <Reveal direction="left">
            <div className="z-10 space-y-10 md:space-y-16">
              <div className="space-y-6 md:space-y-8 text-center lg:text-left">
                <h1 className="text-5xl md:text-5xl lg:text-7xl font-bold text-slate-500 leading-[1.05] tracking-tight">
                  Découvrez <br className="hidden sm:block" /> 
                  <span className="text-orange-500">Réservez</span> & Vivez.
                </h1>
                <p className="text-lg md:text-xl lg:text-2xl text-slate-500 font-medium max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                  L'excellence technologique au service de vos sorties. Simplifiez votre billetterie avec notre système QR ultra-rapide.
                </p>
              </div>

              {/* Pro Search Bar - Glassmorphism */}
              <form 
                onSubmit={handleSearch}
                className="bg-white/80 p-2 md:p-3 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl shadow-orange-900/5 border border-white flex flex-col md:flex-row items-stretch md:items-center gap-2 md:gap-3 backdrop-blur-xl"
              >
                <div className="flex-1 flex items-center px-4 md:px-6 border-b md:border-b-0 md:border-r border-slate-100/80">
                  <Search className="w-5 h-5 text-orange-400 mr-2 md:mr-3 flex-shrink-0" />
                  <input 
                    type="text" 
                    placeholder="Quel événement ?" 
                    className="w-full h-12 md:h-14 border-none border-transparent focus:border-transparent focus:ring-0 focus:outline-none outline-none text-slate-700 font-medium placeholder:text-slate-400 bg-transparent text-sm md:text-base"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex-1 flex items-center px-4 md:px-6">
                  <MapPin className="w-5 h-5 text-orange-400 mr-2 md:mr-3 flex-shrink-0" />
                  <input 
                    type="text" 
                    placeholder="Ville ou Lieu" 
                    className="w-full h-12 md:h-14 border-none border-transparent focus:border-transparent focus:ring-0 focus:outline-none outline-none text-slate-700 font-medium placeholder:text-slate-400 bg-transparent text-sm md:text-base"
                    value={locationQuery}
                    onChange={(e) => setLocationQuery(e.target.value)}
                  />
                </div>
                <button 
                  type="submit"
                  className="px-6 md:px-10 py-4 md:py-5 bg-orange-500 text-white font-black rounded-2xl md:rounded-3xl hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/20 active:scale-95 whitespace-nowrap text-sm md:text-base"
                >
                  Trouver
                </button>
              </form>

              {/* Social Proof */}
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-10 pt-2 sm:pt-4 justify-center lg:justify-start">
                <div className="flex -space-x-3">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-10 h-10 md:w-12 md:h-12 rounded-full border-4 border-white bg-slate-100 overflow-hidden shadow-sm">
                      <img src={`https://i.pravatar.cc/100?img=${i+30}`} alt="User" />
                    </div>
                  ))}
                </div>
                <p className="text-xs sm:text-sm font-medium text-slate-400">
                  <span className="text-slate-900 font-black">+2,000 organisateurs</span> utilisent QR EVENT
                </p>
              </div>
            </div>
            </Reveal>

            {/* Illustration Section - Minimal & Integrated */}
            <Reveal direction="right" delay={200}>
            <div className="relative flex justify-center items-center">
              {/* Only a very subtle glow to keep it 'pro' */}
              <div className="absolute w-[400px] h-[400px] bg-orange-200/5 blur-[120px] rounded-full pointer-events-none"></div>
              
              <img 
                src="/assets/hero_picture.png" 
                alt="QR Event Experience" 
                className="relative z-10 w-full max-w-xl mx-auto object-contain animate-slow-beat drop-shadow-[0_20px_40px_rgba(0,0,0,0.08)]" 
              />
              
              {/* Levitation Floating Icons - Placed Directly 'Over' the Screen Area */}
              <div className="absolute top-[53%] right-[50%] z-20 bg-white p-3.5 rounded-2xl shadow-xl border border-white/50 animate-levitate hidden xl:block" style={{ animationDelay: '0s' }}>
                  <Mail size={24} className="text-red-500" />
              </div>
              <div className="absolute top-[78%] right-[15%] z-20 bg-white p-3.5 rounded-2xl shadow-xl border border-white/50 animate-levitate hidden xl:block" style={{ animationDelay: '0.8s' }}>
                  <MessageCircle size={24} className="text-emerald-500" />
              </div>
              <div className="absolute bottom-[48%] right-[28%] z-20 bg-white p-3.5 rounded-2xl shadow-xl border border-white/50 animate-levitate hidden xl:block" style={{ animationDelay: '1.6s' }}>
                  <Smartphone size={24} className="text-blue-500" />
              </div>

              <div className="absolute top-[25%] left-[20%] z-20 bg-white p-3.5 rounded-2xl shadow-xl border border-white/50 animate-levitate hidden xl:block" style={{ animationDelay: '2.4s' }}>
                  <QrCode size={24} className="text-orange-500" />
              </div>
            </div>
            </Reveal>
          </div>
        </section>

        {/* ==========================================
            SECTION 2: DÉCOUVREZ LES DERNIERS ÉVÉNEMENTS
            ========================================== */}
        <section className="relative py-20 md:py-32 overflow-hidden bg-gradient-to-b from-sky-50/50 via-white to-white">
          <div className="max-w-[1900px] mx-auto px-4 sm:px-6 md:px-8">
            <Reveal direction="up">
            <div className="flex flex-col md:flex-row items-center md:items-end justify-between mb-12 md:mb-20 gap-6 text-center md:text-left">
              <div className="space-y-4">
               
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium text-slate-700 tracking-tight leading-tight">
                  Événements récemment ajoutés <br className="hidden sm:block" /> 
                  <span className="text-orange-500">Actualités</span>.
                </h2>
              </div>
              <Link 
                to="/events" 
                className="group flex justify-center items-center gap-3 px-6 md:px-8 py-3.5 md:py-4 bg-white border border-slate-200 text-slate-900 rounded-2xl font-bold hover:bg-slate-50 transition-all hover:shadow-lg w-full md:w-auto"
              >
                Tout explorer
                <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            </Reveal>

            <Reveal direction="up" delay={200}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 md:gap-8">
              {eventsLoading ? (
                [1, 2, 3, 4, 5].map((idx) => (
                  <div key={idx} className="h-[480px] bg-white border border-slate-100 animate-pulse rounded-3xl shadow-sm"></div>
                ))
              ) : events?.filter(ev => new Date(ev.startDate || ev.date) >= new Date().setHours(0,0,0,0)).length > 0 ? (
                events
                  .filter(ev => new Date(ev.startDate || ev.date) >= new Date().setHours(0,0,0,0))
                  .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
                  .slice(0, 5)
                  .map((event, idx) => (
                  <div 
                    key={event._id || idx} 
                    className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_4px_6px_-2px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] transition-all duration-500 hover:-translate-y-2 flex flex-col mx-auto w-full max-w-[280px] md:max-w-none"
                  >
                    <div className="h-40 md:h-60 overflow-hidden relative bg-slate-100 flex items-center justify-center">
                      {event.coverImage || event.imageUrl ? (
                        <img 
                          src={event.coverImage || event.imageUrl} 
                          alt={event.title || event.name} 
                          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-orange-500 to-amber-600 text-white font-black text-5xl md:text-6xl group-hover:scale-105 transition-transform duration-1000">
                          {(event.title || event.name)?.charAt(0).toUpperCase() || "?"}
                        </div>
                      )}
                      <div className="absolute top-4 left-4 px-3 md:px-4 py-1.5 md:py-2 bg-white/95 backdrop-blur-md rounded-xl text-[10px] font-black uppercase text-orange-600 shadow-sm border border-orange-50">
                        {event.category?.name || "Événement"}
                      </div>
                    </div>
                    
                    <div className="p-4 md:p-7 flex-1 flex flex-col justify-between">
                      <div className="space-y-3 md:space-y-4">
                        <h3 className="text-sm md:text-lg font-medium text-slate-900 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
                          {event.title}
                        </h3>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2.5 text-xs font-medium text-slate-400">
                            <Calendar size={14} className="text-blue-500 flex-shrink-0" />
                            <span>{new Date(event.startDate || event.date).toLocaleDateString("fr-FR", { day: 'numeric', month: 'long' })}</span>
                          </div>
                          <div className="flex items-center gap-2.5 text-xs font-medium text-slate-400">
                            <MapPin size={14} className="text-blue-500 flex-shrink-0" />
                            <span className="truncate">{event.location || event.city || "Lieu à confirmer"}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 md:pt-6 mt-4 md:mt-6 border-t border-slate-50">
                        <div className="flex flex-col">
                          <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Ticket dès</span>
                          <span className="text-base md:text-xl font-medium text-slate-900">
                            {event.price > 0 ? `${event.price.toLocaleString()} F` : "Gratuit"}
                          </span>
                        </div>
                        <button 
                          onClick={() => navigate(`/events/${event._id}`)}
                          className="px-4 py-2 bg-slate-900 text-white text-[10px] md:text-xs font-bold rounded-lg md:rounded-xl hover:bg-blue-600 transition-all shadow-md active:scale-95"
                        >
                          Réserver
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-20 text-center bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                  <div className="max-w-xs mx-auto space-y-4">
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto text-slate-300">
                      <Sparkles size={32} />
                    </div>
                    <p className="text-slate-500 font-medium italic">Plus d'événements bientôt disponibles...</p>
                  </div>
                </div>
              )}
            </div>
            </Reveal>
          </div>
        </section>

        {/* ==========================================
            SECTION 3: POURQUOI NOUS CHOISIR ? (QR TECH)
            ========================================== */}
        <section className="py-20 md:py-32 relative overflow-hidden bg-slate-50 border-y border-slate-100">
          <div className="max-w-[1800px] mx-auto px-4 sm:px-6 md:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              
              {/* Visual Side */}
              <Reveal direction="left">
              <div className="relative order-2 lg:order-1 mt-10 lg:mt-0">
                <div className="absolute inset-0 bg-gradient-to-tr from-orange-200/20 to-blue-200/20 blur-2xl lg:blur-3xl rounded-[2rem] lg:rounded-[3rem] -z-10 transform -rotate-6"></div>
                <div className="bg-white p-6 sm:p-8 md:p-12 rounded-[2rem] lg:rounded-[3rem] shadow-xl border border-slate-100">
                  <img src="./assets/picture_of_choose.png" alt="Expérience QR Check-in" className="w-full max-w-sm lg:max-w-lg mx-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-700" />
                </div>
              </div>
              </Reveal>

              {/* Content Side */}
              <Reveal direction="right" delay={200}>
              <div className="space-y-8 lg:space-y-10 order-1 lg:order-2 text-center lg:text-left">
                <div className="space-y-4 lg:space-y-6">
                  
                  <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium leading-[1.1] text-slate-700 tracking-tight">
                    L'innovation au service de <br className="hidden lg:block"/>
                    <span className="text-orange-500">votre événement.</span>
                  </h2>
                  <p className="text-base md:text-lg text-slate-500 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                    Nous remplaçons les files d'attente interminables et la billetterie complexe par une solution intelligente, sécurisée et instantanée.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="mt-1 w-12 h-12 flex-shrink-0 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center">
                      <QrCode size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-medium text-slate-900 mb-2">Billets QR 100% Numériques</h3>
                      <p className="text-slate-500">Fini le papier. Recevez un QR code unique infalsifiable directement sur votre smartphone.</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="mt-1 w-12 h-12 flex-shrink-0 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center">
                      <Zap size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-medium text-slate-900 mb-2">Check-in Ultra Rapide</h3>
                      <p className="text-slate-500">Un scan prend moins d'une seconde. Fluidifiez les entrées et éliminez complètement les files d'attente à la porte.</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button onClick={() => navigate('/events')}
                    className="group px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-500/20 flex items-center gap-3"
                  >
                    Voir comment ça marche
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
              </Reveal>
              
            </div>
          </div>
        </section>

        {/* ==========================================
            SECTION: ACTUALITÉS & INSPIRATIONS (LIVE API)
            ========================================== */}
        <section className="py-20 md:py-24 bg-white">
          <div className="max-w-[1800px] mx-auto px-4 sm:px-6 md:px-8">
            <Reveal direction="up">
            <div className="flex flex-col items-center md:items-start text-center md:text-left mb-12 md:mb-16 gap-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-600 rounded-lg text-xs font-bold uppercase tracking-wider">
                <Globe size={14} />
                En Temps Réel
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium text-slate-700 tracking-tight">
                <span className="text-orange-500">Restez Informé.</span> <br className="hidden sm:block"/>
                Actualités Tech & IT
              </h2>
              <p className="text-slate-500 text-sm md:text-lg max-w-xl">
                Découvrez les derniers articles et événements technologiques en direct.
              </p>
            </div>
            </Reveal>

            <Reveal direction="up" delay={200}>
            {/* Overflow hidden container for Marquee */}
            <div className="relative overflow-hidden group">
              
              {/* Fade masks for smooth edges */}
              <div className="absolute top-0 bottom-0 left-0 w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
              <div className="absolute top-0 bottom-0 right-0 w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>

              {newsLoading ? (
                <div className="flex gap-8 overflow-x-hidden no-scrollbar">
                  {[1, 2, 3, 4, 5].map((idx) => (
                    <div key={idx} className="w-[350px] shrink-0 h-80 bg-slate-50 animate-pulse rounded-3xl border border-slate-100"></div>
                  ))}
                </div>
              ) : liveNews.length > 0 ? (
                <div 
                  ref={scrollRef}
                  className="flex gap-4 sm:gap-6 md:gap-8 overflow-x-auto no-scrollbar pb-6 cursor-grab active:cursor-grabbing scroll-smooth"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }} // Inline fallback for hiding scrollbars
                >
                  {/* We duplicate the list for a seamless loop */}
                  {[...liveNews, ...liveNews].map((news, idx) => (
                    <a 
                      key={`${news.id}-${idx}`} 
                      href={news.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-[280px] sm:w-[320px] md:w-[350px] shrink-0 group/card bg-white rounded-3xl border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col"
                    >
                      <div className="h-40 md:h-48 bg-slate-100 relative overflow-hidden">
                        <img 
                          src={news.cover_image || news.social_image || "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=500&q=60"} 
                          alt={news.title}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-700"
                          onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=500&q=60" }}
                        />
                        <div className="absolute top-4 left-4 px-3 py-1 bg-white/95 backdrop-blur-md rounded-xl shadow-sm text-[9px] md:text-[10px] font-black uppercase text-slate-900 border border-slate-200">
                          {news.published_at ? new Date(news.published_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : "À venir"}
                        </div>
                      </div>
                      <div className="p-5 md:p-6 flex-1 flex flex-col">
                        <h3 className="text-base md:text-lg font-medium text-slate-900 mb-2 line-clamp-2 group-hover/card:text-blue-600 transition-colors">
                          {news.title}
                        </h3>
                        <p className="text-xs md:text-sm text-slate-500 line-clamp-3 mb-6 flex-1">
                          {news.description || "Découvrez cet article exclusif concernant l'industrie tech actuelle."}
                        </p>
                        <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between text-sm font-bold text-orange-500 group-hover/card:text-orange-600">
                          <span>Lire l'article</span>
                          <ArrowRight size={16} className="group-hover/card:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-3xl border border-dashed border-slate-200 w-full">
                  <Globe className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                  Impossible de charger le flux tech pour le moment.
                </div>
              )}
            </div>
            </Reveal>
          </div>
        </section>

        {/* ==========================================
            SECTION 4: CRÉATION & GESTION (POUR ORGA)
            ========================================== */}
        <section className="relative py-20 md:py-32 bg-slate-900 overflow-hidden">
          {/* Dark Mode Background Effects */}
          <div className="absolute top-0 right-0 w-[500px] md:w-[800px] h-[500px] md:h-[800px] bg-blue-600/10 blur-[100px] md:blur-[150px] rounded-full pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-orange-500/10 blur-[80px] md:blur-[120px] rounded-full pointer-events-none"></div>

          <div className="max-w-[1800px] mx-auto px-4 sm:px-6 md:px-8 relative z-10">
            <Reveal direction="scale">
            <div className="text-center space-y-4 md:space-y-6 mb-16 md:mb-24 max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-800 border border-slate-700 text-orange-400 rounded-full text-xs font-black uppercase tracking-widest shadow-sm">
                <Settings size={14} />
                Espace Organisateur
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-6xl font-medium tracking-tight text-white leading-tight">
                Créez, Vendez et Gérez <br className="hidden sm:block"/>
                <span className="text-blue-400">sans effort.</span>
              </h2>
              <p className="text-base md:text-xl text-slate-400 leading-relaxed px-4">
                Rejoignez les créateurs qui font confiance à notre Dashboard Pro pour piloter leurs événements et décupler leurs ventes.
              </p>
            </div>
            </Reveal>

            <Reveal direction="up" delay={300}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-12">
              {[
                { 
                  icon: Plus, 
                  title: "Création Express", 
                  desc: "Publiez votre événement, définissez vos places et commencez à vendre en moins de 3 minutes chrono.",
                  color: "bg-orange-500/20 text-orange-400",
                  border: "border-orange-500/20" 
                },
                { 
                  icon: Globe, 
                  title: "Vente en Ligne", 
                  desc: "Acceptez les paiements de vos participants via mobile money et carte bancaire en toute sécurité.",
                  color: "bg-blue-500/20 text-blue-400",
                  border: "border-blue-500/20" 
                },
                { 
                  icon: Zap, 
                  title: "Dashboard & Scan", 
                  desc: "Suivez vos ventes en temps réel et validez les billets à la porte instantanément avec notre scanner intégré.",
                  color: "bg-emerald-500/20 text-emerald-400",
                  border: "border-emerald-500/20" 
                },
              ].map((feature, i) => (
                <div key={i} className={`flex flex-col p-6 sm:p-8 md:p-10 rounded-3xl md:rounded-[2.5rem] bg-slate-800/50 backdrop-blur-sm border ${feature.border} hover:bg-slate-800 transition-colors group`}>
                  <div className={`w-14 h-14 md:w-20 md:h-20 rounded-2xl md:rounded-[1.5rem] ${feature.color} flex items-center justify-center mb-6 md:mb-8 transition-transform group-hover:scale-110 group-hover:-rotate-3`}>
                    <feature.icon className="w-7 h-7 md:w-10 md:h-10" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-medium text-white mb-2 md:mb-4">{feature.title}</h3>
                  <p className="text-sm md:text-lg text-slate-400 leading-relaxed outline-none">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Final CTA */}
            <div className="mt-16 md:mt-20 text-center">
              <button 
                onClick={() => navigate('/events/create')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 md:px-10 py-4 md:py-5 bg-orange-500 text-white rounded-2xl md:rounded-3xl font-bold text-base md:text-lg hover:bg-orange-600 transition-all shadow-[0_0_40px_-10px_rgba(249,115,22,0.5)] hover:shadow-orange-500/50 hover:-translate-y-1"
              >
                Créer Mon Événement
                <ArrowRight size={20} />
              </button>
            </div>
            </Reveal>
          </div>
        </section>

      </div>
    </MainLayout>
  );
};

export default HomePage;
