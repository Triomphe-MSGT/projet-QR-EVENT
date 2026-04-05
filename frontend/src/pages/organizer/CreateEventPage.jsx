import React, { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCategories } from "../../services/categoryService";
import {
  useCreateEvent,
  useUpdateEvent,
  useEventDetails,
} from "../../hooks/useEvents";
import MainLayout from "../../components/layout/MainLayout";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Loader2, 
  MapPin, 
  ChevronRight,
  ArrowLeft,
  QrCode,
  Users,
  Lock,
  Zap,
  Globe,
  Image as ImageIcon,
  CheckCircle2,
  Calendar,
  Clock,
  Search,
  Plus
} from "lucide-react";

const cameroonianCities = [
  "Yaoundé", "Douala", "Garoua", "Bamenda", "Maroua", "Bafoussam", 
  "Ngaoundéré", "Bertoua", "Ebolowa", "Buea", "Kumba", "Nkongsamba", 
  "Limbe", "Edéa", "Kribi", "Dschang", "Foumban", "Mbouda", "Sangmélima", 
  "Bafang", "Bafia", "Kousséri", "Guider", "Meiganga", "Yagoua", "Tiko", 
  "Mbalmayo", "Kumbo", "Wum", "Akonolinga", "Eséka", "Mamfé", "Obala",
].sort();

