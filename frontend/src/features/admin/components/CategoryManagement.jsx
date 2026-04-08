import React, { useState } from "react";
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "../../../hooks/useCategories";
import { PlusCircle, Edit, Trash2, Loader2, Grid } from "lucide-react";
import CategoryFormModal from "./CategoryFormModal";

const CategoryManagement = () => {
  const { data: categories = [], isLoading, isError, error } = useCategories();
  const createCatMutation = useCreateCategory();
  const updateCatMutation = useUpdateCategory();
  const deleteCatMutation = useDeleteCategory();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState(null);

  const handleDelete = (catId, catName) => {
    if (window.confirm(`Supprimer la catégorie "${catName}" ?`)) {
      deleteCatMutation.mutate(catId);
    }
  };

  const handleEdit = (cat) => {
    setCategoryToEdit(cat);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setCategoryToEdit(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = (formData) => {
    const mutation = categoryToEdit ? updateCatMutation : createCatMutation;
    const actionData = categoryToEdit ? { id: categoryToEdit.id, categoryData: formData } : formData;

    mutation.mutate(actionData, {
      onSuccess: () => setIsModalOpen(false),
      onError: (err) => alert(`Erreur: ${err.response?.data?.error || err.message}`),
    });
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
      <Loader2 className="w-10 h-10 animate-spin mb-4 text-orange-500" />
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Synchronisation des catégories...</p>
    </div>
  );

  return (
    <div className="space-y-8 text-slate-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h2 className="text-2xl font-black text-slate-500 uppercase tracking-tighter">Architecture</h2>
           <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none mt-1">
              Catégories d'événements
           </p>
        </div>
        <button
          onClick={handleCreate}
          className="w-full md:w-auto px-6 py-4 bg-orange-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-orange-700 transition-all shadow-xl shadow-orange-600/20 flex items-center justify-center gap-2"
        >
          <PlusCircle size={16} /> Nouvelle Catégorie
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <div key={cat.id} className="group bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-900/5 transition-all relative overflow-hidden">
             <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-bl-[4rem] flex items-center justify-center group-hover:bg-orange-600 transition-all duration-500">
                <span className="text-3xl filter grayscale group-hover:grayscale-0 transition-all">{cat.emoji || "🏷️"}</span>
             </div>
             
             <div className="space-y-4 pr-16">
                <div className="space-y-1">
                   <h3 className="text-xl font-black uppercase tracking-tighter group-hover:text-orange-600 transition-colors">{cat.name}</h3>
                   <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Tag Index</p>
                </div>
                <p className="text-sm font-bold text-slate-400 leading-relaxed min-h-[40px]">
                   {cat.description || "Aucune description fournie pour cette catégorie."}
                </p>
             </div>

             <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-200 uppercase tracking-widest">ID: {cat.id?.substring(0,8)}...</span>
                <div className="flex items-center gap-2">
                   <button 
                     onClick={() => handleEdit(cat)}
                     className="p-3 bg-slate-50 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all"
                   >
                      <Edit size={14} />
                   </button>
                   <button 
                     onClick={() => handleDelete(cat.id, cat.name)}
                     className="p-3 bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                   >
                      <Trash2 size={14} />
                   </button>
                </div>
             </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <CategoryFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleFormSubmit}
          initialData={categoryToEdit}
          isSubmitting={createCatMutation.isPending || updateCatMutation.isPending}
        />
      )}
    </div>
  );
};

export default CategoryManagement;
