"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaSearch, FaSync, FaSun, FaMoon } from "react-icons/fa";

const WeatherForecastViewer = () => {
  const [city, setCity] = useState("London"); // Default city
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [unit, setUnit] = useState("metric"); // metric (C) or imperial (F)
  const [forecastDays, setForecastDays] = useState(5); // Number of days to display

  // Replace with your OpenWeatherMap API key
  const API_KEY = "YOUR_API_KEY_HERE"; // Get from https://openweathermap.org/
  const API_URL = "https://api.openweathermap.org/data/2.5/forecast";

  const fetchWeather = useCallback(
    async (cityName) => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(
          `${API_URL}?q=${cityName}&units=${unit}&appid=${API_KEY}`
        );
        if (!response.ok) throw new Error("City not found or API error");
        const data = await response.json();
        setWeatherData(data);
      } catch (err) {
        setError(err.message || "Failed to fetch weather data");
        setWeatherData(null);
      } finally {
        setLoading(false);
      }
    },
    [unit]
  );

  // Fetch weather on mount with default city
  useEffect(() => {
    fetchWeather(city);
  }, [fetchWeather]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchWeather(city);
  };

  const reset = () => {
    setCity("London");
    setUnit("metric");
    setForecastDays(5);
    fetchWeather("London");
  };

  // Format date from timestamp
  const formatDate = (dt) => {
    return new Date(dt * 1000).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  // Get temperature unit symbol
  const tempUnit = unit === "metric" ? "°C" : "°F";

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Weather Forecast Viewer
        </h1>

        {/* Search and Settings */}
        <div className="mb-6">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Enter city name"
              className="flex-1 p-3 border rounded-md focus:ring-2 focus:ring-blue-500 text-gray-700"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition-colors flex items-center justify-center"
            >
              <FaSearch className="mr-2" />
              {loading ? "Loading..." : "Get Forecast"}
            </button>
            <button
              onClick={reset}
              className="px-4 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </form>

          {/* Settings */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Temperature Unit
              </label>
              <select
                value={unit}
                onChange={(e) => {
                  setUnit(e.target.value);
                  fetchWeather(city);
                }}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="metric">Celsius (°C)</option>
                <option value="imperial">Fahrenheit (°F)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Forecast Days ({forecastDays})
              </label>
              <input
                type="range"
                min="1"
                max="5"
                value={forecastDays}
                onChange={(e) => setForecastDays(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Weather Display */}
        {weatherData && (
          <div className="space-y-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-center">
              {forecastDays}-Day Forecast for {weatherData.city.name},{" "}
              {weatherData.city.country}
            </h2>
            <div
              className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-${Math.min(
                forecastDays,
                5
              )} gap-4`}
            >
              {weatherData.list
                .filter((_, index) => index % 8 === 0) // One forecast per day
                .slice(0, forecastDays)
                .map((forecast, index) => {
                  const isDay = forecast.dt_txt.includes("12:00:00"); // Rough day/night check
                  return (
                    <div
                      key={index}
                      className="bg-gray-50 p-4 rounded-lg text-center shadow-sm hover:shadow-md transition-shadow"
                    >
                      <p className="font-medium text-gray-700">{formatDate(forecast.dt)}</p>
                      <div className="flex justify-center items-center my-2">
                        {isDay ? (
                          <FaSun className="text-yellow-500 mr-2" />
                        ) : (
                          <FaMoon className="text-gray-500 mr-2" />
                        )}
                        <img
                          src={`http://openweathermap.org/img/wn/${forecast.weather[0].icon}.png`}
                          alt={forecast.weather[0].description}
                          className="w-12 h-12"
                        />
                      </div>
                      <p className="text-lg font-semibold text-gray-800">
                        {Math.round(forecast.main.temp)}
                        {tempUnit}
                      </p>
                      <p className="text-sm text-gray-600 capitalize">
                        {forecast.weather[0].description}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        High: {Math.round(forecast.main.temp_max)}
                        {tempUnit} | Low: {Math.round(forecast.main.temp_min)}
                        {tempUnit}
                      </p>
                      <p className="text-xs text-gray-500">
                        Humidity: {forecast.main.humidity}%
                      </p>
                      <p className="text-xs text-gray-500">
                        Wind: {Math.round(forecast.wind.speed)}{" "}
                        {unit === "metric" ? "m/s" : "mph"}
                      </p>
                    </div>
                  );
                })}
            </div>

            {/* Additional Info */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                Sunrise:{" "}
                {new Date(weatherData.city.sunrise * 1000).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              <p className="text-sm text-gray-600">
                Sunset:{" "}
                {new Date(weatherData.city.sunset * 1000).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <p className="text-center text-red-600 p-4 bg-red-50 rounded-lg">{error}</p>
        )}

        {/* Loading State */}
        {loading && !weatherData && (
          <div className="text-center p-6">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading weather data...</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>5-day forecast with customizable days</li>
            <li>Switch between Celsius and Fahrenheit</li>
            <li>Detailed weather info: temp, humidity, wind</li>
            <li>Sunrise and sunset times</li>
            <li>Day/night indicators</li>
          </ul>
          
        </div>
      </div>
    </div>
  );
};

export default WeatherForecastViewer;