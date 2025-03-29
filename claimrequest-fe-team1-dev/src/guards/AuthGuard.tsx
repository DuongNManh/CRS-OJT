import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "@/contexts/AuthContext";
import { SystemRole } from "@/interfaces/auth.interface";

interface Props {
  allowedRoles?: SystemRole[]; // Array of allowed roles
  redirectPath?: string; // Customizable redirect path
}

export const ProtectedRoute: React.FC<Props> = ({
  allowedRoles = [
    SystemRole.ADMIN,
    SystemRole.APPROVER,
    SystemRole.STAFF,
    SystemRole.FINANCE,
  ], // Default to all roles
  redirectPath = "/",
}) => {
  const { isAuthenticated, userDetails } = useAuth();
  const location = useLocation();

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Check if user's role is in the allowed roles
  const hasAccess =
    userDetails?.systemRole !== undefined
      ? allowedRoles.includes(userDetails.systemRole as SystemRole)
      : false;

  // If user doesn't have access, redirect
  if (!hasAccess) {
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};

export const RejectedRoute = () => {
  const { isAuthenticated } = useAuth(); // Check if user is logged in
  const location = useLocation(); // Get current location information

  return !isAuthenticated ? (
    // If NOT authenticated, render child routes (login/signup pages)
    <Outlet />
  ) : (
    // If ALREADY authenticated, redirect to:
    // 1. The page user was trying to access before login (if exists)
    // 2. Home page (if no previous location)
    <Navigate to={location.state?.from ?? "/"} replace />
  );
};
