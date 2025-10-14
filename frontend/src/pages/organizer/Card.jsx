import React from 'react'
import { useEvents } from '../../hooks/useEvents'
import { useSelector } from 'react-redux'

const EventCards = () => {
  // ✅ Récupération des événements via React Query
  const { data: events = [], isLoading, isError } = useEvents()

  // ✅ Récupération du nombre de participants via Redux
  const participantCount = useSelector((state) => state.events.participantCount)

  const totalEvents = events ? events.length : 0

  // ✅ Gestion des états de chargement/erreur
  if (isLoading) {
    return (
      <div className='p-4 text-center text-gray-500 animate-pulse'>
        Chargement des statistiques...
      </div>
    )
  }

  if (isError) {
    return (
      <div className='p-4 text-center text-red-500'>
        Erreur lors du chargement des données.
      </div>
    )
  }

  // ✅ Style des cartes
  const cardStyle =
    'p-4 bg-white rounded-xl shadow border border-gray-100 text-center flex-1'

  return (
    <div className='flex flex-col sm:flex-row gap-4 mb-6'>
      {/* Carte Total Événements */}
      <div className={cardStyle}>
        <h3 className='text-gray-500 font-semibold uppercase text-xs'>
          Total Événements
        </h3>
        <p className='text-2xl font-bold text-gray-900 mt-2'>{totalEvents}</p>
      </div>

      {/* Carte Total Participants */}
      <div className={cardStyle}>
        <h3 className='text-gray-500 font-semibold uppercase text-xs'>
          Total Participants
        </h3>
        <p className='text-2xl font-bold text-gray-900 mt-2'>
          {participantCount}
        </p>
      </div>
    </div>
  )
}

export default EventCards
