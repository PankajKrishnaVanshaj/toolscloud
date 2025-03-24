"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaSun, FaLocationArrow, FaSync, FaDownload } from "react-icons/fa";

const SolarTimeCalculator = () => {
  const [latitude, setLatitude] = useState("40.7128"); // Default: New York City
  const [longitude, setLongitude] = useState("-74.0060");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [timeZone, setTimeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [altitude, setAltitude] = useState("0"); // Meters
  const [temperature, setTemperature] = useState("15"); // Celsius, for refraction
  const [pressure, setPressure] = useState("1013.25"); // hPa, for refraction
  const [solarTimes, setSolarTimes] = useState({});
  const [error, setError] = useState("");
  const [isCalculating, setIsCalculating] = useState(false);

  const timeZones = Intl.supportedValuesOf("timeZone");

  // Calculate solar times with enhanced precision
  const calculateSolarTimes = useCallback(() => {
    setIsCalculating(true);
    try {
      const lat = parseFloat(latitude);
      const lon = parseFloat(longitude);
      const alt = parseFloat(altitude);
      const temp = parseFloat(temperature);
      const press = parseFloat(pressure);

      if (isNaN(lat) || lat < -90 || lat > 90 || isNaN(lon) || lon < -180 || lon > 180) {
        throw new Error("Invalid coordinates");
      }
      if (isNaN(alt) || alt < -413 || alt > 8848) {
        throw new Error("Altitude must be between -413m and 8848m");
      }
      if (isNaN(temp) || temp < -89 || temp > 58) {
        throw new Error("Temperature must be between -89°C and 58°C");
      }
      if (isNaN(press) || press < 300 || press > 1100) {
        throw new Error("Pressure must be between 300 hPa and 1100 hPa");
      }

      const inputDate = new Date(date);
      if (isNaN(inputDate.getTime())) throw new Error("Invalid date");

      // Julian Day
      const jd = inputDate.getTime() / 86400000 + 2440587.5;
      const n = jd - 2451545.0;

      // Solar mean anomaly and ecliptic longitude
      const L = (280.460 + 0.9856474 * n) % 360;
      const g = (357.528 + 0.9856003 * n) % 360;
      const lambda = L + 1.915 * Math.sin((g * Math.PI) / 180) + 0.020 * Math.sin((2 * g * Math.PI) / 180);

      // Obliquity and declination
      const epsilon = 23.439 - 0.0000004 * n;
      const sinDelta = Math.sin((epsilon * Math.PI) / 180) * Math.sin((lambda * Math.PI) / 180);
      const declination = (Math.asin(sinDelta) * 180) / Math.PI;

      // Equation of Time
      const B = ((360 / 365.24) * (n - 81) * Math.PI) / 180;
      const eot = 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);

      // Atmospheric refraction correction (approximate)
      const refraction = (0.017 / Math.tan((0.083 + alt / 6371000) * (180 / Math.PI))) * (press / 1013.25) * (283 / (273 + temp));
      const h0Correction = refraction * 60; // Convert to minutes

      // Hour angle for sunrise/sunset
      const cosH0 = -Math.tan((lat * Math.PI) / 180) * Math.tan((declination * Math.PI) / 180);
      const h0 = cosH0 >= 1 || cosH0 <= -1 ? 0 : Math.acos(cosH0) * (180 / Math.PI);

      // Altitude correction
      const altCorrection = alt > 0 ? Math.sqrt(alt) / 60 : 0;

      // Time correction
      const lstMeridian = -new Date().getTimezoneOffset() / 4;
      const timeCorrection = 4 * (lon - lstMeridian) + eot;

      // Solar times in minutes from midnight UTC
      const solarNoonMinutes = 720 - timeCorrection;
      const sunriseMinutes = solarNoonMinutes - 4 * h0 - altCorrection - h0Correction;
      const sunsetMinutes = solarNoonMinutes + 4 * h0 + altCorrection + h0Correction;
      const dayLengthMinutes = sunsetMinutes - sunriseMinutes;

      // Format time
      const formatTime = (minutes) => {
        const dateObj = new Date(inputDate);
        dateObj.setUTCHours(0, 0, 0, 0);
        dateObj.setUTCMinutes(Math.round(minutes));
        return new Intl.DateTimeFormat("en-US", {
          timeZone,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        }).format(dateObj);
      };

      const formatDuration = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = Math.round(minutes % 60);
        return `${hours}h ${mins}m`;
      };

      setSolarTimes({
        solarNoon: formatTime(solarNoonMinutes),
        sunrise: formatTime(sunriseMinutes),
        sunset: formatTime(sunsetMinutes),
        dayLength: formatDuration(dayLengthMinutes),
        equationOfTime: eot.toFixed(2) + " minutes",
        declination: declination.toFixed(2) + "°",
        hourAngle: h0.toFixed(2) + "°",
      });
      setError("");
    } catch (err) {
      setError(`Calculation error: ${err.message}`);
      setSolarTimes({});
    } finally {
      setIsCalculating(false);
    }
  }, [latitude, longitude, date, timeZone, altitude, temperature, pressure]);

  useEffect(() => {
    calculateSolarTimes();
  }, [calculateSolarTimes]);

  // Geolocation
  const useCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude.toFixed(4));
          setLongitude(position.coords.longitude.toFixed(4));
          setAltitude(position.coords.altitude?.toFixed(0) || "0");
        },
        () => setError("Geolocation not available or denied")
      );
    } else {
      setError("Geolocation not supported by browser");
    }
  };

  // Reset to defaults
  const reset = () => {
    setLatitude("40.7128");
    setLongitude("-74.0060");
    setDate(new Date().toISOString().slice(0, 10));
    setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    setAltitude("0");
    setTemperature("15");
    setPressure("1013.25");
    setError("");
  };

  // Download results
  const downloadResults = () => {
    const text = `Solar Time Calculation\n\n` +
      `Date: ${date}\n` +
      `Latitude: ${latitude}°\n` +
      `Longitude: ${longitude}°\n` +
      `Altitude: ${altitude}m\n` +
      `Time Zone: ${timeZone}\n` +
      `Temperature: ${temperature}°C\n` +
      `Pressure: ${pressure}hPa\n\n` +
      Object.entries(solarTimes)
        .map(([key, value]) => `${key.replace(/([A-Z])/g, " $1").trim()}: ${value}`)
        .join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `solar-times-${date}.txt`;
    link.click();
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full ">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Solar Time Calculator
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Latitude (°N/S)
              </label>
              <input
                type="number"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                min="-90"
                max="90"
                step="0.0001"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isCalculating}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Longitude (°E/W)
              </label>
              <input
                type="number"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                min="-180"
                max="180"
                step="0.0001"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isCalculating}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isCalculating}
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
                disabled={isCalculating}
              >
                {timeZones.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Altitude (m)
              </label>
              <input
                type="number"
                value={altitude}
                onChange={(e) => setAltitude(e.target.value)}
                min="-413"
                max="8848"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isCalculating}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Temperature (°C)
              </label>
              <input
                type="number"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                min="-89"
                max="58"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isCalculating}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pressure (hPa)
              </label>
              <input
                type="number"
                value={pressure}
                onChange={(e) => setPressure(e.target.value)}
                min="300"
                max="1100"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isCalculating}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={useCurrentLocation}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              disabled={isCalculating}
            >
              <FaLocationArrow className="mr-2" /> Use My Location
            </button>
            <button
              onClick={() => setDate(new Date().toISOString().slice(0, 10))}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              disabled={isCalculating}
            >
              <FaSun className="mr-2" /> Today
            </button>
            <button
              onClick={reset}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              disabled={isCalculating}
            >
              <FaSync className="mr-2" /> Reset
            </button>
            <button
              onClick={downloadResults}
              className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              disabled={!Object.keys(solarTimes).length || isCalculating}
            >
              <FaDownload className="mr-2" /> Download
            </button>
          </div>

          {/* Results Section */}
          {isCalculating ? (
            <div className="p-4 bg-gray-50 rounded-md text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-600">Calculating...</p>
            </div>
          ) : Object.keys(solarTimes).length > 0 ? (
            <div className="p-4 bg-blue-50 rounded-md">
              <h2 className="text-lg font-semibold mb-2 text-blue-700">Solar Times</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-blue-600">
                {Object.entries(solarTimes).map(([key, value]) => (
                  <p key={key}>
                    <span className="font-medium">{key.replace(/([A-Z])/g, " $1").trim()}:</span>{" "}
                    {value}
                  </p>
                ))}
              </div>
            </div>
          ) : null}

          {/* Error Section */}
          {error && (
            <div className="p-4 bg-red-50 rounded-md text-red-700">
              <p>{error}</p>
            </div>
          )}

          {/* Features & Notes */}
          <div className="mt-6 p-4 bg-gray-50 rounded-md text-sm text-gray-600">
            <details open className="cursor-pointer">
              <summary className="font-medium text-gray-700">Features & Notes</summary>
              <ul className="list-disc list-inside mt-2">
                <li>Calculates solar noon, sunrise, sunset, and day length</li>
                <li>Adjusts for altitude, temperature, and atmospheric pressure</li>
                <li>Includes atmospheric refraction correction</li>
                <li>Geolocation support for current position</li>
                <li>Download results as a text file</li>
                <li>Latitude: +N, -S; Longitude: +E, -W</li>
                <li>Uses approximate astronomical algorithms</li>
              </ul>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SolarTimeCalculator;