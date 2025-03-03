'use client';

import React, { useState, useEffect } from 'react';

const SiderealTimeConverter = () => {
  const [dateTime, setDateTime] = useState(new Date().toISOString().slice(0, 16));
  const [longitude, setLongitude] = useState('0'); // Degrees, positive east
  const [timeZone, setTimeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [gst, setGst] = useState(''); // Greenwich Sidereal Time
  const [lst, setLst] = useState(''); // Local Sidereal Time
  const [updateInterval, setUpdateInterval] = useState(true);
  const [error, setError] = useState('');

  // Time zones
  const timeZones = Intl.supportedValuesOf('timeZone');

  // Calculate Julian Date (JD) from a Date object
  const getJulianDate = (date) => {
    const d = new Date(date);
    return d.getTime() / 86400000 + 2440587.5; // Milliseconds to days + JD epoch
  };

  // Calculate Greenwich Sidereal Time (GST) in hours
  const calculateGST = (date) => {
    const jd = getJulianDate(date);
    const T = (jd - 2451545.0) / 36525; // Julian centuries since J2000.0
    let gst = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T - T * T * T / 38710000;
    gst = (gst % 360) / 15; // Convert to hours (360° = 24h)
    if (gst < 0) gst += 24;
    return gst;
  };

  // Convert hours to HH:MM:SS format
  const formatTime = (hours) => {
    const totalSeconds = hours * 3600;
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = Math.floor(totalSeconds % 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Calculate Local Sidereal Time (LST)
  const calculateLST = (gst, longitude) => {
    const longHours = parseFloat(longitude) / 15; // 15° = 1 hour
    let lst = gst + longHours;
    if (lst < 0) lst += 24;
    if (lst >= 24) lst -= 24;
    return lst;
  };

  // Update sidereal times
  const updateTimes = () => {
    try {
      const date = new Date(dateTime);
      if (isNaN(date.getTime())) throw new Error('Invalid date');
      
      const gstHours = calculateGST(date);
      const lstHours = calculateLST(gstHours, longitude);
      
      setGst(formatTime(gstHours));
      setLst(formatTime(lstHours));
      setError('');
    } catch (err) {
      setError(`Error: ${err.message}`);
      setGst('');
      setLst('');
    }
  };

  useEffect(() => {
    updateTimes();
    if (updateInterval) {
      const interval = setInterval(updateTimes, 1000);
      return () => clearInterval(interval);
    }
  }, [dateTime, longitude, updateInterval]);

  const handleNow = () => {
    setDateTime(new Date().toISOString().slice(0, 16));
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Sidereal Time Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date/Time (Local)
              </label>
              <div className="flex gap-2">
                <input
                  type="datetime-local"
                  value={dateTime}
                  onChange={(e) => setDateTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleNow}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Now
                </button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Longitude (°)
                </label>
                <input
                  type="number"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  placeholder="e.g., -74.0060 (New York)"
                  step="0.0001"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Positive for East, negative for West
                </p>
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

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={updateInterval}
                onChange={(e) => setUpdateInterval(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="text-sm font-medium text-gray-700">
                Update every second
              </label>
            </div>
          </div>

          {/* Results Section */}
          <div className="p-4 bg-gray-50 rounded-md">
            <h2 className="text-lg font-semibold mb-2">Sidereal Times:</h2>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium">Greenwich Sidereal Time (GST):</span> {gst}
              </p>
              <p>
                <span className="font-medium">Local Sidereal Time (LST):</span> {lst}
              </p>
            </div>
          </div>

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
            <summary className="cursor-pointer font-medium">Features & Usage</summary>
            <ul className="list-disc list-inside mt-2">
              <li>Converts to Greenwich and Local Sidereal Time</li>
              <li>Real-time updates (toggleable)</li>
              <li>Supports any longitude and time zone</li>
              <li>Format: HH:MM:SS</li>
              <li>Use "Now" for current time</li>
              <li>Example: Longitude -74.0060° for New York</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default SiderealTimeConverter;