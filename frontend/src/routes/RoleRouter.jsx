import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const RoleRouter = () => {
  const { user } = useSelector((state) => state.auth);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Utilise les rôles de ton backend
  switch (user.role) {
    case "Organisateur":
      return <Navigate to="/createevent" replace />;
    case "Participant":
      return <Navigate to="/home" replace />;
    case "administrateur":
      return <Navigate to="/admin" replace />; // (Pour le futur)
    default:
      return <Navigate to="/" replace />;
  }
};

export default RoleRouter;
