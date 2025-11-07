import { createSlice } from "@reduxjs/toolkit";

const initialState = [];

const generateId = () => Number((Math.random() * 1000000).toFixed(0));

const eventsSlice = createSlice({
  name: "events",
  initialState,
  reducers: {
    addEvent(state, action) {
      const newEvent = action.payload;
      state.push({
        id: generateId(),
        ...newEvent,
      });
    },
    updateEvent(state, action) {
      const updatedEvent = action.payload;
      const index = state.findIndex((event) => event.id === updatedEvent.id);

      if (index !== -1) {
        state[index] = { ...state[index], ...updatedEvent };
      }
    },
    deleteEvent(state, action) {
      const id = action.payload;
      return state.filter((event) => event.id !== id);
    },
  },
});

export const { addEvent, updateEvent, deleteEvent } = eventsSlice.actions;
export default eventsSlice.reducer;
