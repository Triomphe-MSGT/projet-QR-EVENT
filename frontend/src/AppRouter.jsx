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
import UserQrCodesPage from "./pages/participant/UserQrCodesPage";

// Pages Organisateur
import EventForm from "./pages/organizer/CreateEventPage";
import OrganizerProfile from "./pages/organizer/ProfilOrganisateur";
import DashboardPage from "./pages/organizer/DashboardPage";

// Autres imports
// import AdminDashboard from "../pages/admin/AdminDashboard";
import RoleRouter from "./routes/RoleRouter";
import PrivateRoute from "./routes/PrivateRoute";
import Unauthorized from "./pages/Unauthorized";
import ProfilePage from "./pages/ProfilePage";
import AuthFormRegisterConnection from "./components/ui/AuthFormRegisterConnection ";
import AdminDashboard from "./components/admin/AdminDashboard";
import ScanQrPage from "./pages/organizer/ScanQrPage";
import SettingsPage from "./pages/AccountSettingsPage";
import HelpPage from "./pages/HelpPage";
import AccountSettingsPage from "./pages/AccountSettingsPage";

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        {/* Routes publiques */}
        <Route path="/home" element={<HomePage />} />
        <Route path="/" element={<OpenPage />} />
        <Route path="/login" element={<AuthFormRegisterConnection />} />
        <Route path="/user-profile" element={<ProfilePage />} />
        <Route path="/events" element={<EventListPage />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/qrevent_help" element={<HelpPage />} />

        {/* Routes protégées */}
        <Route
          path="/my-qrcodes"
          element={
            <PrivateRoute
              allowedRoles={["Participant", "Organisateur", "Administrateur"]}
            >
              <UserQrCodesPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/scan"
          element={
            <PrivateRoute allowedRoles={["Organisateur", "Administrateur"]}>
              <ScanQrPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute allowedRoles={["Organisateur", "Administrateur"]}>
              <DashboardPage />
            </PrivateRoute>
          }
        />
        <Route path="/categories/:name" element={<EventListPage />} />
        <Route path="/events/:id" element={<EventDetailsPage />} />

        {/* Routes Organisateur */}
        <Route
          path="/createevent"
          element={
            <PrivateRoute allowedRoles={["Organisateur", "Administrateur"]}>
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

        <Route
          path="/admin"
          element={
            <PrivateRoute allowedRoles={["Administrateur"]}>
              <AdminDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/account-settings"
          element={
            <PrivateRoute
              allowedRoles={["Participant", "Organisateur", "Administrateur"]}
            >
              <AccountSettingsPage />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default AppRouter;
