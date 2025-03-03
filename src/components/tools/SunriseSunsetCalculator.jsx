'use client';

import React, { useState, useEffect } from 'react';

const SunriseSunsetCalculator = () => {
  const [latitude, setLatitude] = useState('40.7128'); // Default: New York City
  const [longitude, setLongitude] = useState('-74.0060');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [timeZone, setTimeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  // Time zones
  const timeZones = Intl.supportedValuesOf('timeZone');

  // Sunrise/Sunset calculation (simplified algorithm)
  const calculateSunTimes = (lat, lon, dateStr) => {
    const date = new Date(dateStr);
    const julianDay = date.getTime() / 86400000 + 2440587.5;
    const n = julianDay - 2451545.0;
    const Jstar = n - lon / 360;
    const M = (357.5291 + 0.98560028 * Jstar) % 360;
    const C = 1.9148 * Math.sin(M * Math.PI / 180) + 0.0200 * Math.sin(2 * M * Math.PI / 180) + 0.0003 * Math.sin(3 * M * Math.PI / 180);
    const lambda = (M + C + 282.9372) % 360;
    const delta = Math.asin(Math.sin(23.44 * Math.PI / 180) * Math.sin(lambda * Math.PI / 180)) * 180 / Math.PI;
    const H = Math.acos((Math.sin(-0.83 * Math.PI / 180) - Math.sin(lat * Math.PI / 180) * Math.sin(delta * Math.PI / 180)) / 
                       (Math.cos(lat * Math.PI / 180) * Math.cos(delta * Math.PI / 180))) * 180 / Math.PI;

    const solarNoon = 12 - lon / 15; // Approximate solar noon in UTC
    const sunrise = solarNoon - H / 15;
    const sunset = solarNoon + H / 15;
    const dayLength = 2 * H / 15;

    const formatTime = (hours) => {
      const dateTime = new Date(date);
      dateTime.setUTCHours(hours, (hours % 1) * 60, 0, 0);
      return new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone,
        hour12: true,
      }).format(dateTime);
    };

    return {
      sunrise: formatTime(sunrise),
      sunset: formatTime(sunset),
      solarNoon: formatTime(solarNoon),
      dayLength: `${Math.floor(dayLength)}h ${Math.round((dayLength % 1) * 60)}m`,
    };
  };

  const handleCalculate = () => {
    setError('');
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);

    if (isNaN(lat) || lat < -90 || lat > 90) {
      setError('Latitude must be between -90 and 90');
      return;
    }
    if (isNaN(lon) || lon < -180 || lon > 180) {
      setError('Longitude must be between -180 and 180');
      return;
    }

    try {
      const times = calculateSunTimes(lat, lon, date);
      setResults(times);
    } catch (err) {
      setError(`Calculation error: ${err.message}`);
    }
  };

  useEffect(() => {
    if (latitude && longitude && date) {
      handleCalculate();
    }
  }, [latitude, longitude, date, timeZone]);

  const handleNow = () => {
    setDate(new Date().toISOString().slice(0, 10));
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude.toFixed(4));
          setLongitude(position.coords.longitude.toFixed(4));
        },
        () => setError('Unable to retrieve location')
      );
    } else {
      setError('Geolocation is not supported by this browser');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Sunrise/Sunset Calculator
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Latitude (-90 to 90)
                </label>
                <input
                  type="number"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  placeholder="e.g., 40.7128"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  step="0.0001"
                  min="-90"
                  max="90"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Longitude (-180 to 180)
                </label>
                <input
                  type="number"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  placeholder="e.g., -74.0060"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  step="0.0001"
                  min="-180"
                  max="180"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time Zone
                </label>
                <select
                  value={timeZone}
                  onChange={(e) => setTimeZone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {timeZones.map((tz) => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={handleNow}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Today
              </button>
              <button
                onClick={getLocation}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                Use My Location
              </button>
            </div>
          </div>

          {/* Results Section */}
          {results && (
            <div className="p-4 bg-gray-50 rounded-md">
              <h2 className="text-lg font-semibold mb-2">Sun Times:</h2>
              <div className="grid gap-2 text-sm">
                <p><span className="font-medium">Sunrise:</span> {results.sunrise}</p>
                <p><span className="font-medium">Solar Noon:</span> {results.solarNoon}</p>
                <p><span className="font-medium">Sunset:</span> {results.sunset}</p>
                <p><span className="font-medium">Day Length:</span> {results.dayLength}</p>
              </div>
              {/* Simple Visualization */}
              <div className="mt-4">
                <div className="relative h-2 bg-gray-200 rounded-full">
                  <div className="absolute h-2 bg-yellow-400 rounded-full" style={{ width: '33%', left: '0%' }}></div>
                  <div className="absolute h-2 bg-orange-400 rounded-full" style={{ width: '33%', left: '33%' }}></div>
                  <div className="absolute h-2 bg-red-400 rounded-full" style={{ width: '33%', left: '66%' }}></div>
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span>{results.sunrise}</span>
                  <span>{results.solarNoon}</span>
                  <span>{results.sunset}</span>
                </div>
              </div>
            </div>
          )}

          {/* Error Section */}
          {error && (
            <div className="p-4 bg-red-50 rounded-md text-red-700">
              <p>{error}</p>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-6 text-sm text-gray-600">
          <details>
            <summary className="cursor-pointer font-medium">Features & Notes</summary>
            <ul className="list-disc list-inside mt-2">
              <li>Calculates sunrise, sunset, solar noon, and day length</li>
              <li>Supports all time zones</li>
              <li>Use "Today" for current date</li>
              <li>"Use My Location" requires browser permission</li>
              <li>Simplified algorithm; for precise results, use an API</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default SunriseSunsetCalculator;