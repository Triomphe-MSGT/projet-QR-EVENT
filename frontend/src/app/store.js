import { configureStore } from "@reduxjs/toolkit";
import eventReducer from "../reducer/eventSlice.js";

const store = configureStore({
  reducer: {
    events: eventReducer,
  },
});

export default store;
