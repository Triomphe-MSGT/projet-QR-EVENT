import React from 'react'
import { useDispatch } from 'react-redux'

import Button from '../ui/Button'
import { incrementParticipant } from '../../slices/eventSlice'

const EventCard = ({ event, handleDetails }) => {
  const dispatch = useDispatch()

  const handleParticipate = () => {
    dispatch(incrementParticipant())
  }
  return (
    <div className='event-card bg-white p-4 rounded-xl shadow-md cursor-pointer'>
      <div className='flex items-center gap-4'>
        <div className='flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-blue-500 flex items-center justify-center text-white font-bold text-lg'>
          {!event.url && event.name.charAt(0).toUpperCase()}
          {event.url && (
            <img
              src={event.url}
              alt={event.name}
              className='w-20 h-20 rounded-xl object-cover'
            />
          )}
        </div>
        <div className='flex-grow'>
          <h3 className='text-lg font-semibold text-gray-800'>{event.name}</h3>
          <p className='text-sm text-gray-500 mt-1'>{event.description}</p>
          <p>{event.date}</p>
          <p>{event.localisation}</p>
        </div>
      </div>
      <div className='flex items-center justify-end gap-2 mt-4'>
        <Button variant='detail' size='sm' onClick={handleDetails}>
          Details
        </Button>
        <Button variant='primary' size='sm' onClick={handleParticipate}>
          Participer
        </Button>
      </div>
    </div>
  )
}

export default EventCard
