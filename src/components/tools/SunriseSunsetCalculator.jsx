"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaLocationArrow, FaCalendarDay, FaDownload } from "react-icons/fa";

const SunriseSunsetCalculator = () => {
  const [latitude, setLatitude] = useState("40.7128"); // Default: New York City
  const [longitude, setLongitude] = useState("-74.0060");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [timeZone, setTimeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");
  const [elevation, setElevation] = useState(0); // New: Elevation in meters
  const [showDetails, setShowDetails] = useState(false); // Toggle for detailed view

  const timeZones = Intl.supportedValuesOf("timeZone");

  // Enhanced sunrise/sunset calculation with elevation correction
  const calculateSunTimes = useCallback((lat, lon, dateStr, elev) => {
    const date = new Date(dateStr);
    const julianDay = date.getTime() / 86400000 + 2440587.5;
    const n = julianDay - 2451545.0;
    const Jstar = n - lon / 360;
    const M = (357.5291 + 0.98560028 * Jstar) % 360;
    const C =
      1.9148 * Math.sin((M * Math.PI) / 180) +
      0.0200 * Math.sin((2 * M * Math.PI) / 180) +
      0.0003 * Math.sin((3 * M * Math.PI) / 180);
    const lambda = (M + C + 282.9372) % 360;
    const delta = Math.asin(Math.sin((23.44 * Math.PI) / 180) * Math.sin((lambda * Math.PI) / 180)) * (180 / Math.PI);
    const elevationCorrection = -2.076 * Math.sqrt(elev) / 60; // Simplified elevation effect
    const H =
      Math.acos(
        (Math.sin((-0.83 + elevationCorrection) * (Math.PI / 180)) -
          Math.sin(lat * (Math.PI / 180)) * Math.sin(delta * (Math.PI / 180))) /
          (Math.cos(lat * (Math.PI / 180)) * Math.cos(delta * (Math.PI / 180)))
      ) *
      (180 / Math.PI);

    const solarNoon = 12 - lon / 15;
    const sunrise = solarNoon - H / 15;
    const sunset = solarNoon + H / 15;
    const dayLength = 2 * H / 15;

    const twilightAngle = -6; // Civil twilight
    const twilightH =
      Math.acos(
        (Math.sin((twilightAngle + elevationCorrection) * (Math.PI / 180)) -
          Math.sin(lat * (Math.PI / 180)) * Math.sin(delta * (Math.PI / 180))) /
          (Math.cos(lat * (Math.PI / 180)) * Math.cos(delta * (Math.PI / 180)))
      ) *
      (180 / Math.PI);
    const twilightStart = solarNoon - twilightH / 15;
    const twilightEnd = solarNoon + twilightH / 15;

    const formatTime = (hours) => {
      const dateTime = new Date(date);
      dateTime.setUTCHours(hours, (hours % 1) * 60, 0, 0);
      return new Intl.DateTimeFormat("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone,
        hour12: true,
      }).format(dateTime);
    };

    return {
      sunrise: formatTime(sunrise),
      sunset: formatTime(sunset),
      solarNoon: formatTime(solarNoon),
      dayLength: `${Math.floor(dayLength)}h ${Math.round((dayLength % 1) * 60)}m`,
      twilightStart: formatTime(twilightStart),
      twilightEnd: formatTime(twilightEnd),
    };
  }, [timeZone]);

  const handleCalculate = () => {
    setError("");
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    const elev = parseFloat(elevation);

    if (isNaN(lat) || lat < -90 || lat > 90) {
      setError("Latitude must be between -90 and 90");
      return;
    }
    if (isNaN(lon) || lon < -180 || lon > 180) {
      setError("Longitude must be between -180 and 180");
      return;
    }
    if (isNaN(elev) || elev < 0) {
      setError("Elevation must be non-negative");
      return;
    }

    try {
      const times = calculateSunTimes(lat, lon, date, elev);
      setResults(times);
    } catch (err) {
      setError(`Calculation error: ${err.message}`);
    }
  };

  useEffect(() => {
    if (latitude && longitude && date) {
      handleCalculate();
    }
  }, [latitude, longitude, date, timeZone, elevation]);

  const handleNow = () => {
    setDate(new Date().toISOString().slice(0, 10));
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude.toFixed(4));
          setLongitude(position.coords.longitude.toFixed(4));
          setElevation(0); // Default elevation; could use an API for accuracy
        },
        () => setError("Unable to retrieve location")
      );
    } else {
      setError("Geolocation is not supported by this browser");
    }
  };

  const downloadResults = () => {
    if (results) {
      const text = `
Sunrise/Sunset Results
Date: ${date}
Latitude: ${latitude}°
Longitude: ${longitude}°
Elevation: ${elevation}m
Time Zone: ${timeZone}
Sunrise: ${results.sunrise}
Solar Noon: ${results.solarNoon}
Sunset: ${results.sunset}
Day Length: ${results.dayLength}
Twilight Start: ${results.twilightStart}
Twilight End: ${results.twilightEnd}
      `.trim();
      const blob = new Blob([text], { type: "text/plain" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `sun-times-${date}.txt`;
      link.click();
    }
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Sunrise/Sunset Calculator
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Elevation (m)
              </label>
              <input
                type="number"
                value={elevation}
                onChange={(e) => setElevation(e.target.value)}
                placeholder="e.g., 0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                step="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Time Zone</label>
              <select
                value={timeZone}
                onChange={(e) => setTimeZone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {timeZones.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleNow}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <FaCalendarDay className="mr-2" /> Today
            </button>
            <button
              onClick={getLocation}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
            >
              <FaLocationArrow className="mr-2" /> Use My Location
            </button>
            {results && (
              <button
                onClick={downloadResults}
                className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center"
              >
                <FaDownload className="mr-2" /> Download Results
              </button>
            )}
          </div>
        </div>

        {/* Results Section */}
        {results && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Sun Times</h2>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-sm text-blue-600 hover:underline"
              >
                {showDetails ? "Hide Details" : "Show Details"}
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <p>
                <span className="font-medium">Sunrise:</span> {results.sunrise}
              </p>
              <p>
                <span className="font-medium">Solar Noon:</span> {results.solarNoon}
              </p>
              <p>
                <span className="font-medium">Sunset:</span> {results.sunset}
              </p>
              <p>
                <span className="font-medium">Day Length:</span> {results.dayLength}
              </p>
              {showDetails && (
                <>
                  <p>
                    <span className="font-medium">Twilight Start:</span> {results.twilightStart}
                  </p>
                  <p>
                    <span className="font-medium">Twilight End:</span> {results.twilightEnd}
                  </p>
                </>
              )}
            </div>
            {/* Visualization */}
            <div className="mt-4">
              <div className="relative h-4 bg-gray-200 rounded-full">
                <div
                  className="absolute h-4 bg-blue-300 rounded-l-full"
                  style={{ width: "20%", left: "0%" }}
                ></div>
                <div
                  className="absolute h-4 bg-yellow-400"
                  style={{ width: "60%", left: "20%" }}
                ></div>
                <div
                  className="absolute h-4 bg-blue-300 rounded-r-full"
                  style={{ width: "20%", left: "80%" }}
                ></div>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span>{results.twilightStart}</span>
                <span>{results.sunrise}</span>
                <span>{results.solarNoon}</span>
                <span>{results.sunset}</span>
                <span>{results.twilightEnd}</span>
              </div>
            </div>
          </div>
        )}

        {/* Error Section */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 rounded-lg text-red-700">
            <p>{error}</p>
          </div>
        )}

        {/* Features & Notes */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features & Notes</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Calculates sunrise, sunset, solar noon, day length, and twilight times</li>
            <li>Adjustable elevation for more accurate calculations</li>
            <li>Supports all time zones</li>
            <li>Geolocation support with browser permission</li>
            <li>Download results as a text file</li>
            <li>Note: Uses a simplified algorithm; for precise results, consider an API (e.g., NOAA)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SunriseSunsetCalculator;