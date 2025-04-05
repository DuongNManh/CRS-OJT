// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { motion } from "framer-motion";
import {
  WiDaySunny,
  WiRain,
  WiCloudy,
  WiThunderstorm,
  WiDayHaze,
  WiFog,
  WiSnow,
} from "react-icons/wi";
import { useWeatherData } from "@/services/features/weather.service";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const getWeatherIcon = (condition: string) => {
  const conditionLower = condition.toLowerCase();
  if (
    conditionLower.includes("rain") ||
    conditionLower.includes("drizzle") ||
    conditionLower.includes("shower")
  )
    return <WiRain className="text-6xl text-yellow-300 mx-auto" />;
  if (conditionLower.includes("cloud") || conditionLower.includes("overcast"))
    return <WiCloudy className="text-6xl text-gray-300 mx-auto" />;
  if (conditionLower.includes("thunder") || conditionLower.includes("storm"))
    return <WiThunderstorm className="text-6xl text-yellow-500 mx-auto" />;
  if (conditionLower.includes("fog") || conditionLower.includes("mist"))
    return <WiFog className="text-6xl text-gray-400 mx-auto" />;
  if (conditionLower.includes("haze") || conditionLower.includes("smoke"))
    return <WiDayHaze className="text-6xl text-yellow-200 mx-auto" />;
  if (
    conditionLower.includes("snow") ||
    conditionLower.includes("sleet") ||
    conditionLower.includes("ice")
  )
    return <WiSnow className="text-6xl text-blue-200 mx-auto" />;
  return <WiDaySunny className="text-6xl text-yellow-300 mx-auto" />;
};

const WeatherTable = () => {
  const { t } = useTranslation();
  const {
    weatherData,
    updateLocation,
    useCurrentLocation,
    isUsingCurrentLocation,
    geoError,
  } = useWeatherData();

  const {
    temperature,
    feelsLike,
    description,
    humidity,
    windSpeed,
    location,
    isLoading,
  } = weatherData;

  const [searchLocation, setSearchLocation] = useState<string>("");
  const [showSearch, setShowSearch] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchLocation.trim()) {
      updateLocation(searchLocation);
      setShowSearch(false);
    }
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-purple-600 via-purple-500 to-indigo-400 text-white rounded-3xl p-6 shadow-lg h-2/3 w-1/3 flex items-center justify-center dark:from-purple-700 dark:via-purple-600 dark:to-indigo-600"
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
          <p>{t("weather_table.loading")}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.03 }}
      className="bg-gradient-to-br from-purple-600 via-purple-500 to-indigo-400 text-white rounded-3xl shadow-xl h-2/3 w-1/3 mx-auto pl-6 pr-6 flex flex-col justify-around dark:from-purple-700 dark:via-purple-600 dark:to-indigo-600"
    >
      {/* Search Section */}
      <div className="flex items-center justify-stretch mb-4">
        <input
          type="text"
          value={searchLocation}
          onChange={(e) => setSearchLocation(e.target.value)}
          placeholder={t("weather_table.search_placeholder")}
          className="flex-1 p-2 text-gray-800 text-sm focus:ring-1 focus:ring-purple-300 outline-none rounded-xl"
        />
        <button
          onClick={handleSubmit}
          className="ml-2 text-purple-500 px-3 py-2 rounded-lg transition-colors text-sm font-medium"
        >
          🔍
        </button>
        <button
          onClick={useCurrentLocation}
          className="ml-2 text-purple-500 px-3 py-2 rounded-lg transition-colors text-sm font-medium"
        >
          📍
        </button>
      </div>

      {/* Weather Icon and Temperature */}
      <div className="text-center">
        {getWeatherIcon(description)}
        <div className="text-5xl font-bold mt-4">{temperature}°C</div>
        <div className="text-lg capitalize mt-2">{description}</div>
        <div className="text-sm opacity-80 mt-1">{location}</div>
      </div>

      {/* Weather Details */}
      <div className="flex justify-between items-center mt-6">
        <div className="flex flex-col items-center">
          <WiDaySunny className="text-3xl text-yellow-300" />
          <div className="text-sm mt-1">{t("weather_table.humidity")}</div>
          <div className="font-bold">{humidity}%</div>
        </div>
        <div className="flex flex-col items-center">
          <WiCloudy className="text-3xl text-gray-300" />
          <div className="text-sm mt-1">{t("weather_table.wind_speed")}</div>
          <div className="font-bold">{windSpeed} km/h</div>
        </div>
        <div className="flex flex-col items-center">
          <WiDaySunny className="text-3xl text-yellow-300" />
          <div className="text-sm mt-1">{t("weather_table.feels_like")}</div>
          <div className="font-bold">{feelsLike}°C</div>
        </div>
      </div>
    </motion.div>
  );
};

export default WeatherTable;
