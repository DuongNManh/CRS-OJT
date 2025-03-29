import { authService } from "@/services/features/auth.service"; // API service for login
import { clearUser } from "@/services/store/authSlice";
import { useAppDispatch } from "@/services/store/store";
import { AuthLoginData } from "@/types/auth.types";
import { UserResponse } from "@/types/user.types";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

interface AuthContextType {
  isAuthenticated: boolean;
  isInitialized: boolean;
  authData: AuthLoginData | null;
  userDetails: UserResponse | null;
  authLogin: (email: string, password: string) => Promise<UserResponse | null>;
  authLogout: () => void;
  getToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [authData, setAuthData] = useState<AuthLoginData | null>(null);
  const [userDetails, setUserDetails] = useState<UserResponse | null>(null);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const checkTokenExpiration = () => {
    const token = localStorage.getItem("token");
    const expiration = localStorage.getItem("tokenExpiration");

    if (!token || !expiration) {
      authLogout();
      return false;
    }
    const expirationDate = new Date(expiration);
    if (new Date() > expirationDate) {
      authLogout();
      return false;
    }
    return true;
  };

  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = localStorage.getItem("token");
        const userDetails = localStorage.getItem("userDetails");

        if (token && userDetails) {
          if (!checkTokenExpiration()) {
            setIsInitialized(true);
            return;
          }
          setIsAuthenticated(true);
          setUserDetails(JSON.parse(userDetails));
        }
      } catch (error) {
        console.error("Failed to initialize auth:", error);
      } finally {
        setIsInitialized(true);
      }
    };

    initializeAuth();

    const expirationCheckInterval = setInterval(() => {
      if (isAuthenticated) {
        checkTokenExpiration();
      }
    }, 60000);

    return () => {
      clearInterval(expirationCheckInterval);
    };
  }, [isAuthenticated]);

  const authLogin = async (
    email: string,
    password: string,
  ): Promise<UserResponse | null> => {
    try {
      const response = await authService.login({ email, password }); // API call moved here

      if (response.is_success && response.data) {
        const { token, user, expiration } = response.data;

        // Store token and user details in localStorage
        localStorage.setItem("token", token);
        localStorage.setItem("tokenExpiration", expiration);
        localStorage.setItem("userDetails", JSON.stringify(user));

        setIsAuthenticated(true);
        setAuthData(response.data);
        setUserDetails(user);

        toast.success("Login successful");
        return user;
      } else {
        toast.error(response.message || "Login failed");
        return null;
      }
    } catch (error) {
      const errorMessage = (error as Error).message || "An error occurred";
      toast.error(errorMessage);
      return null;
    }
  };

  const authLogout = async () => {
    try {
      await authService.logout();
      setIsAuthenticated(false);
      setAuthData(null);
      setUserDetails(null);
      localStorage.removeItem("token");
      localStorage.removeItem("tokenExpiration");
      localStorage.removeItem("userDetails");
      dispatch(clearUser());
      toast.success("Logged out successfully");
      navigate("/");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const getToken = () => {
    if (isAuthenticated && checkTokenExpiration()) {
      return localStorage.getItem("token");
    }
    return null;
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isInitialized,
        authData,
        userDetails,
        authLogin,
        authLogout,
        getToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
