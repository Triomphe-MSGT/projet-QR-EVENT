import { useEvents } from '../../hooks/useEvents'
import { PlusCircle, Loader2, Edit, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { setCurrentEvent } from '../../slices/eventSlice'
import { deleteEvent } from '../../services/eventService'
import { useQueryClient } from '@tanstack/react-query'
import toast, { Toaster } from 'react-hot-toast'

const EventTabs = () => {
  const { data: events, isLoading } = useEvents()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const queryClient = useQueryClient()

  // Parseur de date robuste
  const parseDate = (dateString) => {
    if (!dateString || typeof dateString !== 'string') return new Date()
    if (dateString.includes('/')) {
      const [day, month, year] = dateString.split('/').map(Number)
      return new Date(year, month - 1, day)
    }
    return new Date(dateString)
  }

  // Calcul du statut d’un événement
  const getEventStatus = (start, end) => {
    const today = new Date()
    const startDate = parseDate(start)
    const endDate = parseDate(end)
    if (isNaN(startDate) || isNaN(endDate)) return 'Date invalide'
    if (today < startDate) return 'À venir'
    if (today > endDate) return 'Passé'
    return 'En cours'
  }

  // Navigation vers la création
  const handleCreateClick = () => navigate('/createevent')

  // Édition
  const handleEdit = (event) => {
    dispatch(setCurrentEvent(event))
    navigate(`/editevent/${event.id}`)
  }

  // Suppression
  const handleDelete = async (id) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cet événement ?'))
      return

    try {
      await deleteEvent(id)
      queryClient.invalidateQueries(['events']) // Rafraîchir la liste
      toast.success('Événement supprimé avec succès !') // ✅ toast
    } catch (error) {
      console.error('Erreur suppression :', error)
      toast.error('Impossible de supprimer l’événement.')
    }
  }

  return (
    <div className='bg-white p-6 rounded-xl shadow-lg border border-gray-100 mt-8'>
      <Toaster position='top-right' />
      <div className='flex justify-between items-center mb-6'>
        <h2 className='text-xl font-bold text-gray-800'>
          Gestion des événements
        </h2>
        <button
          onClick={handleCreateClick}
          className='flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium shadow-md hover:bg-indigo-700 transition duration-150'
        >
          <PlusCircle size={18} />
          <span>Créer un événement</span>
        </button>
      </div>

      {isLoading ? (
        <div className='flex justify-center items-center py-10 text-indigo-500'>
          <Loader2 size={24} className='animate-spin mr-2' />
          <span>Chargement des événements...</span>
        </div>
      ) : events && events.length > 0 ? (
        <div className='overflow-x-auto rounded-lg border border-gray-100 shadow-sm'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500'>
                  Événement
                </th>
                <th className='px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500'>
                  Début
                </th>
                <th className='px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500'>
                  Fin
                </th>
                <th className='px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500'>
                  Lieu
                </th>
                <th className='px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500'>
                  Statut
                </th>
                <th className='px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500'>
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className='bg-white divide-y divide-gray-100'>
              {events.map((event) => {
                const status = getEventStatus(event.debut, event.fin)
                const statusColor =
                  status === 'À venir'
                    ? 'text-blue-600 bg-blue-100'
                    : status === 'En cours'
                    ? 'text-green-600 bg-green-100'
                    : 'text-red-600 bg-red-100'

                return (
                  <tr
                    key={event.id}
                    className='hover:bg-indigo-50/50 transition duration-100'
                  >
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                      {event.name}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      {event.debut}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      {event.fin}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      {event.localisation}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-center text-sm'>
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor}`}
                      >
                        {status}
                      </span>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex gap-2 justify-end'>
                      <button
                        onClick={() => handleEdit(event)}
                        title='Modifier'
                        className='text-gray-600 hover:text-indigo-600'
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(event.id)} // ✅ Correction ici
                        title='Supprimer'
                        className='text-red-600 hover:text-red-800'
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className='text-center text-gray-500 py-10'>
          Aucun événement disponible pour le moment.
        </div>
      )}
    </div>
  )
}

export default EventTabs
