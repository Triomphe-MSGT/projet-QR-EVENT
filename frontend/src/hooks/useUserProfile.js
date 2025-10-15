import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import userProfileService from "../services/userProfileService";
// 🔹 Récupérer le profil utilisateur
export const useUserProfile = () => {
  return useQuery({
    queryKey: ["userProfile"],
    queryFn: userProfileService.getProfile,
  });
};

// 🔹 Mettre à jour le profil utilisateur
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userProfileService.updateProfile,
    onSuccess: () => {
      // Rafraîchir le cache du profil après mise à jour
      queryClient.invalidateQueries(["userProfile"]);
    },
  });
};

// 🔹 Upload d’un avatar
export const useUploadAvatar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userProfileService.uploadAvatar,
    onSuccess: () => {
      // Rafraîchir aussi le profil après changement d’avatar
      queryClient.invalidateQueries(["userProfile"]);
    },
  });
};

// 🔹 (optionnel) Récupérer les événements de l'utilisateur
export const useUserEvents = () => {
  return useQuery({
    queryKey: ["userEvents"],
    queryFn: userProfileService.getUserEvents,
  });
};
