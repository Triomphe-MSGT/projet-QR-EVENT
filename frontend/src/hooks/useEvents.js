import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} from '../services/eventService'

// Récupération de la liste
export const useEvents = () => {
  return useQuery({
    queryKey: ['events'],
    queryFn: getEvents,
  })
}

// Ajout d'un nouvel événement
export const useCreateEvent = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createEvent,
    onSuccess: (newEvent) => {
      queryClient.setQueryData(['events'], (old = []) => [...old, newEvent])
    },
  })
}

// Mise à jour
export const useUpdateEvent = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateEvent,
    onSuccess: (updateEvent) => {
      queryClient.setQueryData(['events'], (oldEvents = []) =>
        oldEvents.map((ev) => (ev.id === updateEvent.id ? updateEvent : ev))
      )
    },
  })
}

// Suppression
export const useDeleteEvent = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteEvent,
    onSuccess: (deletedId) => {
      queryClient.setQueryData(['events'], (oldEvents = []) =>
        oldEvents.filter((ev) => ev.id !== deletedId)
      )
    },
  })
}
