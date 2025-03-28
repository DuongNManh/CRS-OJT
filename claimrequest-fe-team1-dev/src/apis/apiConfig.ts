const devUrl = "https://localhost:5001/api/v1/";
const prodUrl = "https://crsojt.azurewebsites.net/api/v1/";

// Check if we're in production environment
const isProd = process.env.NODE_ENV === "production";

// Set BASE_URL based on environment
export const BASE_URL = isProd ? prodUrl : devUrl;

const apiConfig = {
  BASE_URL: isProd ? prodUrl : devUrl,
};

export default apiConfig;
