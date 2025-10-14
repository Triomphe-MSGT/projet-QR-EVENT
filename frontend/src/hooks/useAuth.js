import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getUser,
  createUser,
  updateUser,
  deleteUser,
} from '../services/authService'

// Récupération de la liste
export const useAuth = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: getUser,
  })
}

// Ajout d'un nouvel événement
export const useCreateUser = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createUser,
    onSuccess: (newUsers) => {
      queryClient.setQueryData(['users'], (old = []) => [...old, newUsers])
    },
  })
}

// Mise à jour
export const useUpdateUser = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateUser,
    onSuccess: (updateUser) => {
      queryClient.setQueryData(['users'], (oldUsers = []) =>
        oldUsers.map((us) => (us.id === updateUser.id ? updateUser : us))
      )
    },
  })
}

// Suppression
export const useDeleteUser = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteUser,
    onSuccess: (deletedId) => {
      queryClient.setQueryData(['users'], (oldUsers = []) =>
        oldUsers.filter((us) => us.id !== deletedId)
      )
    },
  })
}
