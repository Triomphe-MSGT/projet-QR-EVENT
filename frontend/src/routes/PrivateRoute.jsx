import React from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, token } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!user || !token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const userRole = user.role?.toLowerCase();
  const rolesAutorises = allowedRoles.map((r) => r.toLowerCase());

  if (!rolesAutorises.includes(userRole)) {
    console.error(`[ERROR] Accès refusé à ${user.email}, rôle : ${user.role}`);
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default PrivateRoute;
