import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  events: [], // liste des événements
  currentEvent: null, // événement sélectionné pour édition

  participantCount: 0,
}

const generateId = () => Number((Math.random() * 1000000).toFixed(0))

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    addEvent(state, action) {
      const newEvent = action.payload
      state.push({
        id: generateId(),
        ...newEvent,
      })
    },
    updateEvent(state, action) {
      const updatedEvent = action.payload
      const index = state.findIndex((event) => event.id === updatedEvent.id)

      if (index !== -1) {
        state[index] = { ...state[index], ...updatedEvent }
      }
    },
    deleteEvent(state, action) {
      const id = action.payload
      return state.filter((event) => event.id !== id)
    },
    setCurrentEvent(state, action) {
      state.currentEvent = action.payload
    },
    setEvents(state, action) {
      state.events = action.payload
    },
    incrementParticipant: (state) => {
      state.participantCount += 1
    },
  },
})

export const {
  addEvent,
  updateEvent,
  deleteEvent,
  setEvents,
  setCurrentEvent,
  incrementParticipant,
} = eventsSlice.actions
export default eventsSlice.reducer
