import { createSlice } from "@reduxjs/toolkit";

const initialState = [
  {
    id: 2,
    name: "Atelier Blockchain",
    url: "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg",
    description:
      "Découvrez les opportunités offertes par la technologie blockchain pour l’Afrique.",
    date: "15/10/2025",
    localisation: "Yaoundé",
  },
  {
    id: 3,
    name: "Bootcamp React & Node.js",
    url: "https://images.pexels.com/photos/1181354/pexels-photo-1181354.jpeg",
    description:
      "Atelier pratique sur le développement d’applications avec React et Node.js.",
    date: "20/10/2025",
    localisation: "Bafoussam",
  },
];

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
