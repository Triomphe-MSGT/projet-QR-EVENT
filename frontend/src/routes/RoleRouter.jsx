import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const RoleRouter = () => {
  const { user } = useSelector((state) => state.auth);

  if (!user) return null;

  switch (user.role) {
    case "Organisateur":
      return <Navigate to="/createevent" replace />;
    case "Administrateur":
      return <Navigate to="/admin" replace />;
    default:
      return <Navigate to="/" replace />;
  }
};

export default RoleRouter;
