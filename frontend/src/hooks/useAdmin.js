import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminStats,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../services/adminService"; // ✅ Assurez-vous que le chemin est correct

// Hook pour les stats admin (inchangé)
export const useAdminStats = () => {
  return useQuery({
    queryKey: ["adminStats"],
    queryFn: getAdminStats,
    staleTime: 1000 * 60 * 5,
  });
};

// Hook pour la liste de tous les utilisateurs (inchangé)
export const useAllUsers = () => {
  return useQuery({
    queryKey: ["allUsers"],
    queryFn: getAllUsers,
    staleTime: 1000 * 60 * 10,
  });
};

// --- HOOKS DE MUTATION AJOUTÉS ---

// Hook pour CRÉER un utilisateur
export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createUser, // Fonction du service (POST /api/users)
    onSuccess: () => {
      // Rafraîchit la liste des utilisateurs et les stats après création
      queryClient.invalidateQueries({ queryKey: ["allUsers"] });
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
    },
    onError: (error) => console.error("Erreur création utilisateur:", error),
  });
};

// Hook pour METTRE À JOUR un utilisateur
export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateUser, // Fonction du service (PUT /api/users/:id)
    onSuccess: () => {
      // Rafraîchit la liste des utilisateurs et les stats
      queryClient.invalidateQueries({ queryKey: ["allUsers"] });
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
      // Invalide aussi le cache du profil (au cas où l'admin se modifie lui-même)
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
    onError: (error) => console.error("Erreur màj utilisateur:", error),
  });
};

// Hook pour SUPPRIMER un utilisateur
export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteUser, // Fonction du service (DELETE /api/users/:id)
    onSuccess: () => {
      // Rafraîchit la liste des utilisateurs et les stats
      queryClient.invalidateQueries({ queryKey: ["allUsers"] });
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
    },
    onError: (error) => console.error("Erreur suppression utilisateur:", error),
  });
};
