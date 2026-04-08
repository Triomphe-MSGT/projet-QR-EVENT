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
  const [dateFilter, setDateFilter] = useState(null); // null | 'today' | 'tomorrow' | 'week' | 'month'
  const [featuredIndex, setFeaturedIndex] = useState(0);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  const [liveNews, setLiveNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const scrollRef = useRef(null);

  // Auto-scroll logic (Horizontal scroll on all devices)
  useEffect(() => {
    let scrollInterval;
    if (!newsLoading && scrollRef.current && liveNews.length > 0) {
      // Small adjustment to avoid smooth scrolling conflicts if any
      if (scrollRef.current.style) {
         scrollRef.current.style.scrollBehavior = 'auto';
      }
      
      scrollInterval = setInterval(() => {
        if (scrollRef.current && !scrollRef.current.matches(':hover') && !scrollRef.current.matches(':active')) {
          scrollRef.current.scrollLeft += 1;
          
          if (scrollRef.current.scrollLeft >= (scrollRef.current.scrollWidth - scrollRef.current.clientWidth) / 2) {
            scrollRef.current.scrollLeft = 0;
          }
        }
      }, 30); // 1px every 30ms
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

  // --- Filtering helpers ---
  const getDateFilteredEvents = (evtList) => {
    if (!dateFilter || !evtList) return evtList;
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000 - 1);
    const tomorrowStart = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
    const tomorrowEnd = new Date(tomorrowStart.getTime() + 24 * 60 * 60 * 1000 - 1);
    const weekEnd = new Date(todayStart.getTime() + 7 * 24 * 60 * 60 * 1000);
    const monthEnd = new Date(todayStart.getFullYear(), todayStart.getMonth() + 1, todayStart.getDate());
    return evtList.filter(e => {
      const d = new Date(e.startDate || e.date);
      if (dateFilter === 'today') return d >= todayStart && d <= todayEnd;
      if (dateFilter === 'tomorrow') return d >= tomorrowStart && d <= tomorrowEnd;
      if (dateFilter === 'week') return d >= todayStart && d <= weekEnd;
      if (dateFilter === 'month') return d >= todayStart && d <= monthEnd;
      return true;
    });
  };

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
        <section className={`relative overflow-hidden font-sans ${isMobile ? 'pt-16 pb-4 bg-white' : 'pt-40 pb-20 md:pt-60 md:pb-72 bg-gradient-to-tr from-sky-100 via-white to-blue-50'}`}>
          
          {!isMobile && (
            <>
              {/* Saturated Decorative Elements for Desktop */}
              <div className="absolute -top-32 -right-32 w-[900px] h-[900px] bg-sky-400/20 blur-[180px] rounded-full -z-10 animate-pulse hidden md:block"></div>
              <div className="absolute bottom-0 -left-24 w-[700px] h-[700px] bg-blue-300/30 blur-[150px] rounded-full -z-10 hidden md:block"></div>
            </>
          )}

          <div className={`max-w-[1800px] mx-auto ${isMobile ? 'px-3' : 'px-4 sm:px-6 md:px-8'}`}>
            {isMobile ? (
              /* ======================================================
                 MOBILE VIEW: NOUVELLE STRUCTURE REDESSINÉE
                 1. Salutation
                 2. Barre recherche + bouton filtre (inline)
                 3. Filtres date rapides
                 4. Événement vedette avec flèches
                 5. Liste 10 événements (desc gauche, image droite)
                 6. Bouton "Plus d'événements"
                 ====================================================== */
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">

                {/* ---- 1. Salutation ---- */}
                {(() => {
                   const today = new Date().toDateString();
                   const lastSeen = localStorage.getItem('last_greeting_date');
                   const shouldShow = lastSeen !== today;
                   if (!shouldShow) return null;
                   localStorage.setItem('last_greeting_date', today);
                   const displayName = user?.nom || user?.firstName || user?.name || "Invité";
                   return (
                    <div className="flex items-center justify-between px-1 pt-2">
                      <div className="space-y-0.5">
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Content de vous revoir !</p>
                        <h1 className="text-xl font-black text-slate-900 tracking-tight">Bonjour, <span className="text-orange-500">{displayName}</span> !</h1>
                      </div>
                      <Link to={token ? "/user-profile" : "/login"} className="w-11 h-11 rounded-2xl bg-slate-50 border border-slate-100 p-1 shrink-0">
                        <div className="w-full h-full rounded-xl overflow-hidden relative flex items-center justify-center bg-gradient-to-br from-orange-400 to-amber-600">
                          {(user?.image || user?.profilePicture) ? (
                            <img src={`${STATIC_BASE_URL}/${user?.image || user?.profilePicture}`} className="w-full h-full object-cover" alt="Profile" loading="lazy" decoding="async" onError={(e) => { e.target.style.display = 'none'; }} />
                          ) : null}
                          <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-black italic pointer-events-none">{displayName.charAt(0).toUpperCase()}</span>
                        </div>
                      </Link>
                    </div>
                   );
                })()}

                {/* ---- 2. Barre de recherche + bouton Filtre côte à côte ---- */}
                <form onSubmit={handleSearch} className="flex items-center gap-2">
                  <div className="flex-1 flex items-center gap-2 bg-slate-100 rounded-2xl px-3 py-2.5">
                    <Search className="w-4 h-4 text-orange-500 flex-shrink-0" />
                    <input
                      type="text"
                      placeholder="Rechercher un événement..."
                      className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none text-slate-700 font-semibold placeholder:text-slate-400 text-[13px]"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Link
                    to="/filters"
                    className="w-11 h-11 bg-slate-900 rounded-2xl flex items-center justify-center shrink-0 active:scale-95 transition-transform shadow-md"
                  >
                    <Filter size={18} className="text-white" />
                  </Link>
                </form>

                {/* ---- 3. Filtres date rapides ---- */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                  {[
                    { key: 'month', label: 'Ce mois' },
                    { key: 'week',  label: 'Cette semaine' },
                    { key: 'today', label: "Aujourd'hui" },
                    { key: 'tomorrow', label: 'Demain' },
                  ].map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => setDateFilter(prev => prev === key ? null : key)}
                      className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wide flex-shrink-0 transition-all active:scale-95 border ${
                        dateFilter === key
                          ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-200'
                          : 'bg-white text-slate-500 border-slate-200'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {/* ---- 4. Événement vedette avec flèches de navigation ---- */}
                {(() => {
                  const featuredPool = events
                    ?.filter(e => {
                      const isUpcoming = new Date(e.startDate) >= new Date().setHours(0,0,0,0);
                      const categoryMatch = selectedCategory === "Tout" || e.category?.name === selectedCategory;
                      return isUpcoming && categoryMatch;
                    })
                    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

                  const filtered = getDateFilteredEvents(featuredPool) || [];
                  const safeIndex = Math.min(featuredIndex, Math.max(0, filtered.length - 1));
                  const featuredEvent = filtered[safeIndex];

                  if (eventsLoading) return <div className="w-full aspect-[16/9] bg-slate-100 rounded-3xl animate-pulse" />;
                  if (!filtered.length) return null;

                  return (
                    <div className="relative">
                      {/* Card cliquable */}
                      <div
                        onClick={() => navigate(`/events/${featuredEvent._id}`)}
                        className="relative w-full aspect-[16/9] rounded-3xl overflow-hidden shadow-xl group active:scale-[0.99] transition-transform cursor-pointer"
                      >
                        {featuredEvent.coverImage || featuredEvent.imageUrl ? (
                          <img
                            src={featuredEvent.coverImage || featuredEvent.imageUrl}
                            alt={featuredEvent.title || featuredEvent.name}
                            loading="eager"
                            decoding="async"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-orange-500 via-orange-600 to-amber-700 flex items-center justify-center">
                            <span className="text-white font-black text-7xl drop-shadow-2xl opacity-40 italic">
                              {(featuredEvent.title || featuredEvent.name || "E").charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                        {/* Badge */}
                        <div className="absolute top-4 left-4">
                          <span className="px-3 py-1 bg-red-600 text-white text-[8px] font-black uppercase tracking-widest rounded-full shadow">
                            À L'Affiche
                          </span>
                        </div>

                        {/* Indicateur pagination */}
                        {filtered.length > 1 && (
                          <div className="absolute top-4 right-4 flex gap-1">
                            {filtered.slice(0, Math.min(5, filtered.length)).map((_, i) => (
                              <div key={i} className={`h-1.5 rounded-full transition-all ${ i === safeIndex ? 'w-5 bg-white' : 'w-1.5 bg-white/40'}`} />
                            ))}
                          </div>
                        )}

                        {/* Infos */}
                        <div className="absolute bottom-4 left-4 right-4 space-y-2">
                          <h2 className="text-xl font-black text-white uppercase tracking-tight leading-tight line-clamp-2">
                            {featuredEvent.title || featuredEvent.name}
                          </h2>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-300">
                              <Calendar size={11} className="text-orange-400" />
                              <span>{new Date(featuredEvent.startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            </div>
                            <span className="px-4 py-1.5 bg-white text-slate-900 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg">
                              Voir l'événement
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Flèches de navigation */}
                      {filtered.length > 1 && (
                        <>
                          <button
                            onClick={() => setFeaturedIndex(i => (i - 1 + filtered.length) % filtered.length)}
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform z-10"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                          </button>
                          <button
                            onClick={() => setFeaturedIndex(i => (i + 1) % filtered.length)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform z-10"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                          </button>
                        </>
                      )}
                    </div>
                  );
                })()}

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
            SECTION 2: LISTE DES ÉVÉNEMENTS
            ========================================== */}
        <section className={`relative overflow-hidden bg-gradient-to-b from-sky-50/50 via-white to-white ${ isMobile ? 'py-5' : 'py-20 md:py-32' }`}>
          <div className={`max-w-[1900px] mx-auto ${ isMobile ? 'px-3' : 'px-4 sm:px-6 md:px-8' }`}>

            {isMobile ? (
              /* ======= MOBILE : affichage instantané (pas de Reveal) ======= */
              <>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Événements à venir</p>
                  <Link to="/events" className="text-[11px] font-black text-orange-500 uppercase tracking-wide">Voir tout →</Link>
                </div>

                <div className="space-y-3">
                  {eventsLoading ? (
                    [1,2,3,4,5,6].map((idx) => (
                      <div key={idx} className="h-24 bg-white border border-slate-100 animate-pulse rounded-2xl" />
                    ))
                  ) : (() => {
                    const baseFiltered = events
                      ?.filter(ev => {
                        const isUpcoming = new Date(ev.startDate || ev.date) >= new Date().setHours(0,0,0,0);
                        const categoryMatch = selectedCategory === "Tout" || ev.category?.name === selectedCategory;
                        return isUpcoming && categoryMatch;
                      })
                      .sort((a, b) => new Date(a.startDate || a.date) - new Date(b.startDate || b.date));

                    const filteredByDate = getDateFilteredEvents(baseFiltered);
                    const sliced = filteredByDate?.slice(0, 10);

                    if (!sliced?.length) return (
                      <div className="py-16 text-center bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                        <div className="max-w-xs mx-auto space-y-4">
                          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto text-slate-300"><Sparkles size={32} /></div>
                          <p className="text-slate-500 font-medium italic">Plus d'événements bientôt disponibles...</p>
                        </div>
                      </div>
                    );

                    return (
                      <>
                        {sliced.map((event, idx) => (
                          <div
                            key={event._id || idx}
                            onClick={() => navigate(`/events/${event._id}`)}
                            className="group bg-white rounded-2xl flex gap-3 shadow-[0_1px_6px_rgba(0,0,0,0.05)] border border-slate-100 active:scale-[0.98] transition-all overflow-hidden p-3 hp-card-enter"
                            style={{ animationDelay: `${idx * 30}ms` }}
                          >
                            {/* Gauche : image */}
                            <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-slate-100 relative self-center">
                              {event.coverImage || event.imageUrl ? (
                                <img
                                  src={event.coverImage || event.imageUrl}
                                  className="w-full h-full object-cover"
                                  alt={event.title}
                                  loading="lazy"
                                  decoding="async"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
                                  <span className="text-white font-black text-3xl drop-shadow">
                                    {(event.title || event.name || "E").charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Droite : description */}
                            <div className="flex-1 flex flex-col justify-between min-w-0 py-0.5">
                              <div className="space-y-1">
                                <span className="px-2 py-0.5 bg-orange-50 text-orange-600 text-[8px] font-black uppercase rounded-md border border-orange-100 tracking-wider inline-block">
                                  {event.category?.name || "Événement"}
                                </span>
                                <h3 className="text-[14px] font-black text-slate-800 line-clamp-2 leading-tight">
                                  {event.title || event.name}
                                </h3>
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500">
                                    <Calendar size={11} className="text-orange-500 flex-shrink-0" strokeWidth={2.5} />
                                    <span>{new Date(event.startDate || event.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500">
                                    <MapPin size={11} className="text-blue-500 flex-shrink-0" strokeWidth={2.5} />
                                    <span className="truncate">{event.location || event.city || "Lieu à confirmer"}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-[11px] font-black text-slate-700">
                                  {event.price > 0 ? `${event.price.toLocaleString()} FCFA` : 'Gratuit'}
                                </span>
                                <span className="px-3 py-1 bg-slate-900 text-white rounded-lg text-[9px] font-black uppercase tracking-widest">
                                  Réserver
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* Bouton "Plus d'événements" */}
                        {filteredByDate && filteredByDate.length > 10 ? (
                          <div className="pt-2 pb-4">
                            <Link to="/events" className="w-full flex items-center justify-center gap-2 py-3.5 bg-slate-900 text-white rounded-2xl font-black text-[13px] uppercase tracking-widest active:scale-[0.98] transition-transform shadow-lg">
                              <span>Plus d'événements</span>
                              <ArrowRight size={16} />
                            </Link>
                          </div>
                        ) : (
                          <div className="pt-2 pb-4">
                            <Link to="/events" className="w-full flex items-center justify-center gap-2 py-3 bg-slate-50 border border-slate-200 text-slate-600 rounded-2xl font-bold text-[12px] active:scale-[0.98] transition-transform">
                              <span>Voir tous les événements</span>
                              <ArrowRight size={14} />
                            </Link>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>

                {/* Keyframe pour stagger rapide */}
                <style>{`
                  @keyframes hpCardEnter {
                    from { opacity: 0; transform: translateY(8px); }
                    to { opacity: 1; transform: translateY(0); }
                  }
                  .hp-card-enter { animation: hpCardEnter 0.2s ease-out both; }
                `}</style>
              </>
            ) : (
              /* ======= DESKTOP : Reveal animé classique ======= */
              <>
                <Reveal direction="up">
                  <div className="flex flex-col md:flex-row items-center md:items-end justify-between mb-12 md:mb-20 gap-6 text-center md:text-left">
                    <div className="space-y-4">
                      <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium text-slate-500 tracking-tight leading-tight">
                        Événements récemment ajoutés <br className="hidden sm:block" />
                        <span className="text-orange-500">Actualités</span>.
                      </h2>
                    </div>
                    <Link to="/events" className="group flex justify-center items-center gap-3 px-6 md:px-8 py-3.5 md:py-4 bg-white border border-slate-200 text-slate-500 rounded-2xl font-bold hover:bg-slate-50 transition-all hover:shadow-lg w-full md:w-auto">
                      Tout explorer
                      <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </Reveal>

                <Reveal direction="up" delay={200}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 md:gap-8">
                    {eventsLoading ? (
                      [1,2,3,4,5].map((idx) => (
                        <div key={idx} className="h-[480px] bg-white border border-slate-100 animate-pulse rounded-3xl" />
                      ))
                    ) : (() => {
                      const baseFiltered = events
                        ?.filter(ev => {
                          const isUpcoming = new Date(ev.startDate || ev.date) >= new Date().setHours(0,0,0,0);
                          const categoryMatch = selectedCategory === "Tout" || ev.category?.name === selectedCategory;
                          return isUpcoming && categoryMatch;
                        })
                        .sort((a, b) => new Date(a.startDate || a.date) - new Date(b.startDate || b.date))
                        ?.slice(0, 5);

                      if (!baseFiltered?.length) return (
                        <div className="col-span-full py-16 text-center bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                          <div className="max-w-xs mx-auto space-y-4">
                            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto text-slate-300"><Sparkles size={32} /></div>
                            <p className="text-slate-500 font-medium italic">Plus d'événements bientôt disponibles...</p>
                          </div>
                        </div>
                      );

                      return baseFiltered.map((event, idx) => (
                        <div
                          key={event._id || idx}
                          className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_4px_6px_-2px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] transition-all duration-500 hover:-translate-y-2 flex flex-col mx-auto w-full max-w-[280px] md:max-w-none"
                          style={{ contentVisibility: 'auto' }}
                        >
                          <div className="h-40 md:h-60 overflow-hidden relative bg-slate-100 flex items-center justify-center">
                            {event.coverImage || event.imageUrl ? (
                              <img src={event.coverImage || event.imageUrl} alt={event.title || event.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
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
                              <h3 className="text-sm md:text-lg font-medium text-slate-500 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">{event.title}</h3>
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
                                <span className="text-base md:text-xl font-medium text-slate-500">{event.price > 0 ? `${event.price.toLocaleString()} F` : "Gratuit"}</span>
                              </div>
                              <button onClick={() => navigate(`/events/${event._id}`)} className="px-4 py-2 bg-slate-900 text-white text-[10px] md:text-xs font-bold rounded-lg md:rounded-xl hover:bg-blue-600 transition-all shadow-md active:scale-95">Réserver</button>
                            </div>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </Reveal>
              </>
            )}

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
