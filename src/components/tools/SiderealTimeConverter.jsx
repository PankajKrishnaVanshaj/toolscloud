"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaSync, FaClock, FaGlobe } from "react-icons/fa";

const SiderealTimeConverter = () => {
  const [dateTime, setDateTime] = useState(new Date().toISOString().slice(0, 16));
  const [longitude, setLongitude] = useState("0");
  const [timeZone, setTimeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [gst, setGst] = useState("");
  const [lst, setLst] = useState("");
  const [updateInterval, setUpdateInterval] = useState(true);
  const [error, setError] = useState("");
  const [format, setFormat] = useState("hms"); // hms (HH:MM:SS) or decimal
  const [precision, setPrecision] = useState(2); // Decimal places for decimal format

  const timeZones = Intl.supportedValuesOf("timeZone");

  // Calculate Julian Date
  const getJulianDate = useCallback((date) => {
    const d = new Date(date);
    return d.getTime() / 86400000 + 2440587.5;
  }, []);

  // Calculate Greenwich Sidereal Time (GST) in hours
  const calculateGST = useCallback((date) => {
    const jd = getJulianDate(date);
    const T = (jd - 2451545.0) / 36525;
    let gst = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T - (T * T * T) / 38710000;
    gst = (gst % 360) / 15;
    if (gst < 0) gst += 24;
    return gst;
  }, [getJulianDate]);

  // Format time based on user preference
  const formatTime = (hours) => {
    if (format === "decimal") {
      return hours.toFixed(precision);
    }
    const totalSeconds = hours * 3600;
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = Math.floor(totalSeconds % 60);
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Calculate Local Sidereal Time (LST)
  const calculateLST = (gst, longitude) => {
    const longHours = parseFloat(longitude) / 15;
    let lst = gst + longHours;
    if (lst < 0) lst += 24;
    if (lst >= 24) lst -= 24;
    return lst;
  };

  // Update sidereal times
  const updateTimes = useCallback(() => {
    try {
      const date = new Date(dateTime);
      if (isNaN(date.getTime())) throw new Error("Invalid date");

      const gstHours = calculateGST(date);
      const lstHours = calculateLST(gstHours, longitude);

      setGst(formatTime(gstHours));
      setLst(formatTime(lstHours));
      setError("");
    } catch (err) {
      setError(`Error: ${err.message}`);
      setGst("");
      setLst("");
    }
  }, [dateTime, longitude, format, precision, calculateGST]);

  useEffect(() => {
    updateTimes();
    if (updateInterval) {
      const interval = setInterval(updateTimes, 1000);
      return () => clearInterval(interval);
    }
  }, [dateTime, longitude, updateInterval, updateTimes]);

  // Reset to current time
  const handleNow = () => {
    setDateTime(new Date().toISOString().slice(0, 16));
  };

  // Reset all settings
  const resetAll = () => {
    setDateTime(new Date().toISOString().slice(0, 16));
    setLongitude("0");
    setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    setUpdateInterval(true);
    setFormat("hms");
    setPrecision(2);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-xl p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Sidereal Time Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date/Time (Local)
                </label>
                <div className="flex gap-2">
                  <input
                    type="datetime-local"
                    value={dateTime}
                    onChange={(e) => setDateTime(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleNow}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <FaClock className="mr-2" /> Now
                  </button>
                </div>
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
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Longitude (°)
                </label>
                <input
                  type="number"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  placeholder="e.g., -74.0060"
                  step="0.0001"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Positive East, negative West (e.g., -74.0060° for New York)
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Output Format
                </label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="hms">HH:MM:SS</option>
                  <option value="decimal">Decimal Hours</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={updateInterval}
                  onChange={(e) => setUpdateInterval(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="text-sm font-medium text-gray-700">
                  Auto-update every second
                </label>
              </div>
              {format === "decimal" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Precision (decimal places)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="6"
                    value={precision}
                    onChange={(e) => setPrecision(Math.max(0, Math.min(6, e.target.value)))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={updateTimes}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
            >
              <FaGlobe className="mr-2" /> Calculate
            </button>
            <button
              onClick={resetAll}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>

          {/* Results Section */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-2 text-gray-800">Sidereal Times</h2>
            <div className="space-y-2 text-sm text-gray-700">
              <p>
                <span className="font-medium">Greenwich Sidereal Time (GST):</span>{" "}
                {gst || "N/A"} {format === "decimal" ? "hours" : ""}
              </p>
              <p>
                <span className="font-medium">Local Sidereal Time (LST):</span>{" "}
                {lst || "N/A"} {format === "decimal" ? "hours" : ""}
              </p>
            </div>
          </div>

          {/* Error Section */}
          {error && (
            <div className="p-4 bg-red-50 rounded-lg text-red-700">
              <p>{error}</p>
            </div>
          )}

          {/* Features & Info */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features & Usage</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Calculate Greenwich (GST) and Local Sidereal Time (LST)</li>
              <li>Real-time updates (toggleable)</li>
              <li>Supports any longitude and time zone</li>
              <li>Output in HH:MM:SS or decimal hours</li>
              <li>Adjustable precision for decimal format</li>
              <li>Reset to current time and default settings</li>
              <li>Example: Longitude -74.0060° for New York</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiderealTimeConverter;