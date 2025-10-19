import React from 'react'
import { MapPin, CalendarDays } from 'lucide-react'

// ✅ Convertit "DD-MM-YYYY" → Date JS
const parseDate = (str) => {
  if (!str) return null
  const [day, month, year] = str.split('-')
  const date = new Date(`${year}-${month}-${day}`)
  return isNaN(date) ? null : date
}

const RecentEvents = ({ events }) => (
  <div className='bg-white rounded-2xl p-6 shadow-lg'>
    <h3 className='font-semibold text-lg mb-4 text-gray-800 flex items-center gap-2'>
      <CalendarDays className='text-blue-500' size={20} /> Événements récents
    </h3>

    <div className='flex flex-col gap-3'>
      {events.map((event, index) => {
        const dateObj = parseDate(event.debut)
        const formattedDate = dateObj
          ? dateObj.toLocaleDateString('fr-FR', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })
          : 'Date inconnue'

        return (
          <div
            key={event.id}
            className='flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition rounded-xl p-3 shadow-sm'
          >
            {/* Partie gauche : Rang + Info */}
            <div className='flex items-center gap-4'>
              <div className='w-8 h-8 bg-blue-100 text-blue-600 flex items-center justify-center rounded-full font-semibold'>
                {index + 1}
              </div>
              <div>
                <p className='font-semibold text-gray-800'>{event.name}</p>
                <p className='text-sm text-gray-500 flex items-center gap-1'>
                  <MapPin size={14} /> {event.localisation || 'Lieu inconnu'}
                </p>
              </div>
            </div>

            {/* Partie droite : Date */}
            <div className='flex items-center gap-2 text-sm text-gray-600'>
              <CalendarDays size={16} /> {formattedDate}
            </div>
          </div>
        )
      })}
    </div>
  </div>
)

export default RecentEvents
