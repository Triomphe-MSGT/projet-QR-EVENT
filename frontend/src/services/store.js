import { configureStore } from '@reduxjs/toolkit'

import userProfileSlice from './userProfile'
export const store = configureStore({
  reducer: {
    // La clé 'userProfile' définit comment l'état sera structuré dans le magasin [3, 13]
    UserProfile: userProfileSlice,
  },
})
