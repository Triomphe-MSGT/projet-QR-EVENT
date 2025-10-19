import { useEvents } from '../../hooks/useEvents'
import { PlusCircle, Loader2, Edit, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { setCurrentEvent } from '../../slices/eventSlice'
import { deleteEvent } from '../../services/eventService'
import EditEvent from './EditEvent'

const EventTabs = () => {
  const { data: events, isLoading } = useEvents()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const parseDate = (dateString) => {
    if (!dateString || typeof dateString !== 'string') return new Date()
    if (dateString.includes('/')) {
      const [day, month, year] = dateString.split('/').map(Number)
      return new Date(year, month - 1, day)
    }
    return new Date(dateString)
  }

  const getEventStatus = (start, end) => {
    const today = new Date()
    const startDate = parseDate(start)
    const endDate = parseDate(end)
    if (isNaN(startDate) || isNaN(endDate)) return 'Date invalide'
    if (today < startDate) return 'À venir'
    if (today > endDate) return 'Passé'
    return 'En cours'
  }

  const handleCreateClick = () => navigate('/createevent')

  const handleEdit = (event) => {
    // Stocker l'événement dans Redux pour y accéder facilement
    dispatch(setCurrentEvent(event))
    navigate(`/editevent/${event.id}`)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cet événement ?'))
      return
    try {
      await deleteEvent(id) // Assure-toi que deleteEvent retourne une Promise
      alert('Événement supprimé !')
    } catch (error) {
      alert('Impossible de supprimer l’événement')
    }
  }

  return (
    <div className='bg-white p-6 rounded-xl shadow-lg border border-gray-100 mt-8'>
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
        </div>
      ) : (
        <div className='overflow-x-auto rounded-lg border border-gray-100 shadow-sm'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500'>
                  ÉVÉNEMENT
                </th>
                <th className='px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500'>
                  DÉBUT
                </th>
                <th className='px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500'>
                  FIN
                </th>
                <th className='px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500'>
                  LIEU
                </th>
                <th className='px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500'>
                  STATUT
                </th>
                <th className='px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500'>
                  ACTIONS
                </th>
              </tr>
            </thead>

            <tbody className='bg-white divide-y divide-gray-100'>
              {(events || []).map((event) => {
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
                      <EditEvent />

                      <button
                        onClick={() => handleDelete(event)}
                        title='Supprimer'
                        className='text-red-600'
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
      )}
    </div>
  )
}

export default EventTabs
