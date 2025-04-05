import axios from "axios";
import { BASE_URL } from "./apiConfig";
import { authService } from "@/services/features/auth.service";
import i18n from "@/i18n";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
});

// Add a request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Add auth token
    const token = authService.getToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    // Add language header
    const currentLanguage = i18n.language || localStorage.getItem("language") || "en";
    config.headers["Accept-Language"] = currentLanguage;

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default axiosInstance;
