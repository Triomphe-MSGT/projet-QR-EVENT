// src/routes/AppRouter.jsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Pages publiques

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
import ProfilePage from "./pages/ProfilePage";
import AuthFormRegisterConnection from "./components/ui/AuthFormRegisterConnection ";
import UserQrCodesPage from "./pages/participant/UserQrCodesPage";

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        {/* Routes publiques */}
        <Route path="/" element={<OpenPage />} />
        <Route path="/login" element={<AuthFormRegisterConnection />} />
        <Route path="/user-profile" element={<ProfilePage />} />
        <Route path="/events" element={<EventListPage />} />

        {/* Routes protégées */}
        <Route
          path="/my-qrcodes"
          element={
            <PrivateRoute
              allowedRoles={["Participant", "Organisateur", "administrateur"]}
            >
              <UserQrCodesPage />
            </PrivateRoute>
          }
        />
        <Route path="/home" element={<HomePage />} />
        <Route
          path="/categories/:name"
          element={
            <PrivateRoute
              allowedRoles={["Participant", "Organisateur", "administrateur"]}
            >
              <EventListPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/events/:id"
          element={
            <PrivateRoute
              allowedRoles={["Participant", "Organisateur", "administrateur"]}
            >
              <EventDetailsPage />
            </PrivateRoute>
          }
        />

        {/* Routes organisateur */}
        <Route
          path="/createevent"
          element={
            <PrivateRoute allowedRoles={["Organisateur", "administrateur"]}>
              <EventForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/organizer"
          element={
            <PrivateRoute allowedRoles={["Organisateur"]}>
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
