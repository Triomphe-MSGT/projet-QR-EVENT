import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getEvents,
  getEventById,
  registerToEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  validateQrCode,
} from "../services/eventService";
import { getMyOrganizedEvents } from "../services/dashboardService";

// Hook pour la liste de tous les événements
export const useEvents = () => {
  return useQuery({
    queryKey: ["events"],
    queryFn: getEvents,
    staleTime: 1000 * 60 * 5, // Cache de 5 minutes
  });
};

// Hook pour les détails d'un seul événement
export const useEventDetails = (eventId) => {
  return useQuery({
    queryKey: ["event", eventId],
    queryFn: () => getEventById(eventId),
    enabled: !!eventId, // Ne s'active que si eventId est fourni
  });
};

// Hook pour s'inscrire à un événement
export const useRegisterToEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: registerToEvent,
    onSuccess: (data, variables) => {
      // Invalide les caches concernés pour refléter les changements
      queryClient.invalidateQueries({ queryKey: ["event", variables.eventId] });
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      queryClient.invalidateQueries({ queryKey: ["userEvents"] }); // Si vous avez un hook spécifique pour les événements de l'utilisateur
      console.log("Inscription réussie, caches invalidés.");
    },
    onError: (error) => {
      console.error("Échec de l'inscription :", error);
      // Afficher une notification d'erreur à l'utilisateur ici
    },
  });
};

export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["myOrganizedEvents"] }); // ✅ Invalide la liste du dashboard
      queryClient.invalidateQueries({ queryKey: ["adminStats"] }); // ✅ Invalide les stats admin
      queryClient.invalidateQueries({ queryKey: ["organizerStats"] }); // ✅ Invalide les stats orga
    },
    onError: (error) => console.error("Échec création:", error),
  });
};

export const useUpdateEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateEvent,
    onSuccess: (updatedEvent) => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["myOrganizedEvents"] }); // ✅ Invalide la liste du dashboard
      queryClient.invalidateQueries({ queryKey: ["event", updatedEvent.id] });
      // Les stats ne changent pas lors d'une simple mise à jour (sauf cas très spécifique)
    },
    onError: (error) => console.error("Échec màj:", error),
  });
};

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteEvent,
    onSuccess: (deletedId) => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["myOrganizedEvents"] }); // ✅ Invalide la liste du dashboard
      queryClient.removeQueries({ queryKey: ["event", deletedId] });
      queryClient.invalidateQueries({ queryKey: ["adminStats"] }); // ✅ Invalide les stats admin
      queryClient.invalidateQueries({ queryKey: ["organizerStats"] }); // ✅ Invalide les stats orga
    },
    onError: (error) => console.error("Échec suppression:", error),
  });
};

export const useValidateQrCode = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: validateQrCode, // Fonction du service
    onSuccess: (data) => {
      console.log("✅ Validation QR réussie:", data);
      queryClient.invalidateQueries({ queryKey: ["organizerStats"] });
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
    },
    onError: (error) => {
      console.error("❌ Échec validation QR:", error);
      // L'erreur sera gérée dans le composant scanner
    },
  });
};

// Hook pour récupérer les événements créés par l'organisateur connecté
export const useMyOrganizedEvents = (options = {}) => {
  // Accepte des options (comme 'enabled')
  return useQuery({
    queryKey: ["myOrganizedEvents"],
    queryFn: getMyOrganizedEvents,
    staleTime: 1000 * 60 * 5, // Cache de 5 minutes
    ...options,
  });
};

export const useUnregisterFromEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: useUnregisterFromEvent, // Appelle la fonction du service
    onSuccess: (unregisteredEventId) => {
      // Invalide tous les caches où l'événement pourrait apparaître
      queryClient.invalidateQueries({ queryKey: ["userEvents"] });
      queryClient.invalidateQueries({
        queryKey: ["event", unregisteredEventId],
      });
      queryClient.invalidateQueries({ queryKey: ["events"] });
      console.log("Désinscription réussie, caches invalidés.");
    },
    onError: (error) => {
      console.error("Échec désinscription:", error);
      // Idéalement, afficher une notification d'erreur
    },
  });
};
