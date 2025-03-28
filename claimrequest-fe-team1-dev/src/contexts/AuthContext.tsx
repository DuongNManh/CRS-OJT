import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AuthLoginData } from "@/types/auth.types";
import { doExtractUserFromToken } from "@/apis/auth.apis";
import { UserResponse } from "@/types/user.types";

interface AuthContextType {
  isAuthenticated: boolean;
  isInitialized: boolean;
  authData: AuthLoginData | null;
  userDetails: UserResponse | null;
  authLogin: (userData: AuthLoginData) => Promise<UserResponse | null>;
  authLogout: () => void;
  getToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [authData, setAuthData] = useState<AuthLoginData | null>(null); // Store token-related info
  const [userDetails, setUserDetails] = useState<UserResponse | null>(null); // Store user-related info
  const navigate = useNavigate();

  // Check token expiration
  const checkTokenExpiration = () => {
    const expiresTimestamp = localStorage.getItem("token");
    if (expiresTimestamp) {
      const expiresDate = new Date(expiresTimestamp);
      const currentDate = new Date();

      if (currentDate > expiresDate) {
        console.log("Token expired, logging out");
        authLogout();
        return false;
      }
    }
    return true;
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          // Check if token is expired before proceeding
          if (!checkTokenExpiration()) {
            setIsInitialized(true);
            return;
          }

          // Extract user details from token
          const { data } = await doExtractUserFromToken(token);

          console.log(`User details: ${JSON.stringify(data, null, 2)}`);

          if (data) {
            setIsAuthenticated(true);
            setUserDetails(data); // Set user details from token
          }
        }
      } catch (error) {
        console.error("Failed to initialize auth:", error);
      } finally {
        setIsInitialized(true);
      }
    };

    initializeAuth();

    // Set up interval to check token expiration regularly
    const expirationCheckInterval = setInterval(() => {
      if (isAuthenticated) {
        checkTokenExpiration();
      }
    }, 60000); // Check every minute

    return () => {
      clearInterval(expirationCheckInterval);
    };
  }, [isAuthenticated]);

  const authLogin = async (
    loginData: AuthLoginData,
  ): Promise<UserResponse | null> => {
    if (!loginData) {
      console.error("Invalid login data");
      return null;
    }

    try {
      // Set login state and store token
      setIsAuthenticated(true);
      setAuthData(loginData);

      // Store token and expiration in cookies
      localStorage.setItem("token", loginData.token);
      localStorage.setItem("tokenExpiration", loginData.tokenExpiration);

      // Extract and store user details
      const { data } = await doExtractUserFromToken(loginData.token);
      if (data) {
        setUserDetails(data);
        return data;
      }
      return null;
    } catch (error) {
      console.error("Error during login:", error);
      return null;
    }
  };

  const authLogout = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        // await doLogout(token);
      } catch (error) {
        console.error("Error during logout:", error);
      }

      setIsAuthenticated(false);
      setAuthData(null);
      setUserDetails(null); // Clear the user details on logout
      localStorage.setItem("token", "");
      localStorage.setItem("tokenExpiration", "");

      toast.success("Đăng xuất thành công");
      navigate("/");
    }
  };

  const getToken = () => {
    // Check if token is valid before returning it
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
