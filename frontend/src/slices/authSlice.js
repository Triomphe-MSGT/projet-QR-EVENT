import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  users: [], // liste des événements
  currentUser: null, // événement sélectionné pour édition

  participantCount: 0,
}

const generateId = () => Number((Math.random() * 1000000).toFixed(0))

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    login: (state, action) => {
      state.users = action.payload.user
    },
    logout: (state) => {
      state.users = null
    },
    addUser(state, action) {
      const newUser = action.payload
      state.push({
        id: generateId(),
        ...newUser,
      })
    },
    updateUser(state, action) {
      const updatedUser = action.payload
      const index = state.findIndex((user) => user.id === updatedUser.id)

      if (index !== -1) {
        state[index] = { ...state[index], ...updatedUser }
      }
    },
    deleteUser(state, action) {
      const id = action.payload
      return state.filter((user) => user.id !== id)
    },
    setCurrentUser(state, action) {
      state.currentUser = action.payload
    },
    setUsers(state, action) {
      state.users = action.payload
    },
    incrementParticipant: (state) => {
      state.participantCount += 1
    },
  },
})

export const {
  addUser,
  updateUser,
  deleteUser,
  setUsers,
  setCurrentUser,
  incrementParticipant,
} = usersSlice.actions
export default usersSlice.reducer
