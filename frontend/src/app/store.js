import { configureStore } from '@reduxjs/toolkit'
import eventReducer from '../slices/eventSlice.js'
import userProfileSlice from '../services/userProfile.js'
import authReducer from '../slices/authSlice.js'

export const store = configureStore({
  reducer: {
    events: eventReducer,
    UserProfile: userProfileSlice,
    auth: authReducer,
  },
})
