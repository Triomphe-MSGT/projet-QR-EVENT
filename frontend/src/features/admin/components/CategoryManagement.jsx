// src/components/admin/CategoryManagement.jsx
import React, { useState } from "react";
// ✅ Importer TOUS les hooks nécessaires pour le CRUD
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "../../../hooks/useCategories";
import Button from "../../../components/ui/Button"; // ✅ Vérifiez le chemin
import { PlusCircle, Edit, Trash2, Loader2 } from "lucide-react";
import CategoryFormModal from "./CategoryFormModal"; // ✅ Décommenté - Assurez-vous que ce fichier existe et est correct

const CategoryManagement = () => {
  // Récupération des données et états
  const { data: categories = [], isLoading, isError, error } = useCategories();

  // Préparation des mutations
  const createCatMutation = useCreateCategory(); // Hook pour créer
  const updateCatMutation = useUpdateCategory(); // Hook pour modifier
  const deleteCatMutation = useDeleteCategory(); // Hook pour supprimer

  // États locaux pour la modale
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState(null); // Stocke la catégorie à modifier

  // Fonction pour gérer la suppression
  const handleDelete = (catId, catName) => {
    if (
      window.confirm(
        `Supprimer la catégorie "${catName}" ? Les événements associés perdront cette catégorie.`
      )
    ) {
      deleteCatMutation.mutate(catId, {
        onError: (err) =>
          alert(`Erreur lors de la suppression: ${err.message}`),
      });
    }
  };

  // Ouvre la modale en mode édition
  const handleEdit = (cat) => {
    setCategoryToEdit(cat); // Définit les données initiales pour la modale
    setIsModalOpen(true);
  };

  // Ouvre la modale en mode création
  const handleCreate = () => {
    setCategoryToEdit(null); // Pas de données initiales pour la création
    setIsModalOpen(true);
  };

  // --- ✅ FONCTION handleFormSubmit COMPLÉTÉE ---
  // Fonction appelée par la modale lors de la soumission
  const handleFormSubmit = (formData) => {
    // Détermine quelle mutation appeler (création ou mise à jour)
    const mutation = categoryToEdit ? updateCatMutation : createCatMutation;
    // Prépare les données pour l'API (avec ID si mise à jour)
    const actionData = categoryToEdit
      ? { id: categoryToEdit.id, categoryData: formData }
      : formData;

    // Exécute la mutation
    mutation.mutate(actionData, {
      onSuccess: () => {
        console.log(
          categoryToEdit ? "Catégorie mise à jour !" : "Catégorie créée !"
        );
        setIsModalOpen(false); // Ferme la modale en cas de succès
        // Le cache sera invalidé par le hook, rafraîchissant la liste
      },
      onError: (err) => {
        // Affiche une alerte simple en cas d'erreur
        alert(
          `Erreur lors de l'enregistrement: ${
            err.response?.data?.error || err.message
          }`
        );
      },
    });
  };

  // Affichage pendant le chargement
  if (isLoading)
    return (
      <div className="text-center p-6">
        <Loader2 className="animate-spin inline-block mr-2" /> Chargement...
      </div>
    );
  // Affichage en cas d'erreur
  if (isError)
    return (
      <p className="text-center p-6 text-red-500">Erreur: {error.message}</p>
    );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      {/* En-tête avec titre et bouton Ajouter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Gestion des Catégories ({categories.length})
        </h2>
        <Button
          onClick={handleCreate}
          size="sm"
          variant="primary"
          className="w-full sm:w-auto"
        >
          <PlusCircle size={16} className="mr-2" /> Ajouter une Catégorie
        </Button>
      </div>

      {/* Tableau des catégories */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 border border-gray-200 dark:border-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-16">
                Emoji
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Nom
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Description
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {categories.map((cat) => (
              <tr
                key={cat.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <td className="px-4 py-3 text-xl">{cat.emoji || "❓"}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                  {cat.name}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                  {cat.description || "-"}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  {/* Bouton Modifier */}
                  <Button
                    variant="outline_icon"
                    size="xs"
                    onClick={() => handleEdit(cat)}
                    title="Modifier"
                  >
                    <Edit size={14} />
                  </Button>
                  {/* Bouton Supprimer */}
                  <Button
                    variant="danger_icon"
                    size="xs"
                    onClick={() => handleDelete(cat.id, cat.name)}
                    title="Supprimer"
                    disabled={
                      deleteCatMutation.isPending &&
                      deleteCatMutation.variables === cat.id
                    }
                  >
                    {deleteCatMutation.isPending &&
                    deleteCatMutation.variables === cat.id ? (
                      <Loader2 className="animate-spin w-3.5 h-3.5" />
                    ) : (
                      <Trash2 size={14} />
                    )}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- ✅ Affichage conditionnel de la modale DÉCOMMENTÉ --- */}
      {isModalOpen && (
        <CategoryFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleFormSubmit}
          initialData={categoryToEdit}
          // Passe l'état de chargement combiné des deux mutations
          isSubmitting={
            createCatMutation.isPending || updateCatMutation.isPending
          }
        />
      )}
    </div>
  );
};

export default CategoryManagement;
