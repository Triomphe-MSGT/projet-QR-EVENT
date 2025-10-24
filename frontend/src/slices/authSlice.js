import { createSlice } from "@reduxjs/toolkit";

// 1. Essayer de lire depuis le localStorage au démarrage
const user = JSON.parse(localStorage.getItem("user"));
const token = localStorage.getItem("token");

const initialState = {
  // 2. Remplir l'état initial si les données existent
  user: user ? user : null,
  token: token ? token : null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // 3. Quand on se connecte, on met à jour le state ET le localStorage
    login: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      // Écrire dans le localStorage
      localStorage.setItem("user", JSON.stringify(action.payload.user));
      localStorage.setItem("token", action.payload.token);
    },
    // 4. Quand on se déconnecte, on vide le state ET le localStorage
    logout: (state) => {
      state.user = null;
      state.token = null;
      // Vider le localStorage
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
