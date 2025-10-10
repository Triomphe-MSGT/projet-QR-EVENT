// EventCards.jsx
import React from 'react'
import { useEvents } from '../../hooks/useEvents'

const EventCards = () => {
  //  Récupère les événements via ton hook
  const { events = [], isLoading, isError } = useEvents()

  // Gestion d’état
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

  // Calcul des statistiques
  const totalEvents = events.length
  const totalParticipants = events.reduce(
    (sum, event) => sum + (event.participants || 0),
    0
  )

  //  Style simple pour les cartes
  const cardStyle =
    'p-4 bg-white rounded-xl shadow border border-gray-100 text-center flex-1'

  return (
    <div className='flex gap-4 mb-6'>
      <div className={cardStyle}>
        <h3 className='text-gray-500 font-semibold uppercase text-xs'>
          Total Événements
        </h3>
        <p className='text-2xl font-bold text-gray-900 mt-2'>{totalEvents}</p>
      </div>

      <div className={cardStyle}>
        <h3 className='text-gray-500 font-semibold uppercase text-xs'>
          Total Participants
        </h3>
        <p className='text-2xl font-bold text-gray-900 mt-2'>
          {totalParticipants}
        </p>
      </div>
    </div>
  )
}

export default EventCards
