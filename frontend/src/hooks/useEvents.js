// src/hooks/useEvents.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getEvents,
  getEventById,
  registerToEvent,
  createEvent,
  updateEvent,
  deleteEvent,
} from "../services/eventService";

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

// Hook pour créer un événement
export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createEvent, // Prend l'objet FormData en argument
    onSuccess: () => {
      // Rafraîchit la liste principale des événements
      queryClient.invalidateQueries({ queryKey: ["events"] });
      console.log("Événement créé, cache de la liste invalidé.");
    },
    onError: (error) => console.error("Échec de la création :", error),
  });
};

// Hook pour mettre à jour un événement
export const useUpdateEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateEvent, // Prend { id, formData } en argument
    onSuccess: (updatedEvent) => {
      // Rafraîchit la liste et les détails de l'événement modifié
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["event", updatedEvent.id] });
      console.log(`Événement ${updatedEvent.id} mis à jour, caches invalidés.`);
    },
    onError: (error) => console.error("Échec de la mise à jour :", error),
  });
};

// Hook pour supprimer un événement
export const useDeleteEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteEvent, // Prend l'ID en argument
    onSuccess: (deletedId) => {
      // Rafraîchit la liste principale
      queryClient.invalidateQueries({ queryKey: ["events"] });
      // Supprime l'événement du cache des détails s'il y était
      queryClient.removeQueries({ queryKey: ["event", deletedId] });
      console.log(
        `Événement ${deletedId} supprimé, caches invalidés/supprimés.`
      );
    },
    onError: (error) => console.error("Échec de la suppression :", error),
  });
};
