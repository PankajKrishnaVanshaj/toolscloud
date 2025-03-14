"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaStar, FaSync, FaClock, FaSearch } from "react-icons/fa";

const TimeZoneHistoryViewer = () => {
  const [timeZone, setTimeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [history, setHistory] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState(
    JSON.parse(localStorage.getItem("tzFavorites")) || []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dateRange, setDateRange] = useState("1year"); // Options: 1year, 5years, custom
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [showCurrentTime, setShowCurrentTime] = useState(false);

  const timeZones = Intl.supportedValuesOf("timeZone");
  const filteredTimeZones = timeZones.filter((tz) =>
    tz.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Fetch time zone history
  const fetchTimeZoneHistory = useCallback(async (tz) => {
    setLoading(true);
    setError("");
    try {
      const now = new Date();
      let startDate, endDate;

      if (dateRange === "custom" && customStartDate && customEndDate) {
        startDate = new Date(customStartDate);
        endDate = new Date(customEndDate);
      } else {
        const years = dateRange === "5years" ? 5 : 1;
        startDate = new Date(now.getFullYear() - years, now.getMonth(), now.getDate());
        endDate = new Date(now.getFullYear() + years, now.getMonth(), now.getDate());
      }

      const transitions = [];
      const formatOptions = {
        timeZone: tz,
        timeZoneName: "longOffset",
        hour: "numeric",
        hour12: false,
      };

      for (
        let date = new Date(startDate);
        date <= endDate;
        date.setDate(date.getDate() + 1)
      ) {
        const prevDay = new Date(date);
        prevDay.setDate(prevDay.getDate() - 1);

        const currentOffset = new Intl.DateTimeFormat("en-US", formatOptions)
          .formatToParts(date)
          .find((part) => part.type === "timeZoneName")?.value;
        const prevOffset = new Intl.DateTimeFormat("en-US", formatOptions)
          .formatToParts(prevDay)
          .find((part) => part.type === "timeZoneName")?.value;

        if (currentOffset !== prevOffset) {
          transitions.push({
            date: new Date(date),
            from: prevOffset,
            to: currentOffset,
            offsetChange: date.getTimezoneOffset() - prevDay.getTimezoneOffset(),
          });
        }
      }

      setHistory(transitions);
    } catch (err) {
      setError(`Failed to fetch time zone history: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [dateRange, customStartDate, customEndDate]);

  useEffect(() => {
    fetchTimeZoneHistory(timeZone);
  }, [timeZone, fetchTimeZoneHistory]);

  // Toggle favorite
  const toggleFavorite = (tz) => {
    setFavorites((prev) => {
      const newFavorites = prev.includes(tz)
        ? prev.filter((f) => f !== tz)
        : [...prev, tz];
      localStorage.setItem("tzFavorites", JSON.stringify(newFavorites));
      return newFavorites;
    });
  };

  // Format date
  const formatDate = (date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      timeZone,
      timeZoneName: "short",
    }).format(date);
  };

  // Get current time in selected timezone
  const getCurrentTime = () => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      timeZone,
      timeZoneName: "short",
    }).format(new Date());
  };

  // Reset all settings
  const reset = () => {
    setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    setSearchQuery("");
    setDateRange("1year");
    setCustomStartDate("");
    setCustomEndDate("");
    setShowCurrentTime(false);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-xl p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Time Zone History Viewer
        </h1>

        <div className="grid gap-6">
          {/* Search and Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search Time Zone
              </label>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g., America/New_York"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Time Zone
                </label>
                <select
                  value={timeZone}
                  onChange={(e) => setTimeZone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 max-h-40"
                >
                  {filteredTimeZones.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => toggleFavorite(timeZone)}
                className={`px-4 py-2 rounded-md flex items-center justify-center ${
                  favorites.includes(timeZone)
                    ? "bg-yellow-500 text-white hover:bg-yellow-600"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                } transition-colors`}
              >
                <FaStar className="mr-2" />
                {favorites.includes(timeZone) ? "Unfavorite" : "Favorite"}
              </button>
            </div>
          </div>

          {/* Date Range and Current Time */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Range
              </label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="1year">Past/Next 1 Year</option>
                <option value="5years">Past/Next 5 Years</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
            {dateRange === "custom" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            )}
          </div>

          {/* Current Time Toggle */}
          <div className="flex items-center gap-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showCurrentTime}
                onChange={(e) => setShowCurrentTime(e.target.checked)}
                className="mr-2 accent-blue-500"
              />
              <span className="text-sm text-gray-700">Show Current Time</span>
            </label>
            {showCurrentTime && (
              <div className="flex items-center gap-2 text-gray-600">
                <FaClock />
                <span>{getCurrentTime()}</span>
              </div>
            )}
          </div>

          {/* Favorites */}
          {favorites.length > 0 && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h2 className="text-lg font-semibold mb-2 text-gray-800">Favorites</h2>
              <div className="flex flex-wrap gap-2">
                {favorites.map((tz) => (
                  <button
                    key={tz}
                    onClick={() => setTimeZone(tz)}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
                  >
                    {tz}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* History */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold text-gray-800">Time Zone Transitions</h2>
              <button
                onClick={reset}
                className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center transition-colors"
              >
                <FaSync className="mr-2" /> Reset
              </button>
            </div>
            {loading ? (
              <div className="flex justify-center items-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : error ? (
              <p className="text-red-700">{error}</p>
            ) : history.length === 0 ? (
              <p className="text-gray-600">No transitions found in the selected range.</p>
            ) : (
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {history.map((transition, index) => (
                  <div
                    key={index}
                    className="p-3 bg-white rounded-md shadow-sm border border-gray-200"
                  >
                    <p>
                      <span className="font-medium">Date:</span> {formatDate(transition.date)}
                    </p>
                    <p>
                      <span className="font-medium">From:</span> {transition.from}
                    </p>
                    <p>
                      <span className="font-medium">To:</span> {transition.to}
                    </p>
                    <p>
                      <span className="font-medium">Offset Change:</span>{" "}
                      {transition.offsetChange / 60} hours
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Features & Notes */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features & Notes</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>View historical and upcoming time zone transitions</li>
            <li>Searchable and filterable time zone list</li>
            <li>Favorite time zones (stored in localStorage)</li>
            <li>Customizable date range (1 year, 5 years, or custom)</li>
            <li>Current time display in selected time zone</li>
            <li>Note: This is a simulation; real data requires IANA TZDB or an API</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TimeZoneHistoryViewer;