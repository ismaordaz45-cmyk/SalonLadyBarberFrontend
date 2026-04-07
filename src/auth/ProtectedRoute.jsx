import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getStoredUser, getHomeByRole } from "./session";

function ProtectedRoute({ allowedRoles = [], children }) {
  const location = useLocation();
  const user = getStoredUser();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!allowedRoles.includes(user.rol)) {
    return <Navigate to={getHomeByRole(user.rol)} replace />;
  }

  return children;
}

export default ProtectedRoute;

