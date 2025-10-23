import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import userProfileService from "../services/userProfileService";

// 🔹 Récupérer le profil utilisateur
export const useUserProfile = () => {
  return useQuery({
    queryKey: ["userProfile"],
    queryFn: userProfileService.getProfile,
    // Les données sont considérées comme "fraîches" pendant 5 minutes pour éviter des rechargements inutiles.
    staleTime: 1000 * 60 * 5,
  });
};

// 🔹 Mettre à jour le profil utilisateur
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userProfileService.updateProfile,
    // En cas de succès, invalider le cache du profil pour forcer un rechargement.
    onSuccess: () => {
      console.log("Profil mis à jour avec succès, invalidation du cache...");
      // Utilisation de la syntaxe d'objet, plus moderne et explicite.
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
    // Gérer les erreurs pour faciliter le débogage.
    onError: (error) => {
      console.error("Échec de la mise à jour du profil :", error);
    },
  });
};

// 🔹 Upload d’un avatar
export const useUploadAvatar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userProfileService.uploadAvatar,
    onSuccess: () => {
      console.log("Avatar uploadé avec succès, invalidation du cache...");
      // Invalider aussi le profil après un changement d'avatar.
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
    onError: (error) => {
      console.error("Échec de l'upload de l'avatar :", error);
    },
  });
};

// 🔹 Récupérer les événements de l'utilisateur
export const useUserEvents = () => {
  return useQuery({
    queryKey: ["userEvents"],
    queryFn: userProfileService.getUserEvents,
  });
};
