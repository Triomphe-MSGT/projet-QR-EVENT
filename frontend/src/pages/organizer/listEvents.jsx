import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} from '../../services/eventService'

const ItemList = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  // 1️⃣ Récupérer les événements
  const {
    data: items,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['events'],
    queryFn: getEvents,
  })

  // 2️⃣ Mutation pour modifier un événement
  const updateItemMutation = useMutation({
    mutationFn: ({ id, data }) => updateEvent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['events']), navigate('/dashboard') // Redirection après succès
    },
  })

  // 3️⃣ Mutation pour supprimer un événement
  const deleteItemMutation = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => queryClient.invalidateQueries(['events']),
  })

  // 4️⃣ Mutation pour créer un événement + redirection
  const createItemMutation = useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries(['events'])
      navigate('/dashboard') // Redirection après succès
    },
  })

  if (isLoading) return <div>Chargement...</div>
  if (isError) return <div>Erreur : impossible de récupérer les données</div>

  return (
    <div>
      <button
        onClick={() =>
          createItemMutation.mutate({
            content: 'Nouvel événement',
            userId: 1, // si nécessaire
          })
        }
      >
        Créer un événement
      </button>

      <ul>
        {items.map((item) => (
          <li key={item.id}>
            {item.content}{' '}
            <button
              onClick={() =>
                updateItemMutation.mutate({
                  ...item,
                  content: item.content + ' ✔',
                })
              }
            >
              Modifier
            </button>
            <button onClick={() => deleteItemMutation.mutate(item.id)}>
              Supprimer
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default ItemList
