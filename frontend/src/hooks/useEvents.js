import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// --- Service pour les opérations CRUD générales ---
import {
  getEvents,
  getEventById,
  registerToEvent,
  unregisterFromEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  validateQrCode,
  addParticipant,
  removeParticipant,
  toggleLikeEvent,
} from "../services/eventService";

// --- Service pour les données spécifiques au dashboard ---
import { getMyOrganizedEvents } from "../services/dashboardService";

// Hook pour la liste de TOUS les événements (public)
export const useEvents = () => {
  return useQuery({
    queryKey: ["events"],
    queryFn: getEvents,
    staleTime: 0,
  });
};

// Hook pour les détails d'UN événement
export const useEventDetails = (eventId) => {
  return useQuery({
    queryKey: ["event", eventId],
    queryFn: () => getEventById(eventId),
    enabled: !!eventId && eventId !== "undefined", // Ne s'active que si eventId est fourni et valide
  });
};

// Hook pour récupérer les événements créés par l'organisateur connecté
export const useMyOrganizedEvents = (options = {}) => {
  return useQuery({
    queryKey: ["myOrganizedEvents"], // Clé de cache distincte
    queryFn: getMyOrganizedEvents, // Utilise la fonction du dashboardService
    staleTime: 1000 * 60 * 5,
    ...options, // Permet de passer 'enabled' depuis le composant
  });
};

// --- Hooks pour les Actions (Mutations) ---

// Hook pour s'inscrire à un événement
export const useRegisterToEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: registerToEvent,
    onSuccess: (data, variables) => {
      // Invalide les caches concernés pour refléter les changements
      queryClient.invalidateQueries({ queryKey: ["event", variables.eventId] });
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      queryClient.invalidateQueries({ queryKey: ["userEvents"] });
      console.log("Inscription réussie, caches invalidés.");
    },
    onError: (error) => {
      console.error("Échec de l'inscription :", error);
    },
  });
};

// Hook pour se désinscrire d'un événement
export const useUnregisterFromEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: unregisterFromEvent, // ✅ CORRIGÉ : Appelait useUnregisterFromEvent
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
    },
  });
};

// Hook pour créer un événement
export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["myOrganizedEvents"] });
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
      queryClient.invalidateQueries({ queryKey: ["organizerStats"] });
    },
    onError: (error) => console.error("Échec création:", error),
  });
};

// Hook pour mettre à jour un événement
export const useUpdateEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateEvent,
    onSuccess: (updatedEvent) => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["myOrganizedEvents"] });
      // Met à jour directement le cache des détails pour un retour instantané
      queryClient.setQueryData(["event", updatedEvent.id], updatedEvent);
      // Invalide au cas où setQueryData ne suffit pas
      queryClient.invalidateQueries({ queryKey: ["event", updatedEvent.id] });
    },
    onError: (error) => console.error("Échec màj:", error),
  });
};

// Hook pour supprimer un événement
export const useDeleteEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteEvent,
    onSuccess: (deletedId) => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["myOrganizedEvents"] });
      queryClient.removeQueries({ queryKey: ["event", deletedId] });
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
      queryClient.invalidateQueries({ queryKey: ["organizerStats"] });
    },
    onError: (error) => console.error("Échec suppression:", error),
  });
};

// Hook pour valider un QR code
export const useValidateQrCode = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: validateQrCode,
    onSuccess: (data) => {
      console.log("✅ Validation QR réussie:", data);
      // Rafraîchit les stats qui comptent les validations
      queryClient.invalidateQueries({ queryKey: ["organizerStats"] });
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
    },
    onError: (error) => {
      console.error("❌ Échec validation QR:", error);
    },
  });
};

// --- ✅ HOOK MANQUANT AJOUTÉ ---
// Hook pour AJOUTER un participant (par Orga/Admin)
export const useAddParticipant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addParticipant, // Utilise la fonction importée
    onSuccess: (updatedEvent) => {
      // Rafraîchit toutes les listes/stats pertinentes
      queryClient.invalidateQueries({ queryKey: ["myOrganizedEvents"] });
      queryClient.invalidateQueries({ queryKey: ["event", updatedEvent.id] });
      queryClient.invalidateQueries({ queryKey: ["organizerStats"] });
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
      console.log(`Participant ajouté à ${updatedEvent.id}`);
    },
    onError: (error) => console.error("Échec ajout participant:", error),
  });
};

// Hook pour SUPPRIMER un participant (par Orga/Admin)
export const useRemoveParticipant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removeParticipant,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["myOrganizedEvents"] });
      queryClient.invalidateQueries({ queryKey: ["event", data.eventId] });
      queryClient.invalidateQueries({ queryKey: ["organizerStats"] });
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
      console.log(
        `Participant ${data.participantId} supprimé de ${data.eventId}`
      );
    },
    onError: (error) => {
      console.error("Échec suppression participant:", error);
    },
  });
};

// Hook pour liker/unliker un événement
export const useToggleLikeEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: toggleLikeEvent,
    onSuccess: (data, eventId) => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["event", eventId] });
    },
    onError: (error) => {
      console.error("Échec du like :", error);
    },
  });
};
