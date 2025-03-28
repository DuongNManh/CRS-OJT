export const isTokenExpired = (): boolean => {
  const expiration = localStorage.getItem('tokenExpiration');
  if (!expiration) return true; // No expiration time means token is expired

  const currentTime = Date.now();
  return currentTime >= new Date(expiration).getTime(); // Check if current time is greater than or equal to expiration time
}; 