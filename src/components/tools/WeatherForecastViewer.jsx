// components/WeatherForecastViewer.js
'use client';

import React, { useState, useEffect } from 'react';

const WeatherForecastViewer = () => {
  const [city, setCity] = useState('London'); // Default city
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Replace with your OpenWeatherMap API key
  const API_KEY = 'YOUR_API_KEY_HERE';
  const API_URL = 'https://api.openweathermap.org/data/2.5/forecast';

  const fetchWeather = async (cityName) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(
        `${API_URL}?q=${cityName}&units=metric&appid=${API_KEY}`
      );
      if (!response.ok) throw new Error('City not found');
      const data = await response.json();
      setWeatherData(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch weather data');
      setWeatherData(null);
    } finally {
      setLoading(false);
    }
  };

  // Fetch weather on mount with default city
  useEffect(() => {
    fetchWeather(city);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchWeather(city);
  };

  // Format date from timestamp
  const formatDate = (dt) => {
    return new Date(dt * 1000).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Weather Forecast Viewer</h1>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-6 flex gap-2">
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter city name"
          className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
        >
          {loading ? 'Loading...' : 'Get Forecast'}
        </button>
      </form>

      {/* Weather Display */}
      {weatherData && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-center">
            5-Day Forecast for {weatherData.city.name}, {weatherData.city.country}
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            {weatherData.list
              .filter((_, index) => index % 8 === 0) // Show one forecast per day (every 8th entry)
              .map((forecast, index) => (
                <div
                  key={index}
                  className="bg-gray-50 p-3 rounded-md text-center"
                >
                  <p className="font-medium">{formatDate(forecast.dt)}</p>
                  <img
                    src={`http://openweathermap.org/img/wn/${forecast.weather[0].icon}.png`}
                    alt={forecast.weather[0].description}
                    className="mx-auto"
                  />
                  <p className="text-lg font-semibold">
                    {Math.round(forecast.main.temp)}°C
                  </p>
                  <p className="text-sm capitalize">
                    {forecast.weather[0].description}
                  </p>
                  <p className="text-xs">
                    H: {Math.round(forecast.main.temp_max)}°C
                    {' '}L: {Math.round(forecast.main.temp_min)}°C
                  </p>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p className="text-center text-red-600">{error}</p>
      )}

      {/* Loading State */}
      {loading && !weatherData && (
        <p className="text-center text-gray-500">Loading weather data...</p>
      )}

      <p className="text-xs text-gray-500 mt-4 text-center">
        Powered by OpenWeatherMap. Forecasts are updated every 3 hours.
      </p>
    </div>
  );
};

export default WeatherForecastViewer;