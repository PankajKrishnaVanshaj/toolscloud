"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaSync, FaClock, FaSearch } from "react-icons/fa";

const TimeZoneAbbreviationResolver = () => {
  const [abbreviation, setAbbreviation] = useState("");
  const [resolvedZones, setResolvedZones] = useState([]);
  const [selectedZone, setSelectedZone] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [offset, setOffset] = useState("");
  const [dstStatus, setDstStatus] = useState("");
  const [error, setError] = useState("");
  const [updateTime, setUpdateTime] = useState(true);
  const [dateFormat, setDateFormat] = useState("default"); // New: Custom date formats
  const [searchHistory, setSearchHistory] = useState([]); // New: Search history

  // Expanded time zone abbreviation mapping
  const abbreviationMap = {
    EST: ["Eastern Standard Time", ["America/New_York", "America/Detroit", "America/Indiana/Indianapolis"]],
    EDT: ["Eastern Daylight Time", ["America/New_York", "America/Detroit", "America/Indiana/Indianapolis"]],
    CST: ["Central Standard Time", ["America/Chicago", "America/Indiana/Knox", "America/Menominee"]],
    CDT: ["Central Daylight Time", ["America/Chicago", "America/Indiana/Knox", "America/Menominee"]],
    MST: ["Mountain Standard Time", ["America/Denver", "America/Boise", "America/Phoenix"]],
    MDT: ["Mountain Daylight Time", ["America/Denver", "America/Boise"]],
    PST: ["Pacific Standard Time", ["America/Los_Angeles", "America/Santa_Isabel"]],
    PDT: ["Pacific Daylight Time", ["America/Los_Angeles", "America/Santa_Isabel"]],
    UTC: ["Coordinated Universal Time", ["UTC"]],
    GMT: ["Greenwich Mean Time", ["Europe/London", "Africa/Accra"]],
    BST: ["British Summer Time", ["Europe/London"]],
    CET: ["Central European Time", ["Europe/Paris", "Europe/Berlin", "Europe/Rome"]],
    CEST: ["Central European Summer Time", ["Europe/Paris", "Europe/Berlin", "Europe/Rome"]],
    IST: ["India Standard Time", ["Asia/Kolkata"]],
    JST: ["Japan Standard Time", ["Asia/Tokyo"]],
    AEST: ["Australian Eastern Standard Time", ["Australia/Sydney", "Australia/Melbourne"]],
    AEDT: ["Australian Eastern Daylight Time", ["Australia/Sydney", "Australia/Melbourne"]],
    // Add more as needed
  };

  // Resolve abbreviation
  const resolveAbbreviation = useCallback((abbr) => {
    const upperAbbr = abbr.toUpperCase();
    const resolved = abbreviationMap[upperAbbr];
    if (!resolved) {
      setError(`Unknown abbreviation: ${abbr}`);
      setResolvedZones([]);
      setSelectedZone("");
      setCurrentTime("");
      setOffset("");
      setDstStatus("");
      return null;
    }
    setError("");
    setResolvedZones(resolved[1]);
    setSelectedZone(resolved[1][0]);
    if (!searchHistory.includes(upperAbbr)) {
      setSearchHistory((prev) => [upperAbbr, ...prev.slice(0, 4)]); // Keep last 5
    }
    return resolved;
  }, [searchHistory]);

  // Update time information
  const updateTimeInfo = useCallback((zone) => {
    if (!zone) return;
    try {
      const now = new Date();
      const options = {
        timeZone: zone,
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: dateFormat === "12h",
      };
      let formatter;
      switch (dateFormat) {
        case "short":
          formatter = new Intl.DateTimeFormat("en-US", {
            ...options,
            month: "short",
            timeZoneName: "short",
          });
          break;
        case "numeric":
          formatter = new Intl.DateTimeFormat("en-US", {
            ...options,
            month: "numeric",
            day: "2-digit",
            year: "2-digit",
          });
          break;
        default:
          formatter = new Intl.DateTimeFormat("en-US", {
            ...options,
            timeZoneName: "long",
          });
      }
      const formattedTime = formatter.format(now);
      setCurrentTime(formattedTime);

      const offsetValue = now.toLocaleString("en-US", { timeZone: zone, timeZoneName: "short" }).split(" ").pop();
      const offsetHours = parseInt(offsetValue.slice(3, 6), 10);
      const offsetMinutes = parseInt(offsetValue.slice(6), 10) || 0;
      const totalOffset = offsetHours + (offsetMinutes / 60) * (offsetHours < 0 ? -1 : 1);
      setOffset(`UTC${totalOffset >= 0 ? "+" : ""}${totalOffset}`);

      const january = new Date(now.getFullYear(), 0, 1);
      const januaryOffset = january.toLocaleString("en-US", { timeZone: zone, timeZoneName: "short" }).split(" ").pop();
      setDstStatus(offsetValue !== januaryOffset ? "In DST" : "Not in DST");
    } catch (err) {
      setError(`Error processing time zone: ${err.message}`);
    }
  }, [dateFormat]);

  useEffect(() => {
    if (selectedZone && updateTime) {
      updateTimeInfo(selectedZone);
      const interval = setInterval(() => updateTimeInfo(selectedZone), 1000);
      return () => clearInterval(interval);
    }
  }, [selectedZone, updateTime, updateTimeInfo]);

  // Handlers
  const handleInput = (value) => {
    setAbbreviation(value);
    if (value.length >= 2) resolveAbbreviation(value);
  };

  const handleZoneChange = (zone) => {
    setSelectedZone(zone);
    updateTimeInfo(zone);
  };

  const handleHistoryClick = (abbr) => {
    setAbbreviation(abbr);
    resolveAbbreviation(abbr);
  };

  const reset = () => {
    setAbbreviation("");
    setResolvedZones([]);
    setSelectedZone("");
    setCurrentTime("");
    setOffset("");
    setDstStatus("");
    setError("");
    setDateFormat("default");
  };

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Time Zone Abbreviation Resolver
        </h1>

        <div className="space-y-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time Zone Abbreviation
              </label>
              <input
                type="text"
                value={abbreviation}
                onChange={(e) => handleInput(e.target.value)}
                placeholder="e.g., EST, PDT, UTC"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {resolvedZones.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Time Zone
                </label>
                <select
                  value={selectedZone}
                  onChange={(e) => handleZoneChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {resolvedZones.map((zone) => (
                    <option key={zone} value={zone}>
                      {zone}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={updateTime}
                onChange={(e) => setUpdateTime(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="text-sm font-medium text-gray-700">
                Live Time Updates
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Format
              </label>
              <select
                value={dateFormat}
                onChange={(e) => setDateFormat(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="default">Default (Long)</option>
                <option value="short">Short</option>
                <option value="numeric">Numeric</option>
                <option value="12h">12-Hour</option>
              </select>
            </div>
          </div>

          {/* Results */}
          {selectedZone && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Resolved Information</h2>
              <div className="space-y-2 text-sm text-gray-700">
                <p>
                  <span className="font-medium">Full Name:</span>{" "}
                  {abbreviationMap[abbreviation.toUpperCase()]?.[0] || "Unknown"}
                </p>
                <p>
                  <span className="font-medium">Current Time:</span> {currentTime}
                </p>
                <p>
                  <span className="font-medium">UTC Offset:</span> {offset}
                </p>
                <p>
                  <span className="font-medium">DST Status:</span> {dstStatus}
                </p>
              </div>
            </div>
          )}

          {/* Search History */}
          {searchHistory.length > 0 && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Recent Searches</h3>
              <div className="flex flex-wrap gap-2">
                {searchHistory.map((abbr, index) => (
                  <button
                    key={index}
                    onClick={() => handleHistoryClick(abbr)}
                    className="px-3 py-1 bg-blue-200 text-blue-800 rounded-full hover:bg-blue-300 transition-colors"
                  >
                    {abbr}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-50 rounded-lg text-red-700">
              <p>{error}</p>
            </div>
          )}

          {/* Actions */}
          <button
            onClick={reset}
            className="w-full py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Reset
          </button>
        </div>

        {/* Features & Notes */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features & Notes</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Resolves common time zone abbreviations</li>
            <li>Multiple zones per abbreviation with dropdown selection</li>
            <li>Real-time updates (toggleable)</li>
            <li>Customizable date formats</li>
            <li>Search history for quick reuse</li>
            <li>Note: Some abbreviations may be ambiguous; expand the map as needed</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TimeZoneAbbreviationResolver;