import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

import OrganizerProfile from "../pages/organizer/ProfilOrganisateur";
import HomePage from "../pages/participant/HomePage";
// import AdminDashboard from "../pages/admin/AdminDashboard";

const RoleRouter = () => {
  const { user } = useSelector((state) => state.auth);

  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case "organizer":
      return <OrganizerProfile />;
    // case "admin":
    //   return <AdminDashboard />;
    case "user":
    default:
      return <HomePage />;
  }
};

export default RoleRouter;
