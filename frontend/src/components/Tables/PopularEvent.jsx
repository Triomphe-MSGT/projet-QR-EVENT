import React from 'react'
import { MapPin, Trophy } from 'lucide-react'

const PopularEvents = ({ events }) => (
  <div className='bg-white rounded-2xl p-6 shadow-lg'>
    <h3 className='font-semibold text-lg mb-4 text-gray-800 flex items-center gap-2'>
      <Trophy className='text-yellow-500' size={20} /> Événements populaires
    </h3>

    <div className='flex flex-col gap-3'>
      {events.map((event, index) => (
        <div
          key={event.id}
          className='flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition rounded-xl p-3 shadow-sm'
        >
          {/* Rang + Infos */}
          <div className='flex items-center gap-4'>
            <div className='w-8 h-8 bg-blue-100 text-blue-600 flex items-center justify-center rounded-full font-semibold'>
              {index + 1}
            </div>
            <div>
              <p className='font-semibold text-gray-800'>{event.name}</p>
              <p className='text-sm flex items-center gap-1 text-gray-500'>
                <MapPin size={14} /> {event.localisation || 'Lieu inconnu'}
              </p>
            </div>
          </div>

          {/* Participants */}
          <div className='text-right'>
            <p className='text-blue-600 font-semibold'>
              {event.participantsCount || 0}
            </p>
            <p className='text-xs text-gray-500'>participants</p>
          </div>
        </div>
      ))}
    </div>
  </div>
)

export default PopularEvents
