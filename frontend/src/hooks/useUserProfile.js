import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import userProfileService from "../services/userProfileService";
import { useDispatch } from "react-redux";
import { login, logout } from "../slices/authSlice";

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

export const useChangePassword = () => {
  return useMutation({
    mutationFn: userProfileService.changeMyPassword,
    // (onSuccess/onError sont gérés dans le composant)
  });
};

// --- NOUVEAU HOOK ---
export const useDeleteMyAccount = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch(); // 3. Préparer le dispatch

  return useMutation({
    mutationFn: userProfileService.deleteMyAccount,
    onSuccess: () => {
      // 4. Déconnexion complète de l'utilisateur
      dispatch(logout()); // Vide Redux et localStorage
      queryClient.clear(); // Vide le cache React Query
      // La redirection se fera dans le composant
    },
    onError: (error) => {
      console.error("Échec de la suppression du compte:", error);
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

export const useUpgradeToOrganizer = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch(); // 1. Obtenir la fonction dispatch

  return useMutation({
    mutationFn: userProfileService.upgradeToOrganizer,
    onSuccess: (data) => {
      // 'data' est { message, user }
      console.log("Mise à niveau réussie:", data.message);

      // 2. Mettre à jour le cache de React Query (ce que vous faisiez déjà)
      queryClient.setQueryData(["userProfile"], data.user);
      queryClient.invalidateQueries({ queryKey: ["userEvents"] });

      // --- 3. LA CORRECTION : Mettre à jour le state de Redux ---
      // Nous devons récupérer le token actuel pour le repasser à l'action 'login'
      const currentToken = localStorage.getItem("token");

      if (currentToken) {
        // En dispatchant 'login', Redux ET localStorage sont mis à jour
        // avec le nouvel objet 'user' (qui a role: "Organisateur")
        dispatch(login({ user: data.user, token: currentToken }));
      }
    },
    onError: (error) => {
      console.error("Échec de la mise à niveau :", error);
    },
  });
};
