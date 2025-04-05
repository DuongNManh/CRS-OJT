import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAppSelector } from "@/services/store/store";
import { clearUser } from "@/services/store/authSlice";
import { isTokenExpired } from "@/utils/tokenUtils";
import { toast } from "react-toastify";
import { cacheService } from "@/services/features/cacheService";
import { useTranslation } from "react-i18next";

interface AuthGuardProps {
  children: ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { t } = useTranslation();

  // Check if the token is expired
  if (isTokenExpired()) {
    // Clear user state and cache
    clearUser();
    cacheService.clear(); // Clear all cache data when session expires
    toast.dismiss();
    toast.error(t("session_expired"));
    return <Navigate to="/login" />;
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}
