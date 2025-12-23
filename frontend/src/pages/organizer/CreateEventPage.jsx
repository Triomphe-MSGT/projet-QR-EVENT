import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCategories } from "../../services/categoryService";
import {
  useCreateEvent,
  useUpdateEvent,
  useEventDetails,
} from "../../hooks/useEvents";
import MainLayout from "../../components/layouts/MainLayout";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Loader2, 
  AlertTriangle, 
  Save, 
  PlusCircle, 
  MapPin, 
  Calendar, 
  Clock, 
  Tag, 
  Info, 
  Image as ImageIcon,
  Zap,
  Globe,
  Lock,
  ChevronRight,
  ArrowLeft,
  QrCode,
  Users
} from "lucide-react";
import Button from "../../components/ui/Button";

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

  const { data: categories, isLoading: isLoadingCategories, isError: isErrorCategories } = useQuery({ 
    queryKey: ["categories"], 
    queryFn: getCategories 
  });

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
      } else if (key !== "image") {
        dataToSend.append(key, formData[key]);
      }
    });

    if (isEditMode) {
      updateEventMutation.mutate({ id: eventIdToEdit, formData: dataToSend }, {
        onSuccess: () => {
          alert("Événement mis à jour avec succès !");
          navigate("/dashboard");
        },
        onError: (error) => alert(`Erreur: ${error.response?.data?.error || error.message}`),
      });
    } else {
      createEventMutation.mutate(dataToSend, {
        onSuccess: () => {
          alert("Événement créé avec succès !");
          navigate("/dashboard");
        },
        onError: (error) => alert(`Erreur: ${error.response?.data?.error || error.message}`),
      });
    }
  };

  const isLoading = isLoadingCategories || (isEditMode && isLoadingEventDetails);
  const isSubmitting = createEventMutation.isPending || updateEventMutation.isPending;

  const [showChoiceModal, setShowChoiceModal] = useState(!isEditMode && !searchParams.get("visibility"));

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex flex-col justify-center items-center h-[60vh] space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
          <p className="text-gray-500 font-medium animate-pulse">Préparation du formulaire...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Choice Modal Fallback */}
      {showChoiceModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 md:p-12 max-w-2xl w-full shadow-2xl border border-gray-100 dark:border-gray-700 animate-scale-up">
            <div className="text-center space-y-4 mb-10">
              <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                Quel type d'événement <br /> <span className="text-blue-600">souhaitez-vous créer ?</span>
              </h3>
              <p className="text-gray-500 dark:text-gray-400 font-medium">
                Choisissez la visibilité de votre événement.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button
                onClick={() => {
                  setFormData(prev => ({ ...prev, visibility: "public" }));
                  setShowChoiceModal(false);
                }}
                className="group p-8 bg-blue-50 dark:bg-blue-900/20 rounded-[2rem] border-2 border-transparent hover:border-blue-600 transition-all text-left"
              >
                <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Users className="w-7 h-7" />
                </div>
                <h4 className="text-xl font-black text-gray-900 dark:text-white mb-2">Événement Public</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                  Visible par tous les utilisateurs sur la plateforme.
                </p>
              </button>

              <button
                onClick={() => {
                  setFormData(prev => ({ ...prev, visibility: "private" }));
                  setShowChoiceModal(false);
                }}
                className="group p-8 bg-purple-50 dark:bg-purple-900/20 rounded-[2rem] border-2 border-transparent hover:border-purple-600 transition-all text-left"
              >
                <div className="w-14 h-14 bg-purple-600 text-white rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Lock className="w-7 h-7" />
                </div>
                <h4 className="text-xl font-black text-gray-900 dark:text-white mb-2">Événement Privé</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                  Uniquement accessible via un lien direct.
                </p>
              </button>
            </div>
            
            <button
              onClick={() => navigate(-1)}
              className="mt-10 w-full py-4 text-sm font-black text-gray-400 hover:text-gray-600 uppercase tracking-widest transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-10">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors font-bold text-sm uppercase tracking-widest"
            >
              <ArrowLeft className="w-4 h-4" /> Retour
            </button>
            <div className="flex items-center gap-3 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400 text-[10px] font-black tracking-widest uppercase border border-blue-100 dark:border-blue-800/50">
              <Zap className="w-4 h-4" /> {isEditMode ? "Mode Édition" : "Nouvel Événement"}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-[3rem] shadow-2xl shadow-blue-600/5 border border-gray-100 dark:border-gray-800 overflow-hidden">
            {/* Title Section */}
            <div className="p-8 md:p-12 border-b border-gray-50 dark:border-gray-800 bg-gradient-to-r from-blue-600/5 to-purple-600/5">
              <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tighter mb-4">
                {isEditMode ? "Modifier votre" : "Créer un"} <br />
                <span className="text-blue-600">événement mémorable</span>
              </h1>
              <p className="text-gray-500 dark:text-gray-400 font-medium max-w-xl">
                Remplissez les détails ci-dessous pour publier votre événement et commencer à recevoir des inscriptions.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-12">
              
              {/* Section 1: Informations Générales */}
              <div className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                    <Info className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Informations Générales</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nom de l'événement *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Ex: Gala de Charité 2024"
                      required
                      className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border-transparent focus:bg-white dark:focus:bg-gray-700 border-2 focus:border-blue-600 rounded-2xl transition-all outline-none font-bold text-gray-900 dark:text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Catégorie *</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                      className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border-transparent focus:bg-white dark:focus:bg-gray-700 border-2 focus:border-blue-600 rounded-2xl transition-all outline-none font-bold text-gray-900 dark:text-white appearance-none"
                    >
                      <option value="">Sélectionner une catégorie</option>
                      {categories?.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.emoji} {cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Description détaillée *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="5"
                    required
                    placeholder="Décrivez votre événement en quelques lignes..."
                    className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border-transparent focus:bg-white dark:focus:bg-gray-700 border-2 focus:border-blue-600 rounded-2xl transition-all outline-none font-bold text-gray-900 dark:text-white resize-none"
                  />
                </div>
              </div>

              {/* Section 2: Lieu & Date */}
              <div className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-purple-600">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Lieu & Date</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Format *</label>
                    <div className="flex gap-2 p-1 bg-gray-50 dark:bg-gray-800 rounded-2xl">
                      {["Présentiel", "En ligne"].map((f) => (
                        <button
                          key={f}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, format: f }))}
                          className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            formData.format === f 
                              ? "bg-white dark:bg-gray-700 text-blue-600 shadow-sm" 
                              : "text-gray-400 hover:text-gray-600"
                          }`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Ville *</label>
                    <select
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      disabled={formData.format === "En ligne"}
                      className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border-transparent focus:bg-white dark:focus:bg-gray-700 border-2 focus:border-blue-600 rounded-2xl transition-all outline-none font-bold text-gray-900 dark:text-white disabled:opacity-50"
                    >
                      <option value="">Choisir une ville</option>
                      {cameroonianCities.map((ville) => (
                        <option key={ville} value={ville}>{ville}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Quartier</label>
                    <input
                      type="text"
                      name="neighborhood"
                      value={formData.neighborhood}
                      onChange={handleChange}
                      disabled={formData.format === "En ligne"}
                      placeholder="Ex: Bastos"
                      className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border-transparent focus:bg-white dark:focus:bg-gray-700 border-2 focus:border-blue-600 rounded-2xl transition-all outline-none font-bold text-gray-900 dark:text-white disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Date de début *</label>
                    <div className="relative">
                      <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="date"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleChange}
                        required
                        className="w-full pl-14 pr-6 py-4 bg-gray-50 dark:bg-gray-800 border-transparent focus:bg-white dark:focus:bg-gray-700 border-2 focus:border-blue-600 rounded-2xl transition-all outline-none font-bold text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Date de fin</label>
                    <div className="relative">
                      <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="date"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleChange}
                        min={formData.startDate}
                        className="w-full pl-14 pr-6 py-4 bg-gray-50 dark:bg-gray-800 border-transparent focus:bg-white dark:focus:bg-gray-700 border-2 focus:border-blue-600 rounded-2xl transition-all outline-none font-bold text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Heure</label>
                    <div className="relative">
                      <Clock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="time"
                        name="time"
                        value={formData.time}
                        onChange={handleChange}
                        className="w-full pl-14 pr-6 py-4 bg-gray-50 dark:bg-gray-800 border-transparent focus:bg-white dark:focus:bg-gray-700 border-2 focus:border-blue-600 rounded-2xl transition-all outline-none font-bold text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Options & Visibilité */}
              <div className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center text-amber-600">
                    <Zap className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Options & Visibilité</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Visibilité de l'événement</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, visibility: "public" }))}
                        className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                          formData.visibility === "public"
                            ? "bg-blue-50 dark:bg-blue-900/20 border-blue-600 text-blue-600"
                            : "bg-gray-50 dark:bg-gray-800 border-transparent text-gray-400"
                        }`}
                      >
                        <Globe className="w-5 h-5" />
                        <span className="text-xs font-black uppercase tracking-widest">Public</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, visibility: "private" }))}
                        className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                          formData.visibility === "private"
                            ? "bg-purple-50 dark:bg-purple-900/20 border-purple-600 text-purple-600"
                            : "bg-gray-50 dark:bg-gray-800 border-transparent text-gray-400"
                        }`}
                      >
                        <Lock className="w-5 h-5" />
                        <span className="text-xs font-black uppercase tracking-widest">Privé</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Prix (FCFA)</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border-transparent focus:bg-white dark:focus:bg-gray-700 border-2 focus:border-blue-600 rounded-2xl transition-all outline-none font-bold text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-6 bg-blue-50 dark:bg-blue-900/10 rounded-[2rem] border border-blue-100 dark:border-blue-900/30">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm">
                      <QrCode className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">Système de Tickets QR</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Générez des tickets uniques pour chaque participant.</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      name="qrOption"
                      checked={formData.qrOption}
                      onChange={handleChange}
                      className="sr-only peer" 
                    />
                    <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Image de couverture</label>
                  <div className="relative group">
                    <input
                      type="file"
                      name="image"
                      accept="image/*"
                      onChange={handleChange}
                      className="hidden"
                      id="image-upload"
                    />
                    <label 
                      htmlFor="image-upload"
                      className="flex flex-col items-center justify-center w-full h-48 bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-[2rem] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-all group-hover:border-blue-600"
                    >
                      {formData.image ? (
                        <div className="flex items-center gap-3 text-blue-600 font-bold">
                          <ImageIcon className="w-6 h-6" />
                          <span>{formData.image.name}</span>
                        </div>
                      ) : (
                        <>
                          <ImageIcon className="w-10 h-10 text-gray-300 mb-4 group-hover:text-blue-600 transition-colors" />
                          <span className="text-sm font-black text-gray-400 uppercase tracking-widest">Cliquez pour ajouter une image</span>
                        </>
                      )}
                    </label>
                    {isEditMode && existingEventData?.imageUrl && !formData.image && (
                      <p className="text-[10px] text-gray-400 text-center mt-2 font-medium italic">Image actuelle conservée</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-8">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-6 bg-blue-600 hover:bg-blue-700 text-white rounded-[2rem] font-black text-lg uppercase tracking-[0.2em] shadow-2xl shadow-blue-600/20 transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : isEditMode ? (
                    <Save className="w-6 h-6" />
                  ) : (
                    <PlusCircle className="w-6 h-6" />
                  )}
                  {isSubmitting ? "Traitement..." : isEditMode ? "Enregistrer les modifications" : "Publier l'événement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default EventForm;
