import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// --- Service for general CRUD operations ---
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

// --- Service for dashboard specific data ---
import { getMyOrganizedEvents } from "../services/dashboardService";

/**
 * Hook to fetch all events (public).
 */
export const useEvents = () => {
  return useQuery({
    queryKey: ["events"],
    queryFn: getEvents,
    staleTime: 0,
  });
};

/**
 * Hook to fetch details of a single event.
 * @param {string} eventId
 */
export const useEventDetails = (eventId) => {
  return useQuery({
    queryKey: ["event", eventId],
    queryFn: () => getEventById(eventId),
    enabled: !!eventId && eventId !== "undefined",
  });
};

/**
 * Hook to fetch events created by the logged-in organizer.
 * @param {object} options - Query options
 */
export const useMyOrganizedEvents = (options = {}) => {
  return useQuery({
    queryKey: ["myOrganizedEvents"],
    queryFn: getMyOrganizedEvents,
    staleTime: 1000 * 60 * 5,
    ...options,
  });
};

// --- Hooks for Actions (Mutations) ---

/**
 * Hook to register for an event.
 */
export const useRegisterToEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: registerToEvent,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["event", variables.eventId] });
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      queryClient.invalidateQueries({ queryKey: ["userEvents"] });
    },
    onError: (error) => {
      console.error("Registration failed:", error);
    },
  });
};

/**
 * Hook to unregister from an event.
 */
export const useUnregisterFromEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: unregisterFromEvent,
    onSuccess: (unregisteredEventId) => {
      queryClient.invalidateQueries({ queryKey: ["userEvents"] });
      queryClient.invalidateQueries({
        queryKey: ["event", unregisteredEventId],
      });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
    onError: (error) => {
      console.error("Unregistration failed:", error);
    },
  });
};

/**
 * Hook to create a new event.
 */
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
    onError: (error) => console.error("Creation failed:", error),
  });
};

/**
 * Hook to update an existing event.
 */
export const useUpdateEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateEvent,
    onSuccess: (updatedEvent) => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["myOrganizedEvents"] });
      queryClient.setQueryData(["event", updatedEvent.id], updatedEvent);
      queryClient.invalidateQueries({ queryKey: ["event", updatedEvent.id] });
    },
    onError: (error) => console.error("Update failed:", error),
  });
};

/**
 * Hook to delete an event.
 */
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
    onError: (error) => console.error("Deletion failed:", error),
  });
};

/**
 * Hook to validate a QR code.
 */
export const useValidateQrCode = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: validateQrCode,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["organizerStats"] });
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
    },
    onError: (error) => {
      console.error("QR validation failed:", error);
    },
  });
};

/**
 * Hook to add a participant (Organizer/Admin).
 */
export const useAddParticipant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addParticipant,
    onSuccess: (updatedEvent) => {
      queryClient.invalidateQueries({ queryKey: ["myOrganizedEvents"] });
      queryClient.invalidateQueries({ queryKey: ["event", updatedEvent.id] });
      queryClient.invalidateQueries({ queryKey: ["organizerStats"] });
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
    },
    onError: (error) => console.error("Add participant failed:", error),
  });
};

/**
 * Hook to remove a participant (Organizer/Admin).
 */
export const useRemoveParticipant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removeParticipant,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["myOrganizedEvents"] });
      queryClient.invalidateQueries({ queryKey: ["event", data.eventId] });
      queryClient.invalidateQueries({ queryKey: ["organizerStats"] });
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
    },
    onError: (error) => {
      console.error("Remove participant failed:", error);
    },
  });
};

/**
 * Hook to toggle like on an event.
 */
export const useToggleLikeEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: toggleLikeEvent,
    onSuccess: (data, eventId) => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["event", eventId] });
    },
    onError: (error) => {
      console.error("Like toggle failed:", error);
    },
  });
};