const EventForm = () => {
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

  const [citySearch, setCitySearch] = useState("");
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const cityDropdownRef = useRef(null);

  const { data: categories, isLoading: isLoadingCategories } = useQuery({ 
    queryKey: ["categories"], 
    queryFn: getCategories 
  });

  const createEventMutation = useCreateEvent();
  const updateEventMutation = useUpdateEvent();

  const [step, setStep] = useState(1);
  const [showChoiceModal, setShowChoiceModal] = useState(!isEditMode && !searchParams.get("visibility"));

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

  const nextStep = () => {
    if (step === 1 && (!formData.name || !formData.category || !formData.description)) {
      alert("Veuillez remplir l'identité.");
      return;
    }
    if (step === 2 && (!formData.startDate || (!formData.city && formData.format !== "En ligne"))) {
      alert("Veuillez remplir l'emplacement (choisissez une ville ou entrez la vôtre).");
      return;
    }
    setStep(prev => prev + 1);
  };

  const prevStep = () => setStep(prev => prev - 1);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.startDate || !formData.city || !formData.category || !formData.description) {
      alert("Veuillez remplir tous les champs obligatoires (*)");
      return;
    }
    const dataToSend = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key === "category" && typeof formData.category === "object" && formData.category !== null) {
        dataToSend.append("category", formData.category.id);
      } else if (key === "image" && formData.image) {
        dataToSend.append("image", formData.image);
      } else {
        dataToSend.append(key, formData[key]);
      }
    });

    if (isEditMode) {
      updateEventMutation.mutate({ id: eventIdToEdit, formData: dataToSend }, {
        onSuccess: () => navigate("/dashboard"),
        onError: (error) => alert(`Erreur: ${error.response?.data?.error || error.message}`),
      });
    } else {
      createEventMutation.mutate(dataToSend, {
        onSuccess: () => navigate("/dashboard"),
        onError: (error) => alert(`Erreur: ${error.response?.data?.error || error.message}`),
      });
    }
  };

  const filteredCities = cameroonianCities.filter(c => 
    c.toLowerCase().includes(citySearch.toLowerCase())
  );

  const handleCitySelect = (city) => {
    setFormData(p => ({ ...p, city }));
    setCitySearch(city);
    setShowCityDropdown(false);
  };

  const handleCustomCity = () => {
    if (citySearch.trim()) {
      setFormData(p => ({ ...p, city: citySearch }));
      setShowCityDropdown(false);
    }
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

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex flex-col justify-center items-center h-[60vh]">
          <Loader2 className="w-10 h-10 animate-spin text-orange-600 mb-4" />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Préparation...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Studio Interface (Compact One-Screen) */}
      <div className="bg-slate-50 md:h-[calc(100vh-64px)] flex flex-col items-center justify-center py-4 px-4 overflow-hidden">
        <div className="w-full max-w-4xl bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden flex flex-col max-h-full transition-all">
          
          {/* Header */}
          <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-white shrink-0">
             <div className="flex items-center gap-4">
               <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400">
                  <ArrowLeft size={20} />
               </button>
               <h2 className="text-xl font-black text-gray-900 tracking-tight tracking-tighter">Event Studio <span className="text-orange-600">Beta</span></h2>
             </div>
             
             <div className="flex items-center gap-3">
               {[1, 2, 3].map((s) => (
                 <div key={s} className={`w-12 h-1.5 rounded-full transition-all duration-500 scale-x-100 ${step >= s ? "bg-orange-500" : "bg-slate-100"}`} />
               ))}
               <span className="ml-2 text-[10px] font-black text-orange-600 uppercase tracking-widest">Step {step}/3</span>
             </div>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto p-8 md:p-12 custom-scrollbar">
            <form onSubmit={(e) => e.preventDefault()} className="h-full">
              
              {step === 1 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                   <div className="space-y-1">
                      <h3 className="text-2xl font-black text-gray-900">Fondations du <span className="text-orange-600 underline decoration-4 decoration-orange-100 underline-offset-4">projet</span></h3>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Identité visuelle & conceptuelle</p>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest ml-1">Définition du titre *</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Que se passe-t-il ?" className="w-full px-6 py-5 bg-slate-50 border-2 border-transparent focus:border-orange-500 rounded-2xl outline-none font-bold text-gray-900 shadow-sm transition-all" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest ml-1">Catégorie thématique *</label>
                        <select name="category" value={formData.category} onChange={handleChange} className="w-full px-6 py-5 bg-slate-50 border-2 border-transparent focus:border-orange-500 rounded-2xl outline-none font-bold text-gray-900 appearance-none cursor-pointer shadow-sm">
                          <option value="">Sélectionner</option>
                          {categories?.map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.emoji} {cat.name}</option>
                          ))}
                        </select>
                      </div>
                   </div>
                   <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest ml-1">Présentation narrative *</label>
                      <textarea name="description" value={formData.description} onChange={handleChange} rows="4" className="w-full px-6 py-5 bg-slate-50 border-2 border-transparent focus:border-orange-500 rounded-[1.5rem] outline-none font-bold text-gray-900 shadow-sm resize-none" placeholder="Donnez envie à votre audience..." />
                   </div>
                </div>
              )}

              {/* Step 2: Logistique (THE REVOLUTIONARY CITY SOLUTION) */}
              {step === 2 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                   <div className="space-y-1">
                      <h3 className="text-2xl font-black text-gray-900">Emplacement & <span className="text-orange-600">Tempo</span></h3>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Liberté totale géographique</p>
                   </div>
                   
                   <div className="flex gap-4 p-2 bg-slate-100 rounded-[1.25rem]">
                      {["Présentiel", "En ligne"].map((f) => (
                        <button key={f} type="button" onClick={() => setFormData(p => ({ ...p, format: f }))} className={`flex-1 py-4 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.format === f ? "bg-white text-orange-600 shadow-md scale-[1.02]" : "text-slate-400 hover:text-gray-900"}`}>{f}</button>
                      ))}
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Searchable / Manual City Input */}
                      <div className="space-y-3 relative" ref={cityDropdownRef}>
                         <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest ml-1">Ville (Sélectionnez ou Tapez) *</label>
                         <div className="relative">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
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
                              className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-transparent focus:border-orange-500 rounded-2xl outline-none font-bold text-gray-900 shadow-sm disabled:opacity-40" 
                            />
                         </div>
                         
                         {showCityDropdown && formData.format !== "En ligne" && (
                           <div className="absolute z-50 left-0 right-0 top-full mt-2 bg-white rounded-3xl shadow-2xl border border-slate-100 max-h-60 overflow-y-auto custom-scrollbar p-2 animate-in fade-in zoom-in-95 duration-200">
                             {filteredCities.length > 0 ? (
                               filteredCities.map((c) => (
                                 <button 
                                  key={c} 
                                  onClick={() => handleCitySelect(c)}
                                  className="w-full text-left px-6 py-4 hover:bg-orange-50 rounded-2xl font-bold text-gray-700 transition-colors flex items-center justify-between group"
                                 >
                                   {c}
                                   <ChevronRight size={14} className="text-slate-300 group-hover:text-orange-600 transition-colors" />
                                 </button>
                               ))
                             ) : (
                               <div className="p-4 text-center space-y-4">
                                  <p className="text-[11px] font-bold text-slate-400">Cette ville n'est pas dans notre liste de suggestions...</p>
                                  <button 
                                    onClick={handleCustomCity}
                                    className="w-full py-4 bg-orange-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-orange-600/20 flex items-center justify-center gap-2"
                                  >
                                    <Plus size={14} /> Confirmer "{citySearch}"
                                  </button>
                               </div>
                             )}
                           </div>
                         )}
                      </div>

                      <div className="space-y-3">
                         <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest ml-1">Précision (Quartier/Lieu)</label>
                         <div className="relative">
                            <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                            <input type="text" name="neighborhood" value={formData.neighborhood} onChange={handleChange} disabled={formData.format === "En ligne"} placeholder="Ex: Akwa, Face Casino" className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-transparent focus:border-orange-500 rounded-2xl outline-none font-bold text-gray-900 shadow-sm disabled:opacity-40" />
                         </div>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                         <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest ml-1">Début du projet *</label>
                         <div className="relative">
                            <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                            <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-transparent focus:border-orange-500 rounded-2xl outline-none font-bold text-gray-900 shadow-sm" />
                         </div>
                      </div>
                      <div className="space-y-3">
                         <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest ml-1">Heure de lancement</label>
                         <div className="relative">
                            <Clock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                            <input type="time" name="time" value={formData.time} onChange={handleChange} className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-transparent focus:border-orange-500 rounded-2xl outline-none font-bold text-gray-900 shadow-sm" />
                         </div>
                      </div>
                   </div>
                </div>
              )}

              {/* Step 3: Finalisation */}
              {step === 3 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                   <div className="space-y-1">
                      <h3 className="text-2xl font-black text-gray-900">Diffusions & <span className="text-orange-600 underline underline-offset-8">Règles</span></h3>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Contrôle d'accès & Billetterie</p>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest ml-1">Prix par Ticket (FCFA) *</label>
                        <input type="number" name="price" value={formData.price} onChange={handleChange} className="w-full px-6 py-5 bg-slate-50 border-2 border-transparent focus:border-orange-500 rounded-2xl outline-none font-bold text-gray-900 text-xl shadow-sm" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest ml-1">Options Digitales</label>
                        <button type="button" onClick={() => setFormData(p => ({ ...p, qrOption: !p.qrOption }))} className={`w-full py-5 px-8 rounded-2xl flex items-center justify-between border-2 transition-all ${formData.qrOption ? "border-orange-500 bg-orange-50 text-orange-600 shadow-md" : "border-slate-100 text-slate-400 bg-slate-50"}`}>
                           <span className="text-xs font-black uppercase tracking-widest">Activer Scan QR</span>
                           <QrCode size={24} className={formData.qrOption ? "animate-pulse" : ""} />
                        </button>
                      </div>
                   </div>
                   <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest ml-1">Image Impactante (Couverture)</label>
                      <input type="file" id="cov" name="image" className="hidden" onChange={handleChange} accept="image/*" />
                      <label htmlFor="cov" className="flex flex-col items-center justify-center w-full h-44 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] cursor-pointer hover:bg-slate-100 transition-all overflow-hidden group border-spacing-4">
                        {formData.image ? <div className="text-center font-black text-orange-600 flex flex-col items-center gap-2"><CheckCircle2 size={32} /><span className="text-[10px] uppercase">{formData.image.name}</span></div> : 
                        <div className="text-center space-y-3">
                          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto text-slate-300 group-hover:text-orange-500 transition-all shadow-sm">
                            <ImageIcon size={28} />
                          </div>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cliquer pour importer</span>
                        </div>}
                      </label>
                   </div>
                </div>
              )}
            </form>
          </div>

          {/* Footer */}
          <div className="px-8 py-8 border-t border-slate-50 bg-white flex items-center gap-6 shrink-0">
             {step > 1 && (
               <button type="button" onClick={prevStep} className="flex-1 py-6 px-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-[12px] uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95">Précédent</button>
             )}
             
             {step < 3 ? (
               <button type="button" onClick={nextStep} className="flex-[2] py-6 px-10 bg-orange-600 text-white rounded-2xl font-black text-[12px] uppercase tracking-widest shadow-2xl shadow-orange-600/30 hover:bg-orange-700 transition-all flex items-center justify-center gap-3">
                 Continuer <ChevronRight size={18} />
               </button>
             ) : (
               <button onClick={handleSubmit} disabled={isSubmitting} className="flex-[2] py-6 px-10 bg-black text-white rounded-2xl font-black text-[12px] uppercase tracking-widest shadow-[0_20px_50px_rgba(0,0,0,0.2)] hover:scale-[1.02] active:scale-100 transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                 {isSubmitting ? <Loader2 size={24} className="animate-spin text-orange-500" /> : <Zap size={22} className="text-orange-500" />}
                 {isSubmitting ? "Lancement..." : isEditMode ? "Enregistrer les modifications" : "Lancer mon événement"}
               </button>
             )}
          </div>

        </div>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #F97316; }
      `}</style>
    </MainLayout>
  );
};

export default EventForm;
