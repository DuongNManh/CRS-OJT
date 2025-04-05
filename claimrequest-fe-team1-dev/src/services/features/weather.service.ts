import { useState, useEffect } from 'react';

interface WeatherData {
  temperature: number | null;
  feelsLike: number | null;
  description: string;
  humidity: number;
  windSpeed: number;
  airQuality: number;
  forecast: Array<{
    day: string;
    temp: number;
    condition: string;
  }>;
  location: string;
  isLoading: boolean;
  error: string | null;
}

const initialWeatherData: WeatherData = {
  temperature: null,
  feelsLike: null,
  description: '',
  humidity: 0,
  windSpeed: 0,
  airQuality: 0,
  forecast: [],
  location: '',
  isLoading: true,
  error: null
};

export const useWeatherData = () => {
  const [weatherData, setWeatherData] = useState<WeatherData>(initialWeatherData);
  const [location, setLocation] = useState<string>('HoChiMinh');
  const [geoError, setGeoError] = useState<string | null>(null);
  const [coords, setCoords] = useState<{lat: number, lon: number} | null>(null);
  const [isUsingCurrentLocation, setIsUsingCurrentLocation] = useState<boolean>(false);

  // Get user's geolocation
  useEffect(() => {
    if (navigator.geolocation) {
      setGeoError(null);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
          setIsUsingCurrentLocation(true);
        },
        (error) => {
          console.error('Geolocation error:', error);
          setGeoError('Không thể lấy vị trí của bạn. Sử dụng vị trí mặc định.');
        }
      );
    } else {
      setGeoError('Trình duyệt của bạn không hỗ trợ định vị.');
    }
  }, []);

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        setWeatherData(prev => ({ ...prev, isLoading: true, error: null }));
        
        // Construct URL based on whether we have coordinates or location name
        let url = '';
        if (isUsingCurrentLocation && coords) {
          url = `https://wttr.in/${coords.lat},${coords.lon}?format=j1`;
        } else {
          url = `https://wttr.in/${encodeURIComponent(location)}?format=j1`;
        }
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error('Failed to fetch weather data');
        }
        
        const data = await response.json();
        
        // Extract current weather
        const current = data.current_condition[0];
        const forecast = data.weather.slice(0, 4).map((day: any, index: number) => {
          const weekdays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
          const date = new Date();
          date.setDate(date.getDate() + index);
          const dayOfWeek = weekdays[date.getDay()];
          
          return {
            day: dayOfWeek,
            temp: parseInt(day.avgtempC),
            condition: day.hourly[4].weatherDesc[0].value // Mid-day condition
          };
        });

        // Get location name
        const locationName = data.nearest_area[0]?.areaName[0]?.value || 
                            data.nearest_area[0]?.region[0]?.value || 
                            location;

        setWeatherData({
          temperature: parseInt(current.temp_C),
          feelsLike: parseInt(current.FeelsLikeC),
          description: current.weatherDesc[0].value,
          humidity: parseInt(current.humidity),
          windSpeed: parseInt(current.windspeedKmph),
          airQuality: Math.floor(Math.random() * 50) + 30, // API doesn't provide AQI, this is a placeholder
          forecast,
          location: locationName,
          isLoading: false,
          error: null
        });
      } catch (error) {
        console.error('Error fetching weather data:', error);
        setWeatherData(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to fetch weather data. Using fallback data.',
          // Fallback data if API fails
          temperature: 28,
          feelsLike: 30,
          description: 'Nắng nhẹ',
          humidity: 75,
          windSpeed: 8,
          airQuality: 42,
          forecast: [
            { day: "T7", temp: 29, condition: "Sunny" },
            { day: "CN", temp: 27, condition: "Rainy" },
            { day: "T2", temp: 26, condition: "Cloudy" },
            { day: "T3", temp: 28, condition: "Sunny" },
          ],
        }));
      }
    };

    fetchWeatherData();
    
    // Set up a refresh interval (every 30 minutes)
    const intervalId = setInterval(fetchWeatherData, 30 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [location, coords, isUsingCurrentLocation]);

  // Function to allow changing the location
  const updateLocation = (newLocation: string) => {
    setLocation(newLocation);
    setIsUsingCurrentLocation(false);
  };

  // Function to use current location
  const useCurrentLocation = () => {
    if (coords) {
      setIsUsingCurrentLocation(true);
    } else {
      // Try to get location again if we don't have it
      if (navigator.geolocation) {
        setGeoError(null);
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setCoords({
              lat: position.coords.latitude,
              lon: position.coords.longitude
            });
            setIsUsingCurrentLocation(true);
          },
          (error) => {
            console.error('Geolocation error:', error);
            setGeoError('Không thể lấy vị trí của bạn. Sử dụng vị trí mặc định.');
          }
        );
      }
    }
  };

  return { 
    weatherData, 
    updateLocation, 
    useCurrentLocation, 
    isUsingCurrentLocation, 
    geoError 
  };
};
