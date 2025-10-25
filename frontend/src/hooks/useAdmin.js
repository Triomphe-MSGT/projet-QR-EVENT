// src/hooks/useAdmin.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminStats,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../services/adminService"; // ✅ Vérifiez le chemin

// Hook pour les stats admin
export const useAdminStats = () => {
  return useQuery({ queryKey: ["adminStats"], queryFn: getAdminStats });
};

// --- Hooks CRUD Utilisateurs ---
export const useAllUsers = () => {
  return useQuery({ queryKey: ["allUsers"], queryFn: getAllUsers });
};

// Hook pour créer un utilisateur
export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      // Rafraîchit la liste des utilisateurs après création
      queryClient.invalidateQueries({ queryKey: ["allUsers"] });
      // Pourrait aussi invalider les stats si elles incluent le compte total
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
    },
    onError: (error) => console.error("Erreur création utilisateur:", error),
  });
};

// Hook pour mettre à jour un utilisateur
export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateUser, // Attend un objet { id, userData }
    onSuccess: () => {
      // Rafraîchit la liste des utilisateurs
      queryClient.invalidateQueries({ queryKey: ["allUsers"] });
      // Met à jour le cache du profil si l'admin modifie l'utilisateur courant
      // Note: Ceci nécessite une logique pour comparer updatedUser.id avec l'ID courant
      // queryClient.setQueryData(['userProfile'], updatedUser);
      queryClient.invalidateQueries({ queryKey: ["adminStats"] }); // Si le rôle change
    },
    onError: (error) => console.error("Erreur màj utilisateur:", error),
  });
};

// Hook pour supprimer un utilisateur
export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteUser, // Attend l'ID de l'utilisateur
    onSuccess: () => {
      // Rafraîchit la liste des utilisateurs après suppression
      queryClient.invalidateQueries({ queryKey: ["allUsers"] });
      queryClient.invalidateQueries({ queryKey: ["adminStats"] }); // Le compte change
    },
    onError: (error) => console.error("Erreur suppression utilisateur:", error),
  });
};
