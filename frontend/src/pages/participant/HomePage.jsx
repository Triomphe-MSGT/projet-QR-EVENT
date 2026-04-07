import React, { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import MainLayout from "../../components/layout/MainLayout";
import { QrCode, Search, MapPin, Calendar, ArrowRight, Sparkles,
  Zap,
  Globe,
  Settings,
  User as UserIcon,
  Plus,
  Mail,
  MessageCircle,
  Smartphone,
  Filter
} from "lucide-react";
import { useEvents } from "../../hooks/useEvents";
import { useUserProfile } from "../../hooks/useUserProfile";
import { useCategories } from "../../hooks/useCategories";
import Reveal from "../../components/ui/Reveal";
import { API_BASE_URL } from "../../slices/axiosInstance";

// Configuration de l'URL de base pour les fichiers statiques
const STATIC_BASE_URL = API_BASE_URL.replace("/api", "");

const HomePage = () => {
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const { data: user } = useUserProfile({ enabled: !!token });
  const { data: events, isLoading: eventsLoading } = useEvents();
  const { data: categories } = useCategories();
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Tout");
  const [dateQuery, setDateQuery] = useState("");

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  const [liveNews, setLiveNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const scrollRef = useRef(null);

  // Auto-scroll logic (Desktop: Horizontal | Mobile: Vertical)
  useEffect(() => {
    let scrollInterval;
    if (!newsLoading && scrollRef.current) {
      scrollInterval = setInterval(() => {
        if (scrollRef.current && !scrollRef.current.matches(':hover')) {
          if (isMobile) {
            // Vertical scroll for mobile list
            scrollRef.current.scrollTop += 0.5;
            if (scrollRef.current.scrollTop >= (scrollRef.current.scrollHeight - scrollRef.current.clientHeight) / 2) {
              scrollRef.current.scrollTop = 0;
            }
          } else {
            // Horizontal scroll for desktop marquee
            scrollRef.current.scrollLeft += 0.5;
            if (scrollRef.current.scrollLeft >= (scrollRef.current.scrollWidth - scrollRef.current.clientWidth) / 2) {
              scrollRef.current.scrollLeft = 0;
            }
          }
        }
      }, 30); // 0.5px every 30ms -> super slow and smooth
    }
    return () => clearInterval(scrollInterval);
  }, [newsLoading, liveNews, isMobile]);

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
    if (searchQuery) params.append("query", searchQuery);
    if (locationQuery) params.append("city", locationQuery);
    navigate(`/events?${params.toString()}`);
  };


  return (
    <MainLayout noPadding>
      <div className="min-h-screen">
        
        {/* ==========================================
            SECTION 1: HERO (ACCUEIL & RECHERCHE)
            ========================================== */}
        {/* ==========================================
            SECTION 1: HERO (ACCUEIL & RECHERCHE)
            ========================================== */}
        <section className={`relative overflow-hidden font-sans ${isMobile ? 'pt-20 pb-10 bg-white' : 'pt-40 pb-20 md:pt-60 md:pb-72 bg-gradient-to-tr from-sky-100 via-white to-blue-50'}`}>
          
          {!isMobile && (
            <>
              {/* Saturated Decorative Elements for Desktop */}
              <div className="absolute -top-32 -right-32 w-[900px] h-[900px] bg-sky-400/20 blur-[180px] rounded-full -z-10 animate-pulse hidden md:block"></div>
              <div className="absolute bottom-0 -left-24 w-[700px] h-[700px] bg-blue-300/30 blur-[150px] rounded-full -z-10 hidden md:block"></div>
            </>
          )}

          <div className="max-w-[1800px] mx-auto px-4 sm:px-6 md:px-8">
            {isMobile ? (
              /* --- MOBILE VIEW: YOUTUBE STYLE IMMERSIVE HERO --- */
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                 {/* 0. Greeting Header (Mobile Only) */}
                {(() => {
                   const today = new Date().toDateString();
                   const lastSeen = localStorage.getItem('last_greeting_date');
                   const shouldShow = lastSeen !== today;
                   
                   if (!shouldShow) return null;

                   // Set it as seen for today
                   localStorage.setItem('last_greeting_date', today);

                   const displayName = user?.nom || user?.firstName || user?.name || "Invité";

                   return (
                    <div className="flex items-center justify-between px-1">
                      <div className="space-y-0.5">
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Content de vous revoir !</p>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Bonjour, <span className="text-orange-500">{displayName}</span> !</h1>
                      </div>
                      <Link to={token ? "/user-profile" : "/login"} className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 p-1 shrink-0">
                        <div className="w-full h-full rounded-xl overflow-hidden relative flex items-center justify-center bg-gradient-to-br from-orange-400 to-amber-600">
                          {(user?.image || user?.profilePicture) ? (
                            <img 
                              src={`${STATIC_BASE_URL}/${user?.image || user?.profilePicture}`} 
                              className="w-full h-full object-cover" 
                              alt="Profile" 
                              loading="lazy"
                              decoding="async"
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          ) : null}
                          <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-black italic pointer-events-none">
                            {displayName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </Link>
                    </div>
                   );
                })()}
                {/* Category Chips Scroll (Top) */}
                <div className="flex gap-2.5 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 sticky top-0 bg-white/95 backdrop-blur-md z-30 py-2 border-b border-slate-50">
                  <Link 
                    to="/filters" 
                    className="px-4 py-2 bg-white border border-slate-200 text-slate-500 rounded-full flex items-center gap-2 flex-shrink-0 active:scale-95 transition-transform"
                  >
                    <Filter size={12} className="text-orange-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Filtres</span>
                  </Link>
                  
                  <div className="w-[1px] h-8 bg-slate-100 self-center mx-1 flex-shrink-0" />

                  <button 
                    onClick={() => setSelectedCategory("Tout")}
                    className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex-shrink-0 transition-all active:scale-95 ${selectedCategory === "Tout" ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-100 text-slate-500'}`}
                  >
                    Tout
                  </button>
                  {categories?.map((cat, idx) => (
                    <button 
                      key={cat._id || cat.id || idx} 
                      onClick={() => setSelectedCategory(cat.name)}
                      className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex-shrink-0 transition-all active:scale-95 ${selectedCategory === cat.name ? 'bg-orange-500 text-white shadow-lg' : 'bg-slate-100 text-slate-500 hover:bg-orange-50 hover:text-orange-600'}`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>

                {/* Featured Content Card - Most Imminent Event */}
                {(() => {
                  const upcomingEvents = events?.filter(e => {
                    const isUpcoming = new Date(e.startDate) >= new Date().setHours(0,0,0,0);
                    const categoryMatch = selectedCategory === "Tout" || e.category?.name === selectedCategory;
                    return isUpcoming && categoryMatch;
                  }).sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
                  const featuredEvent = upcomingEvents?.[0];

                  if (eventsLoading) return <div className="w-full aspect-[16/9] bg-slate-100 rounded-[2.5rem] animate-pulse"></div>;
                  if (!featuredEvent) return null;

                  return (
                    <div 
                      onClick={() => navigate(`/events/${featuredEvent._id}`)}
                      className="relative w-full aspect-[16/9] rounded-[2.5rem] overflow-hidden shadow-2xl group active:scale-[0.98] transition-transform"
                    >
                      {featuredEvent.coverImage || featuredEvent.imageUrl ? (
                        <img 
                          src={featuredEvent.coverImage || featuredEvent.imageUrl} 
                          alt="Featured" 
                          loading="eager" // Hero image should load fast
                          decoding="async"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-orange-500 via-orange-600 to-amber-700 flex items-center justify-center">
                          <span className="text-white font-black text-8xl drop-shadow-2xl opacity-40 italic">
                            {(featuredEvent.title || featuredEvent.name || "E").charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
                      
                      <div className="absolute top-5 left-5 flex gap-2">
                         <span className="px-3 py-1 bg-red-600 text-white text-[8px] font-black uppercase tracking-widest rounded-full shadow-lg">
                            À L'Affiche
                         </span>
                      </div>

                      <div className="absolute bottom-6 left-6 right-6 space-y-3">
                         <h2 className="text-2xl font-black text-white uppercase tracking-tighter leading-tight italic">
                           {featuredEvent.title || featuredEvent.name}
                         </h2>
                         <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-300">
                               <Calendar size={12} className="text-orange-500" />
                               <span>{new Date(featuredEvent.startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
                            </div>
                            <button className="px-5 py-2 bg-white text-slate-900 rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl">
                               Vivre l'Expérience
                            </button>
                         </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Search Bar - Integrated & Mobile Optimized */}
                <form 
                  onSubmit={handleSearch}
                  className="bg-slate-50 p-1.5 rounded-[2.5rem] border border-slate-100 flex flex-col gap-1 shadow-inner"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex-1 flex items-center px-4 py-2 bg-white rounded-full shadow-sm">
                      <Search className="w-4 h-4 text-orange-400 mr-2 flex-shrink-0" />
                      <input 
                        type="text" 
                        placeholder="Chercher une expérience..." 
                        className="w-full border-none bg-transparent focus:ring-0 focus:outline-none text-slate-600 font-bold placeholder:text-slate-400 text-xs"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 flex items-center px-4 py-2 bg-white rounded-full shadow-sm">
                        <MapPin className="w-4 h-4 text-blue-400 mr-2 flex-shrink-0" />
                        <input 
                          type="text" 
                          placeholder="Où ? (Ville, Quartier...)" 
                          className="w-full border-none bg-transparent focus:ring-0 focus:outline-none text-slate-600 font-bold placeholder:text-slate-400 text-xs"
                          value={locationQuery}
                          onChange={(e) => setLocationQuery(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform shrink-0">
                       <ArrowRight size={16} />
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* --- DESKTOP VIEW: ORIGINAL SOPHISTICATED HERO --- */
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24 items-center">
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

                  <form 
                    onSubmit={handleSearch}
                    className="bg-white/80 p-2 md:p-3 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl shadow-orange-900/5 border border-white flex flex-col md:flex-row items-stretch md:items-center gap-2 md:gap-3 backdrop-blur-xl"
                  >
                    <div className="flex-1 flex items-center px-4 md:px-6 border-b md:border-b-0 md:border-r border-slate-100/80">
                      <Search className="w-5 h-5 text-orange-400 mr-2 md:mr-3 flex-shrink-0" />
                      <input 
                        type="text" 
                        placeholder="Quel événement ?" 
                        className="w-full h-12 md:h-14 border-none border-transparent focus:border-transparent focus:ring-0 focus:outline-none outline-none text-slate-500 font-medium placeholder:text-slate-400 bg-transparent text-sm md:text-base"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <div className="flex-1 flex items-center px-4 md:px-6">
                      <MapPin className="w-5 h-5 text-orange-400 mr-2 md:mr-3 flex-shrink-0" />
                      <input 
                        type="text" 
                        placeholder="Ville ou Lieu" 
                        className="w-full h-12 md:h-14 border-none border-transparent focus:border-transparent focus:ring-0 focus:outline-none outline-none text-slate-500 font-medium placeholder:text-slate-400 bg-transparent text-sm md:text-base"
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

                  <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-10 pt-2 sm:pt-4 justify-center lg:justify-start">
                    <div className="flex -space-x-3">
                      {[1,2,3,4].map(i => (
                        <div key={i} className="w-10 h-10 md:w-12 md:h-12 rounded-full border-4 border-white bg-slate-100 overflow-hidden shadow-sm">
                          <img src={`https://i.pravatar.cc/100?img=${i+30}`} alt="User" loading="lazy" decoding="async" />
                        </div>
                      ))}
                    </div>
                    <p className="text-xs sm:text-sm font-medium text-slate-400">
                      <span className="text-slate-500 font-black">+2,000 organisateurs</span> utilisent QR EVENT
                    </p>
                  </div>
                </div>
                </Reveal>

                {!isMobile && (
                  <Reveal direction="right" delay={200}>
                    <div className="relative flex justify-center items-center">
                      <div className="absolute w-[400px] h-[400px] bg-orange-200/5 blur-[120px] rounded-full pointer-events-none"></div>
                      <img 
                        src="/assets/hero_picture.png" 
                        alt="QR Event Experience" 
                        loading="eager"
                        decoding="async"
                        className="relative z-10 w-full max-w-xl mx-auto object-contain animate-slow-beat drop-shadow-[0_20px_40px_rgba(0,0,0,0.08)]" 
                      />
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
                )}
              </div>
            )}
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
               
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium text-slate-500 tracking-tight leading-tight">
                  Événements récemment ajoutés <br className="hidden sm:block" /> 
                  <span className="text-orange-500">Actualités</span>.
                </h2>
              </div>
              <Link 
                to="/events" 
                className="group flex justify-center items-center gap-3 px-6 md:px-8 py-3.5 md:py-4 bg-white border border-slate-200 text-slate-500 rounded-2xl font-bold hover:bg-slate-50 transition-all hover:shadow-lg w-full md:w-auto"
              >
                Tout explorer
                <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            </Reveal>

            <Reveal direction="up" delay={200}>
              <div className={isMobile ? "space-y-4" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 md:gap-8"}>
                {eventsLoading ? (
                  [1, 2, 3, 4, 5].map((idx) => (
                    <div key={idx} className={isMobile ? "h-28 bg-white border border-slate-100 animate-pulse rounded-2xl" : "h-[480px] bg-white border border-slate-100 animate-pulse rounded-3xl"}></div>
                  ))
                ) : events?.filter(ev => {
                    const isUpcoming = new Date(ev.startDate || ev.date) >= new Date().setHours(0,0,0,0);
                    const categoryMatch = selectedCategory === "Tout" || ev.category?.name === selectedCategory;
                    return isUpcoming && categoryMatch;
                  }).length > 0 ? (
                  events
                    .filter(ev => {
                      const isUpcoming = new Date(ev.startDate || ev.date) >= new Date().setHours(0,0,0,0);
                      const categoryMatch = selectedCategory === "Tout" || ev.category?.name === selectedCategory;
                      return isUpcoming && categoryMatch;
                    })
                    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
                    .slice(0, 5)
                    .map((event, idx) => (
                      isMobile ? (
                        /* Mobile Premium Card */
                        <div 
                          key={event._id || idx} 
                          onClick={() => navigate(`/events/${event._id}`)} 
                          className="group bg-white p-4 rounded-[1.5rem] flex gap-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-slate-100 active:scale-[0.98] transition-all"
                        >
                          <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 bg-slate-100 flex items-center justify-center relative">
                            {event.coverImage || event.imageUrl ? (
                              <img src={event.coverImage || event.imageUrl} className="w-full h-full object-cover" alt={event.title} loading="lazy" decoding="async" />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center">
                                <span className="text-white font-black text-4xl drop-shadow-md">
                                  {(event.title || event.name || "E").charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                            <div className="absolute top-1 right-1 px-2 py-1 bg-white/95 backdrop-blur-md rounded-lg text-[9px] font-black text-slate-500 shadow-sm border border-slate-200">
                              {event.price > 0 ? `${event.price.toLocaleString()} F` : 'GRATUIT'}
                            </div>
                          </div>

                          <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
                            <div className="space-y-1.5 text-left">
                               <span className="px-2 py-0.5 bg-orange-50 text-orange-600 text-[8px] font-black uppercase rounded-md border border-orange-100 tracking-wider inline-block">
                                 {event.category?.name || "Événement"}
                               </span>
                               <h3 className="text-[15px] font-black text-slate-500 truncate leading-tight">
                                 {event.title || event.name}
                               </h3>
                               <div className="flex flex-col gap-1">
                                 <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 text-left">
                                    <Calendar size={12} className="text-orange-500" strokeWidth={3} />
                                    <span>{new Date(event.startDate || event.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}</span>
                                 </div>
                                 <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 text-left">
                                    <MapPin size={12} className="text-blue-500" strokeWidth={3} />
                                    <span className="truncate">{event.location || event.city || "Abidjan, CI"}</span>
                                 </div>
                               </div>
                            </div>
                            
                            <div className="flex items-center justify-end mt-2">
                               <div className="p-1 px-3 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest active:bg-orange-600">
                                  Réserver
                               </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Desktop Grid Card */
                        <div 
                          key={event._id || idx} 
                          className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_4px_6px_-2px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] transition-all duration-500 hover:-translate-y-2 flex flex-col mx-auto w-full max-w-[280px] md:max-w-none"
                          style={{ contentVisibility: 'auto' }}
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
                              <h3 className="text-sm md:text-lg font-medium text-slate-500 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
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
                                <span className="text-base md:text-xl font-medium text-slate-500">
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
                      )
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
        <section className="py-20 md:py-40 relative overflow-hidden bg-slate-50 border-y border-slate-100">
          <div className="max-w-[1800px] mx-auto px-4 sm:px-6 md:px-8">
            <div className="flex flex-col lg:grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
              
              {/* 1. Header (Mobile Only) */}
              <div className="lg:hidden text-center space-y-4 mb-8">
                <Reveal direction="up">
                  <h2 className="text-4xl font-black leading-[1.1] text-slate-500 tracking-tight">
                    L'innovation au service de <br/>
                    <span className="text-orange-500">votre événement.</span>
                  </h2>
                  <p className="text-slate-500 text-lg max-w-lg mx-auto leading-relaxed">
                    Nous remplaçons les files d'attente interminables par une solution intelligente et instantanée.
                  </p>
                </Reveal>
              </div>

              {/* 2. Visual Side (Middle on Mobile, Left Column on Desktop) */}
              <div className="w-full lg:order-1 relative">
                <Reveal direction="left">
                  <div className="absolute inset-0 bg-gradient-to-tr from-orange-300/30 to-blue-300/30 blur-3xl rounded-full -z-10 transform scale-110"></div>
                  <div className="bg-white p-5 sm:p-10 rounded-[3rem] shadow-2xl border border-white/50 relative overflow-hidden group">
                    <img src="./assets/picture_of_choose.png" alt="Expérience QR Check-in" loading="lazy" decoding="async" className="w-full max-w-sm lg:max-w-lg mx-auto object-contain drop-shadow-2xl group-hover:scale-105 transition-transform duration-700" />
                    {/* Floating Info Tag on Mobile */}
                    <div className="absolute bottom-6 left-6 right-6 bg-slate-900/90 backdrop-blur-xl p-4 rounded-2xl border border-white/10 lg:hidden text-left">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white">
                             <Zap size={20} />
                          </div>
                          <p className="text-white text-xs font-bold leading-tight">Scanner Ultra-Rapide <br/><span className="text-white/50 font-normal text-[10px]">Moins de 1s par billet</span></p>
                       </div>
                    </div>
                  </div>
                </Reveal>
              </div>

              {/* 3. Content Side (Bottom on Mobile, Right Column on Desktop) */}
              <div className="w-full lg:order-2 space-y-10 lg:space-y-12">
                <div className="hidden lg:block space-y-6">
                  <Reveal direction="right">
                    <h2 className="text-5xl lg:text-7xl font-black leading-[1.1] text-slate-500 tracking-tight">
                      L'innovation au service de <br className="hidden lg:block"/>
                      <span className="text-orange-500">votre événement.</span>
                    </h2>
                    <p className="text-lg lg:text-xl text-slate-500 max-w-xl leading-relaxed font-medium">
                      Nous remplaçons les files d'attente interminables et la billetterie complexe par une solution intelligente, sécurisée et instantanée.
                    </p>
                  </Reveal>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:gap-10">
                  {[
                    {
                      icon: QrCode,
                      title: "Billets QR 100% Numériques",
                      desc: "Fini le papier. Recevez un QR code unique infalsifiable directement sur votre smartphone.",
                      color: "text-blue-500",
                      bg: "bg-blue-50"
                    },
                    {
                      icon: Zap,
                      title: "Check-in Ultra Rapide",
                      desc: "Un scan prend moins d'une seconde. Fluidifiez les entrées et éliminez les attentes.",
                      color: "text-orange-500",
                      bg: "bg-orange-50"
                    }
                  ].map((item, idx) => (
                    <Reveal key={idx} direction="up" delay={200 + (idx * 100)}>
                      <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6 lg:gap-8 group">
                        <div className={`w-16 h-16 shrink-0 ${item.bg} ${item.color} rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform`}>
                          <item.icon size={32} strokeWidth={2.5} />
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-2xl lg:text-3xl font-black text-slate-500">{item.title}</h3>
                          <p className="text-base lg:text-lg text-slate-500 leading-relaxed font-medium">{item.desc}</p>
                        </div>
                      </div>
                    </Reveal>
                  ))}
                </div>

                <div className="pt-6 text-center lg:text-left">
                  <Reveal direction="up" delay={500}>
                    <button onClick={() => navigate('/events')}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-10 py-5 bg-slate-900 text-white rounded-2xl lg:rounded-[2rem] font-black text-lg hover:bg-slate-800 transition-all shadow-[0_20px_40px_-10px_rgba(15,23,42,0.3)] hover:-translate-y-1 group"
                    >
                      Explorer les Événements
                      <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </Reveal>
                </div>
              </div>
              
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
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium text-slate-500 tracking-tight">
                <span className="text-orange-500">Restez Informé.</span> <br className="hidden sm:block"/>
                Actualités Tech & IT
              </h2>
              <p className="text-slate-500 text-sm md:text-lg max-w-xl">
                Découvrez les derniers articles et événements technologiques en direct.
              </p>
            </div>
            </Reveal>

            <Reveal direction="up" delay={200}>
            {isMobile ? (
               <div 
                 ref={scrollRef}
                 className="space-y-4 px-2 h-[500px] overflow-y-auto no-scrollbar scroll-smooth"
                 style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
               >
                 {newsLoading ? (
                   [1, 2, 3].map(i => <div key={i} className="h-28 bg-slate-50 rounded-2xl animate-pulse" />)
                 ) : liveNews.length > 0 ? (
                   [...liveNews, ...liveNews].map((news, idx) => (
                     <a 
                       key={`${news.id}-${idx}`} 
                       href={news.url} 
                       target="_blank" 
                       rel="noopener noreferrer"
                       className="group/card bg-white p-4 rounded-[1.5rem] flex gap-4 shadow-sm border border-slate-100 active:scale-[0.98] transition-all"
                     >
                       <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 bg-slate-100 flex items-center justify-center relative">
                         <img 
                           src={news.cover_image || news.social_image || "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=500&q=60"} 
                           alt={news.title}
                           className="w-full h-full object-cover transition-transform group-hover/card:scale-105"
                         />
                       </div>
                       <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
                         <div className="space-y-1.5 text-left">
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[8px] font-black uppercase rounded-md border border-blue-100 tracking-wider inline-block">
                               Tech News
                            </span>
                            <h3 className="text-[14px] font-black text-slate-500 line-clamp-2 leading-tight">
                              {news.title}
                            </h3>
                         </div>
                         <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 mt-2">
                            <div className="flex items-center gap-1"><Calendar size={12} className="text-orange-500" /><span>{new Date(news.published_at).toLocaleDateString()}</span></div>
                            <div className="flex items-center gap-1 text-orange-500 underline decoration-orange-500/30"><span>Détails</span></div>
                         </div>
                       </div>
                     </a>
                   ))
                 ) : (
                   <div className="text-center py-10 text-slate-400 italic text-xs">Aucune actualité disponible</div>
                 )}
               </div>
            ) : (
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
                          <div className="absolute top-4 left-4 px-3 py-1 bg-white/95 backdrop-blur-md rounded-xl shadow-sm text-[9px] md:text-[10px] font-black uppercase text-slate-500 border border-slate-200">
                            {news.published_at ? new Date(news.published_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : "À venir"}
                          </div>
                        </div>
                        <div className="p-5 md:p-6 flex-1 flex flex-col">
                          <h3 className="text-base md:text-lg font-medium text-slate-500 mb-2 line-clamp-2 group-hover/card:text-blue-600 transition-colors">
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
            )}
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
                onClick={() => navigate('/createevent')}
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
