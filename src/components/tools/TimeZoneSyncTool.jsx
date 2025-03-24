"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaClock, FaPlus, FaTrash, FaSync } from "react-icons/fa";

const TimeZoneSyncTool = () => {
  const [timeZones, setTimeZones] = useState([
    { id: 1, zone: Intl.DateTimeFormat().resolvedOptions().timeZone },
  ]);
  const [baseTime, setBaseTime] = useState(new Date().toISOString().slice(0, 16));
  const [formatOptions, setFormatOptions] = useState({
    date: true,
    time: true,
    seconds: true,
    hour12: true,
    timeZoneName: "short",
    weekday: false,
  });
  const [updateInterval, setUpdateInterval] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [favoriteZones, setFavoriteZones] = useState([]);

  const availableTimeZones = Intl.supportedValuesOf("timeZone");

  // Format time with options
  const formatTime = useCallback(
    (date, timeZone) => {
      const options = {
        timeZone,
        year: formatOptions.date ? "numeric" : undefined,
        month: formatOptions.date ? "long" : undefined,
        day: formatOptions.date ? "numeric" : undefined,
        weekday: formatOptions.weekday ? "long" : undefined,
        hour: formatOptions.time ? "2-digit" : undefined,
        minute: formatOptions.time ? "2-digit" : undefined,
        second: formatOptions.seconds ? "2-digit" : undefined,
        hour12: formatOptions.hour12,
        timeZoneName:
          formatOptions.timeZoneName !== "none" ? formatOptions.timeZoneName : undefined,
      };
      return new Intl.DateTimeFormat("en-US", options).format(new Date(date));
    },
    [formatOptions]
  );

  // Add a new time zone
  const addTimeZone = () => {
    const newId = Math.max(...timeZones.map((tz) => tz.id), 0) + 1;
    setTimeZones([...timeZones, { id: newId, zone: "UTC" }]);
  };

  // Remove a time zone
  const removeTimeZone = (id) => {
    if (timeZones.length > 1) {
      setTimeZones(timeZones.filter((tz) => tz.id !== id));
    }
  };

  // Update time zone
  const updateTimeZone = (id, newZone) => {
    setTimeZones(timeZones.map((tz) => (tz.id === id ? { ...tz, zone: newZone } : tz)));
  };

  // Sync to current time
  const syncToNow = () => {
    setBaseTime(new Date().toISOString().slice(0, 16));
  };

  // Toggle favorite time zone
  const toggleFavorite = (zone) => {
    setFavoriteZones((prev) =>
      prev.includes(zone) ? prev.filter((z) => z !== zone) : [...prev, zone]
    );
  };

  // Reset all settings
  const reset = () => {
    setTimeZones([{ id: 1, zone: Intl.DateTimeFormat().resolvedOptions().timeZone }]);
    setBaseTime(new Date().toISOString().slice(0, 16));
    setFormatOptions({
      date: true,
      time: true,
      seconds: true,
      hour12: true,
      timeZoneName: "short",
      weekday: false,
    });
    setUpdateInterval(true);
    setSearchQuery("");
  };

  // Real-time update effect
  useEffect(() => {
    if (updateInterval) {
      const interval = setInterval(() => {
        setBaseTime(new Date().toISOString().slice(0, 16));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [updateInterval]);

  // Filtered time zones for search
  const filteredTimeZones = availableTimeZones.filter((zone) =>
    zone.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Time Zone Sync Tool
        </h1>

        <div className="space-y-6">
          {/* Base Time and Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Base Time</label>
              <input
                type="datetime-local"
                value={baseTime}
                onChange={(e) => setBaseTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
              <button
                onClick={syncToNow}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <FaClock className="mr-2" /> Sync to Now
              </button>
              <button
                onClick={reset}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
              >
                <FaSync className="mr-2" /> Reset
              </button>
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

          {/* Time Zone List */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">Time Zones</h2>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {timeZones.map((tz) => (
                <div
                  key={tz.id}
                  className="flex flex-col sm:flex-row items-center gap-4 p-3 bg-gray-50 rounded-md"
                >
                  <select
                    value={tz.zone}
                    onChange={(e) => updateTimeZone(tz.id, e.target.value)}
                    className="w-full sm:flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {filteredTimeZones.map((zone) => (
                      <option key={zone} value={zone}>
                        {zone} {favoriteZones.includes(zone) ? "★" : ""}
                      </option>
                    ))}
                  </select>
                  <div className="w-full sm:flex-1 text-sm text-gray-700">
                    {formatTime(baseTime, tz.zone)}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleFavorite(tz.zone)}
                      className={`p-2 rounded-full ${
                        favoriteZones.includes(tz.zone)
                          ? "bg-yellow-400 text-white"
                          : "bg-gray-200 text-gray-600"
                      } hover:bg-yellow-500 transition-colors`}
                    >
                      ★
                    </button>
                    <button
                      onClick={() => removeTimeZone(tz.id)}
                      disabled={timeZones.length === 1}
                      className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-red-300 transition-colors"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={addTimeZone}
              className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
            >
              <FaPlus className="mr-2" /> Add Time Zone
            </button>
          </div>

          {/* Time Zone Search */}
          <div className="p-4 bg-gray-50 rounded-md">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Search Time Zones</h2>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search time zones..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Format Options */}
          <div className="p-4 bg-gray-50 rounded-md">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Format Options</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              {[
                { label: "Include Date", key: "date" },
                { label: "Include Time", key: "time" },
                { label: "Include Seconds", key: "seconds" },
                { label: "Include Weekday", key: "weekday" },
                { label: "Use 12-Hour Format", key: "hour12" },
              ].map(({ label, key }) => (
                <label key={key} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formatOptions[key]}
                    onChange={(e) =>
                      setFormatOptions({ ...formatOptions, [key]: e.target.checked })
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  {label}
                </label>
              ))}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">
                  Time Zone Display
                </label>
                <select
                  value={formatOptions.timeZoneName}
                  onChange={(e) =>
                    setFormatOptions({ ...formatOptions, timeZoneName: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="none">None</option>
                  <option value="short">Short (e.g., EST)</option>
                  <option value="long">Long (e.g., Eastern Standard Time)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Real-time synchronization across multiple time zones</li>
              <li>Dynamic addition/removal of time zones</li>
              <li>Favorite time zones with star toggle</li>
              <li>Searchable time zone list</li>
              <li>Customizable date and time format</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeZoneSyncTool;