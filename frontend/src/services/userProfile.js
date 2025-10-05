import { createSlice } from '@reduxjs/toolkit'

// État initial pour le profil utilisateur [5]
const initialState = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  events: [
    {
      title: 'conference sur l IA',
      date: '15 octobre 2025',
    },
    {
      title: 'conference sur l IA',
      date: '15 octobre 2025',
    },
  ],
}

const userProfileSlice = createSlice({
  name: 'userProfile', // Préfixe pour les types d'actions, ex: 'userProfile/updateName' [10]
  initialState,
  reducers: {
    // Réducteur pour mettre à jour le nom [5]
    updateName(state, action) {
      // action.payload contiendra le nouveau nom [11]
      state.name = action.payload.name
    },
    updateEmail(state, action) {
      state.email = action.payload.email
    },
  },
})

// Exporter les créateurs d'actions générés automatiquement [10, 12]
export const { updateName } = userProfileSlice.actions
export const { updateEmail } = userProfileSlice.actions

// Exporter le réducteur [10]
export default userProfileSlice.reducer
