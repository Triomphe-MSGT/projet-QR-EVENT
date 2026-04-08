import React, { useState, useEffect, useRef, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getCategories, checkSimilarity, createCategory } from "../../services/categoryService";
import { 
  Zap, Calendar, MapPin, Clock, 
  Info, Image as ImageIcon, QrCode, 
  ChevronRight, Plus, Music, Utensils, 
  Film, Camera, Code, Dumbbell, 
  PartyPopper, Palette, Gamepad2, 
  Languages, GraduationCap, Heart, 
  Plane, ShoppingBag, Coffee, AlertCircle,
  CheckCircle2, X, Loader2, ArrowLeft, Lock, Search
} from "lucide-react";
import {
  useCreateEvent,
  useUpdateEvent,
  useEventDetails,
} from "../../hooks/useEvents";
import { useCities } from "../../hooks/useCities";
import MainLayout from "../../components/layout/MainLayout";
import { useNavigate, useLocation } from "react-router-dom";

const cameroonianCities = [
  "Yaoundé", "Douala", "Garoua", "Bamenda", "Maroua", "Bafoussam", 
  "Ngaoundéré", "Bertoua", "Ebolowa", "Buea", "Kumba", "Nkongsamba", 
  "Limbe", "Edéa", "Kribi", "Dschang", "Foumban", "Mbouda", "Sangmélima", 
  "Bafang", "Bafia", "Kousséri", "Guider", "Meiganga", "Yagoua", "Tiko", 
  "Mbalmayo", "Kumbo", "Wum", "Akonolinga", "Eséka", "Mamfé", "Obala",
].sort();

const CreateEventPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const eventIdToEdit = searchParams.get("edit");
  const initialVisibility = searchParams.get("visibility") || "public";
  const isEditMode = !!eventIdToEdit;

  const { data: existingEventData, isLoading: isLoadingEventDetails } = useEventDetails(eventIdToEdit);

  const [formData, setFormData] = useState({
    name: "",
    format: "Présentiel",
    visibility: initialVisibility,
    startDate: "",
    endDate: "",
    time: "",
    city: "",
    neighborhood: "",
    country: "Cameroun",
    description: "",
    price: "0",
    category: "",
    qrOption: false,
    image: null,
  });

  // Category creation state
  const [showCatModal, setShowCatModal] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatIcon, setNewCatIcon] = useState("Zap");
  const [similarCats, setSimilarCats] = useState([]);
  const [catLoading, setCatLoading] = useState(false);

  const LUCIDE_ICONS = [
    { name: "Music", icon: Music },
    { name: "Utensils", icon: Utensils },
    { name: "Film", icon: Film },
    { name: "Camera", icon: Camera },
    { name: "Code", icon: Code },
    { name: "Dumbbell", icon: Dumbbell },
    { name: "PartyPopper", icon: PartyPopper },
    { name: "Palette", icon: Palette },
    { name: "Gamepad2", icon: Gamepad2 },
    { name: "Languages", icon: Languages },
    { name: "GraduationCap", icon: GraduationCap },
    { name: "Heart", icon: Heart },
    { name: "Plane", icon: Plane },
    { name: "ShoppingBag", icon: ShoppingBag },
    { name: "Coffee", icon: Coffee },
    { name: "Zap", icon: Zap },
  ];

  const queryClient = useQueryClient();

  const handleCreateCategory = async (force = false) => {
    if (!newCatName.trim()) return;
    setCatLoading(true);
    try {
      if (!force) {
        const similar = await checkSimilarity(newCatName);
        if (similar && similar.length > 0) {
          setSimilarCats(similar);
          setCatLoading(false);
          return;
        }
      }
      
      const newCat = await createCategory({ 
        name: newCatName, 
        icon: newCatIcon 
      });
      
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
      setFormData(prev => ({ ...prev, category: newCat.id }));
      setShowCatModal(false);
      setNewCatName("");
      setSimilarCats([]);
    } catch (err) {
      alert(err.response?.data?.error || "Erreur création catégorie");
    } finally {
      setCatLoading(false);
    }
  };

  const [citySearch, setCitySearch] = useState("");
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const cityDropdownRef = useRef(null);

  const { data: categories, isLoading: isLoadingCategories } = useQuery({ 
    queryKey: ["categories"], 
    queryFn: getCategories 
  });

  const { data: dbCities } = useCities();
  const createEventMutation = useCreateEvent();
  const updateEventMutation = useUpdateEvent();

  useEffect(() => {
    if (isEditMode && existingEventData) {
      setFormData({
        name: existingEventData.name || "",
        format: existingEventData.format || "Présentiel",
        visibility: existingEventData.visibility || "public",
        startDate: existingEventData.startDate ? new Date(existingEventData.startDate).toISOString().split("T")[0] : "",
        endDate: existingEventData.endDate ? new Date(existingEventData.endDate).toISOString().split("T")[0] : "",
        time: existingEventData.time || "",
        city: existingEventData.city || "",
        neighborhood: existingEventData.neighborhood || "",
        country: existingEventData.country || "Cameroun",
        description: existingEventData.description || "",
        price: existingEventData.price?.toString() || "0",
        category: existingEventData.category?.id || existingEventData.category || "",
        qrOption: existingEventData.qrOption || false,
        image: null,
      });
      setCitySearch(existingEventData.city || "");
    }
  }, [isEditMode, existingEventData]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : type === "file" ? files[0] : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitting form...", formData);

    if (!formData.name || !formData.startDate || !formData.city || !formData.category || !formData.description) {
      alert("Veuillez remplir les informations essentielles.");
      return;
    }

    const dataToSend = new FormData();
    Object.keys(formData).forEach((key) => {
      // Nettoyage des valeurs nulles ou vides pour éviter d'envoyer la chaîne "null"
      if (formData[key] === null || formData[key] === undefined) {
        return;
      }

      if (key === "category") {
        const catId = typeof formData.category === "object" ? (formData.category._id || formData.category.id) : formData.category;
        dataToSend.append("category", catId);
      } else if (key === "image" && formData.image) {
        dataToSend.append("image", formData.image);
      } else {
        dataToSend.append(key, formData[key]);
      }
    });

    console.log("FormData prepared, calling mutation...");

    const mutationCallback = {
      onSuccess: () => {
        console.log("Success! Navigating to dashboard...");
        navigate("/dashboard");
      },
      onError: (error) => {
        console.error("Mutation error:", error);
        alert(`Erreur: ${error.response?.data?.error || error.response?.data?.message || error.message}`);
      },
    };

    if (isEditMode) {
      updateEventMutation.mutate({ id: eventIdToEdit, formData: dataToSend }, mutationCallback);
    } else {
      createEventMutation.mutate(dataToSend, mutationCallback);
    }
  };

  const allCities = useMemo(() => {
    const merged = [...cameroonianCities];
    if (dbCities) {
      dbCities.forEach(city => {
        if (!merged.map(c => c.toLowerCase()).includes(city.toLowerCase())) {
          merged.push(city);
        }
      });
    }
    return merged;
  }, [dbCities]);

  const filteredCities = allCities.filter(c => 
    c.toLowerCase().includes(citySearch.toLowerCase())
  );

  const handleCitySelect = (city) => {
    setFormData(p => ({ ...p, city }));
    setCitySearch(city);
    setShowCityDropdown(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(event.target)) {
        setShowCityDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isLoading = isLoadingCategories || (isEditMode && isLoadingEventDetails);
  const isSubmitting = createEventMutation.isPending || updateEventMutation.isPending;

  if (formData.visibility === "private") {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-8 bg-white">
          <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-sm">
             <Lock className="w-12 h-12 text-slate-300 animate-pulse" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-4 tracking-tight">
            FONCTIONNALITÉ EN COURS DE DÉVELOPPEMENT
          </h2>
          <p className="text-slate-400 font-medium max-w-md leading-relaxed">
            La création d'événements privés est une fonctionnalité premium qui sera bientôt disponible pour tous les organisateurs.
          </p>
          <button 
            onClick={() => navigate(-1)}
            className="mt-10 px-10 py-4 bg-orange-600 text-white rounded-2xl font-black text-[12px] uppercase tracking-widest shadow-xl shadow-orange-600/20 hover:bg-orange-700 transition-all active:scale-95"
          >
            Retour au Dashboard
          </button>
        </div>
      </MainLayout>
    );
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex flex-col justify-center items-center h-[60vh]">
          <Loader2 className="w-12 h-12 animate-spin text-orange-600 mb-6" />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 animate-pulse">Chargement intelligent...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="bg-slate-50/50 min-h-screen py-8 px-4">
        <div className="max-w-3xl mx-auto space-y-6">
          
          <div className="flex items-center justify-between bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate(-1)} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 border border-slate-100">
                <ArrowLeft size={20} />
              </button>
              <div>
                <h2 className="text-xl font-black text-slate-800 tracking-tight">
                  {isEditMode ? "Modifier" : "Créer"} <span className="text-orange-600">votre événement</span>
                </h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Public & Instantané</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600">
                  <Zap size={20} />
                </div>
                <h3 className="text-lg font-black text-slate-700 tracking-tight">Informations Générales</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nom de l'événement *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Ex: Festival de Musique" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 focus:border-orange-500 rounded-2xl outline-none font-bold text-slate-600 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Visibilité *</label>
                  <div className="flex gap-2">
                    {["public", "private"].map((v) => (
                      <button 
                        key={v}
                        type="button" 
                        onClick={() => setFormData(p => ({ ...p, visibility: v }))}
                        className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${formData.visibility === v ? "bg-slate-900 text-white border-slate-900 shadow-md" : "bg-slate-50 text-slate-400 border-slate-100"}`}
                      >
                         {v === 'public' ? 'Public' : 'Privé'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Catégorie *</label>
                    <button 
                      type="button" 
                      onClick={() => setShowCatModal(true)}
                      className="text-[10px] font-black text-orange-600 uppercase tracking-widest hover:underline flex items-center gap-1"
                    >
                      <Plus size={12} /> Nouvelle
                    </button>
                  </div>
                  <div className="relative">
                    <select name="category" value={formData.category} onChange={handleChange} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 focus:border-orange-500 rounded-2xl outline-none font-bold text-slate-600 appearance-none cursor-pointer">
                      <option value="">Sélectionner une catégorie</option>
                      {categories?.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.emoji || "✨"} {cat.name}</option>
                      ))}
                    </select>
                    <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none rotate-90" size={16} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Prix par Ticket (FCFA) *</label>
                  <input type="number" name="price" value={formData.price} onChange={handleChange} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 focus:border-orange-500 rounded-2xl outline-none font-bold text-slate-600 transition-all" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Description détaillée *</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows="4" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 focus:border-orange-500 rounded-[1.5rem] outline-none font-bold text-slate-600 resize-none" placeholder="Décrivez l'expérience unique que vous proposez..." />
              </div>
            </div>

            {/* Section 2: Logistique */}
            <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                  <MapPin size={20} />
                </div>
                <h3 className="text-lg font-black text-slate-700 tracking-tight">Date & Lieu</h3>
              </div>

              <div className="flex gap-4 p-2 bg-slate-50 rounded-2xl border border-slate-100">
                {["Présentiel", "En ligne"].map((f) => (
                  <button key={f} type="button" onClick={() => setFormData(p => ({ ...p, format: f }))} className={`flex-1 py-3 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.format === f ? "bg-white text-orange-600 shadow-sm border border-slate-100" : "text-slate-400 hover:text-slate-500"}`}>{f}</button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6" ref={cityDropdownRef}>
                <div className="space-y-2 relative">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Ville *</label>
                  <div className="relative">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                    <input 
                      type="text" 
                      value={citySearch} 
                      onChange={(e) => {
                        setCitySearch(e.target.value);
                        setFormData(p => ({ ...p, city: e.target.value }));
                        setShowCityDropdown(true);
                      }}
                      onFocus={() => setShowCityDropdown(true)}
                      disabled={formData.format === "En ligne"}
                      placeholder="Tapez le nom de votre ville..." 
                      className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 focus:border-orange-500 rounded-2xl outline-none font-bold text-slate-600 disabled:opacity-40" 
                    />
                  </div>
                  {showCityDropdown && formData.format !== "En ligne" && (
                    <div className="absolute z-50 left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 max-h-60 overflow-y-auto p-2 scrollbar-thin">
                      {filteredCities.map((c) => (
                        <button key={c} type="button" onClick={() => handleCitySelect(c)} className="w-full text-left px-5 py-3 hover:bg-slate-50 rounded-xl font-bold text-slate-600 transition-colors">{c}</button>
                      ))}
                      {citySearch && !cameroonianCities.map(c => c.toLowerCase()).includes(citySearch.toLowerCase()) && (
                        <button 
                          type="button" 
                          onClick={() => handleCitySelect(citySearch)} 
                          className="w-full text-left px-5 py-3 hover:bg-orange-50 rounded-xl font-bold text-orange-600 transition-all flex items-center gap-3 border-t border-slate-50 mt-1"
                        >
                          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                            <Plus size={14} />
                          </div>
                          <span>Utiliser "{citySearch}"</span>
                        </button>
                      )}
                      {filteredCities.length === 0 && !citySearch && (
                        <div className="px-5 py-8 text-center text-slate-400 text-xs italic">
                          Commencez à taper pour chercher ou ajouter une ville
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Quartier / Précision</label>
                  <input type="text" name="neighborhood" value={formData.neighborhood} onChange={handleChange} disabled={formData.format === "En ligne"} placeholder="Ex: Bastos" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 focus:border-orange-500 rounded-2xl outline-none font-bold text-slate-600 disabled:opacity-40" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Date *</label>
                  <div className="relative">
                    <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                    <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 focus:border-orange-500 rounded-2xl outline-none font-bold text-slate-600" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Heure</label>
                  <div className="relative">
                    <Clock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                    <input type="time" name="time" value={formData.time} onChange={handleChange} className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 focus:border-orange-500 rounded-2xl outline-none font-bold text-slate-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Ticketing & Image */}
            <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                  <QrCode size={20} />
                </div>
                <h3 className="text-lg font-black text-slate-700 tracking-tight">Billetterie & Visuel</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col justify-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Options d'accès</p>
                  <p className="text-xs font-bold text-slate-500 italic">Configurez le contrôle d'accès numérique pour vos participants.</p>
                </div>
                <div className="flex flex-col justify-end">
                  <button type="button" onClick={() => setFormData(p => ({ ...p, qrOption: !p.qrOption }))} className={`w-full py-4 px-6 rounded-2xl flex items-center justify-between border-2 transition-all ${formData.qrOption ? "border-orange-500 bg-orange-50 text-orange-600" : "border-slate-50 text-slate-400 bg-slate-50"}`}>
                    <span className="text-[10px] font-black uppercase tracking-widest">Activer Scan QR</span>
                    <CheckCircle2 size={24} className={formData.qrOption ? "text-orange-600" : "text-slate-200"} />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">L'image de couverture</label>
                <input type="file" id="cov" name="image" className="hidden" onChange={handleChange} accept="image/*" />
                <label htmlFor="cov" className="flex flex-col items-center justify-center w-full h-40 bg-slate-50 border-2 border-dashed border-slate-100 rounded-[2rem] cursor-pointer hover:bg-slate-100 transition-all overflow-hidden group">
                  {formData.image ? 
                    <div className="flex items-center gap-3 p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
                      <ImageIcon className="text-orange-600" size={24} />
                      <span className="text-[10px] font-black uppercase tracking-tighter text-slate-500 max-w-[200px] truncate">{formData.image.name}</span>
                      <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center"><CheckCircle2 size={14} /></div>
                    </div> : 
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 flex items-center justify-center text-slate-300 group-hover:text-orange-500 transition-all">
                        <ImageIcon size={24} />
                      </div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ajouter une image</span>
                    </div>
                  }
                </label>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex gap-4 pt-4">
              <button 
                type="submit" 
                disabled={isSubmitting} 
                className="flex-1 py-5 bg-black text-white rounded-3xl font-black text-[12px] uppercase tracking-widest shadow-2xl hover:scale-[1.02] active:scale-100 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 size={20} className="animate-spin text-orange-500" /> : <Zap size={20} className="text-orange-500" />}
                {isSubmitting ? "Lancement en cours..." : isEditMode ? "Sauvegarder les modifications" : "Lancer mon événement"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {showCatModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowCatModal(false)}></div>
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg p-8 md:p-10 shadow-2xl relative z-10 animate-in zoom-in-95 duration-300 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-8">
               <div className="flex items-center gap-3">
                  <div className="p-3 bg-orange-100 text-orange-600 rounded-2xl">
                     <Plus size={20} />
                  </div>
                  <h3 className="text-xl font-black text-slate-700 tracking-tight">Nouvelle Catégorie</h3>
               </div>
               <button onClick={() => setShowCatModal(false)} className="p-2 text-slate-300 hover:text-slate-500"><X size={24} /></button>
            </div>

            {similarCats.length > 0 ? (
              <div className="space-y-6">
                 <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex gap-3">
                    <AlertCircle className="text-amber-600 shrink-0" size={20} />
                    <div>
                       <p className="text-xs font-black text-amber-900 uppercase tracking-widest mb-1">Attention</p>
                       <p className="text-[11px] font-bold text-amber-700">Des catégories similaires existent déjà. Voulez-vous en utiliser une ?</p>
                    </div>
                 </div>
                 
                 <div className="space-y-3">
                    {similarCats.map(cat => (
                      <button 
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, category: cat.id }));
                          setShowCatModal(false);
                          setSimilarCats([]);
                        }}
                        className="w-full p-4 border border-slate-100 rounded-2xl flex items-center justify-between hover:border-orange-500 hover:bg-orange-50 transition-all font-bold text-slate-600 text-sm"
                      >
                        <span>{cat.emoji || "✨"} {cat.name}</span>
                        <CheckCircle2 size={16} className="text-orange-500" />
                      </button>
                    ))}
                 </div>

                 <button 
                    type="button"
                    onClick={() => handleCreateCategory(true)}
                    className="w-full py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-2 border-dashed border-slate-100 rounded-2xl hover:border-orange-200 hover:text-orange-500 transition-all"
                 >
                    Non, créer "{newCatName}" quand même
                 </button>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="space-y-4">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Nom de la catégorie</label>
                  <input 
                    type="text" 
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="Ex: Conférence, Sport..."
                    className="w-full px-6 py-5 bg-slate-50 border border-slate-100 focus:border-orange-500 rounded-2xl outline-none font-bold text-slate-600 transition-all"
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Choisir une Icône</label>
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                     {LUCIDE_ICONS.map((item) => (
                        <button
                          key={item.name}
                          type="button"
                          onClick={() => setNewCatIcon(item.name)}
                          className={`aspect-square flex items-center justify-center rounded-xl border transition-all ${
                            newCatIcon === item.name 
                            ? 'bg-orange-600 text-white border-orange-600 shadow-lg shadow-orange-600/20' 
                            : 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-white hover:border-orange-200'
                          }`}
                        >
                          <item.icon size={20} />
                        </button>
                      ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleCreateCategory(false)}
                  disabled={catLoading || !newCatName}
                  className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl shadow-xl hover:bg-orange-600 transition-all disabled:opacity-50 uppercase tracking-widest text-xs"
                >
                  {catLoading ? <Loader2 className="animate-spin mx-auto" /> : "Valider la catégorie"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default CreateEventPage;
