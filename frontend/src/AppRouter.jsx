// src/routes/AppRouter.jsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Pages publiques

import AuthFormRegister from "./components/ui/AuthFormRegister";
import AuthFormRegisterConnection from "./components/ui/AuthFormConnection";
import OpenPage from "./pages/participant/OpenPage";
// Pages participant
import HomePage from "./pages/participant/HomePage";
import EventListPage from "./pages/participant/EventListPage";
import EventDetailsPage from "./pages/participant/EventDetailsPage";

// Pages organisateur
import EventForm from "./pages/organizer/CreateEventPage";
// Page admin
// import AdminDashboard from "../pages/admin/AdminDashboard";

import RoleRouter from "./routes/RoleRouter";
import OrganizerProfile from "./pages/organizer/ProfilOrganisateur";
import PrivateRoute from "./routes/PrivateRoute";
import Unauthorized from "./pages/Unauthorized";
import { ThemeProvider } from "./context/ThemeContext";

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        {/* Routes publiques */}
        <Route path="/" element={<OpenPage />} />
        <Route path="/register" element={<AuthFormRegister />} />
        <Route path="/login" element={<AuthFormRegisterConnection />} />

        {/* Routes protégées */}
        <Route
          path="/home"
          element={
            <PrivateRoute allowedRoles={["user", "organizer", "admin"]}>
              <HomePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/categories/:name"
          element={
            <PrivateRoute allowedRoles={["user", "organizer", "admin"]}>
              <EventListPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/events/:id"
          element={
            <PrivateRoute allowedRoles={["user", "organizer", "admin"]}>
              <EventDetailsPage />
            </PrivateRoute>
          }
        />

        {/* Routes organisateur */}
        <Route
          path="/createevent"
          element={
            <PrivateRoute allowedRoles={["organizer"]}>
              <EventForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/organizer"
          element={
            <PrivateRoute allowedRoles={["organizer"]}>
              <OrganizerProfile />
            </PrivateRoute>
          }
        />

        {/* Route dynamique par rôle */}
        <Route path="/dashboard" element={<RoleRouter />} />

        {/* Route fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
