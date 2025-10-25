// src/hooks/useCategories.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../services/categoryService"; // ✅ Vérifiez le chemin

// Hook pour récupérer toutes les catégories
export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    staleTime: 1000 * 60 * 10, // Cache de 10 min
  });
};
console.log("ListCategorie rendering/refetching...");
// Hook pour créer une catégorie
export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCategory, // Attend { name, emoji, description }
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (error) => console.error("Erreur création catégorie:", error),
  });
};

// Hook pour mettre à jour une catégorie
export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateCategory, // Attend { id, categoryData }
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (error) => console.error("Erreur màj catégorie:", error),
  });
};

// Hook pour supprimer une catégorie
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCategory, // Attend l'ID
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (error) => console.error("Erreur suppression catégorie:", error),
  });
};
