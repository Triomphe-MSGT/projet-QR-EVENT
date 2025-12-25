// src/routes/AppRouter.jsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Pages publiques
import OpenPage from "../pages/participant/OpenPage";

// Pages participant
import HomePage from "../pages/participant/HomePage";
import EventListPage from "../pages/participant/EventListPage";
import EventDetailsPage from "../pages/participant/EventDetailsPage";
import UserQrCodesPage from "../pages/participant/UserQrCodesPage";
import AdvancedFilterPage from "../pages/participant/AdvancedFilterPage";
import PastEventsPage from "../pages/participant/PastEventsPage";

// Pages Organisateur
import EventForm from "../pages/organizer/CreateEventPage";
import OrganizerProfile from "../pages/organizer/ProfilOrganisateur";
import DashboardPage from "../pages/organizer/DashboardPage";

// Autres imports
// import AdminDashboard from "../pages/admin/AdminDashboard";
import RoleRouter from "./RoleRouter";
import PrivateRoute from "./PrivateRoute";
import Unauthorized from "../pages/public/Unauthorized";
import ProfilePage from "../pages/user/ProfilePage";
import AuthFormRegisterConnection from "../features/auth/components/AuthForm";
import AdminDashboard from "../features/admin/components/AdminDashboard";
import ScanQrPage from "../pages/organizer/ScanQrPage";
import SettingsPage from "../pages/user/AccountSettingsPage";
import HelpPage from "../pages/public/HelpPage";
import AccountSettingsPage from "../pages/user/AccountSettingsPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "../pages/auth/ResetPasswordPage";

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        {/* Routes publiques */}
        <Route path="/home" element={<HomePage />} />
        <Route path="/" element={<OpenPage />} />
        <Route path="/login" element={<AuthFormRegisterConnection />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="/user-profile" element={<ProfilePage />} />
        <Route path="/events" element={<EventListPage />} />
        <Route path="/past-events" element={<PastEventsPage />} />
        <Route path="/filters" element={<AdvancedFilterPage />} />
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
