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
import SettingsPage from "./pages/SettingsPage";

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

        <Route
          path="/scan-qrcode"
          element={
            <PrivateRoute allowedRoles={["Organisateur", "administrateur"]}>
              <ScanQrPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute allowedRoles={["Organisateur", "administrateur"]}>
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

        <Route
          path="/admin"
          element={
            <PrivateRoute allowedRoles={["administrateur"]}>
              <AdminDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/account-settings"
          element={
            <PrivateRoute
              allowedRoles={["administrateur", "Organisateur", "Participant"]}
            >
              <SettingsPage />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default AppRouter;
