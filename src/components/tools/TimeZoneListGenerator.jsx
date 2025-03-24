"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaDownload, FaSync, FaClock } from "react-icons/fa";

const TimeZoneListGenerator = () => {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("name"); // name, offset, time
  const [sortOrder, setSortOrder] = useState("asc"); // asc, desc
  const [timeZones, setTimeZones] = useState([]);
  const [displayFormat, setDisplayFormat] = useState("short"); // short, long, offset, custom
  const [updateInterval, setUpdateInterval] = useState(true);
  const [customFormat, setCustomFormat] = useState("HH:mm:ss"); // Custom time format
  const [favorites, setFavorites] = useState([]); // Favorite time zones
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const allTimeZones = Intl.supportedValuesOf("timeZone");

  const getTimeZoneInfo = useCallback((tz) => {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
    const dateFormatter = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const customFormatter = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      ...(["HH:mm:ss", "HH:mm", "hh:mm a"].includes(customFormat) ? {} : { timeStyle: "medium" }),
    });

    const time = formatter.format(now);
    const date = dateFormatter.format(now);
    const customTime = customFormatter.format(now);
    const offset = now
      .toLocaleString("en-US", { timeZone: tz, timeZoneName: "longOffset" })
      .split(" ")
      .pop()
      .replace("GMT", "");
    const offsetHours = parseInt(offset.split(":")[0], 10) || 0;

    return { name: tz, time, date, customTime, offset, offsetHours };
  }, [customFormat]);

  const updateTimeZones = useCallback(() => {
    let filteredZones = allTimeZones
      .filter((tz) => tz.toLowerCase().includes(search.toLowerCase()))
      .map(getTimeZoneInfo);

    if (showFavoritesOnly) {
      filteredZones = filteredZones.filter((tz) => favorites.includes(tz.name));
    }

    const sortedZones = filteredZones.sort((a, b) => {
      if (sortBy === "name") {
        return sortOrder === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else if (sortBy === "offset") {
        return sortOrder === "asc"
          ? a.offsetHours - b.offsetHours || a.name.localeCompare(b.name)
          : b.offsetHours - a.offsetHours || b.name.localeCompare(a.name);
      } else {
        return sortOrder === "asc"
          ? a.time.localeCompare(b.time)
          : b.time.localeCompare(a.time);
      }
    });

    setTimeZones(sortedZones);
  }, [search, sortBy, sortOrder, showFavoritesOnly, favorites, getTimeZoneInfo]);

  useEffect(() => {
    updateTimeZones();
    if (updateInterval) {
      const interval = setInterval(updateTimeZones, 1000);
      return () => clearInterval(interval);
    }
  }, [updateTimeZones, updateInterval]);

  const toggleFavorite = (tzName) => {
    setFavorites((prev) =>
      prev.includes(tzName) ? prev.filter((f) => f !== tzName) : [...prev, tzName]
    );
  };

  const exportToCSV = () => {
    const headers = ["Time Zone", "Current Time", "Date", "Offset"];
    const rows = timeZones.map((tz) => [tz.name, tz.time, tz.date, tz.offset]);
    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `time_zones_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setSearch("");
    setSortBy("name");
    setSortOrder("asc");
    setDisplayFormat("short");
    setUpdateInterval(true);
    setCustomFormat("HH:mm:ss");
    setShowFavoritesOnly(false);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Time Zone List Generator
        </h1>

        {/* Controls Section */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search Time Zones
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="e.g., America, UTC"
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="name">Name</option>
                <option value="offset">Offset</option>
                <option value="time">Time</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort Order
              </label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Format
              </label>
              <select
                value={displayFormat}
                onChange={(e) => setDisplayFormat(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="short">Short (Time only)</option>
                <option value="long">Long (Date + Time)</option>
                <option value="offset">Offset Only</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            {displayFormat === "custom" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Custom Time Format
                </label>
                <select
                  value={customFormat}
                  onChange={(e) => setCustomFormat(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="HH:mm:ss">24h (HH:mm:ss)</option>
                  <option value="HH:mm">24h (HH:mm)</option>
                  <option value="hh:mm a">12h (hh:mm AM/PM)</option>
                </select>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex gap-4 items-center">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={updateInterval}
                  onChange={(e) => setUpdateInterval(e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Update every second</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showFavoritesOnly}
                  onChange={(e) => setShowFavoritesOnly(e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Show Favorites Only</span>
              </label>
            </div>
            <div className="flex gap-2">
              <button
                onClick={exportToCSV}
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              >
                <FaDownload className="mr-2" /> Export to CSV
              </button>
              <button
                onClick={reset}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                <FaSync className="mr-2" /> Reset
              </button>
            </div>
          </div>
        </div>

        {/* Time Zone List */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg max-h-[50vh] overflow-y-auto">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            Time Zones ({timeZones.length}):
          </h2>
          {timeZones.length > 0 ? (
            <table className="w-full text-sm text-left text-gray-700">
              <thead className="bg-gray-200">
                <tr>
                  <th className="py-3 px-4">Favorite</th>
                  <th className="py-3 px-4">Time Zone</th>
                  <th className="py-3 px-4">
                    {displayFormat === "offset"
                      ? "Offset"
                      : displayFormat === "custom"
                      ? "Custom Time"
                      : "Current Time"}
                  </th>
                  {displayFormat === "long" && <th className="py-3 px-4">Date</th>}
                </tr>
              </thead>
              <tbody>
                {timeZones.map((tz) => (
                  <tr
                    key={tz.name}
                    className="border-b hover:bg-gray-100 transition-colors"
                  >
                    <td className="py-2 px-4">
                      <button
                        onClick={() => toggleFavorite(tz.name)}
                        className={`p-1 rounded-full ${
                          favorites.includes(tz.name)
                            ? "text-yellow-500"
                            : "text-gray-400 hover:text-yellow-400"
                        }`}
                      >
                        ★
                      </button>
                    </td>
                    <td className="py-2 px-4">{tz.name}</td>
                    <td className="py-2 px-4">
                      {displayFormat === "offset"
                        ? tz.offset
                        : displayFormat === "custom"
                        ? tz.customTime
                        : tz.time}
                    </td>
                    {displayFormat === "long" && (
                      <td className="py-2 px-4">{tz.date}</td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500 italic">No time zones match your criteria.</p>
          )}
        </div>

        {/* Features Section */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Search and filter time zones</li>
            <li>Sort by name, offset, or current time</li>
            <li>Multiple display formats including custom time</li>
            <li>Real-time updates (toggleable)</li>
            <li>Favorite time zones for quick access</li>
            <li>Export to CSV</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TimeZoneListGenerator;