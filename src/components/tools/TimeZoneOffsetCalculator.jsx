"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaSync, FaClock, FaSun, FaMoon } from "react-icons/fa";

const TimeZoneOffsetCalculator = () => {
  const [baseTimeZone, setBaseTimeZone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );
  const [compareTimeZone, setCompareTimeZone] = useState("UTC");
  const [dateTime, setDateTime] = useState(new Date().toISOString().slice(0, 16));
  const [baseTime, setBaseTime] = useState("");
  const [compareTime, setCompareTime] = useState("");
  const [offsetDifference, setOffsetDifference] = useState("");
  const [isDSTBase, setIsDSTBase] = useState(false);
  const [isDSTCompare, setIsDSTCompare] = useState(false);
  const [updateLive, setUpdateLive] = useState(true);
  const [timeFormat, setTimeFormat] = useState("12"); // 12 or 24-hour format
  const [showSeconds, setShowSeconds] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Available time zones with search
  const timeZones = ["UTC", ...Intl.supportedValuesOf("timeZone")].sort();
  const filteredTimeZones = timeZones.filter((tz) =>
    tz.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get offset in GMT format
  const getOffset = (date, timeZone) => {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      timeZoneName: "longOffset",
    });
    const parts = formatter.formatToParts(date);
    const offsetPart = parts.find((part) => part.type === "timeZoneName");
    return offsetPart ? offsetPart.value.replace("GMT", "UTC") : "UTC±00:00";
  };

  // Check if DST is active
  const isDaylightSaving = (date, timeZone) => {
    const jan = new Date(date.getFullYear(), 0, 1);
    const jul = new Date(date.getFullYear(), 6, 1);
    const janOffset = getOffset(jan, timeZone);
    const julOffset = getOffset(jul, timeZone);
    const currentOffset = getOffset(date, timeZone);
    return currentOffset !== janOffset || currentOffset !== julOffset;
  };

  // Calculate times and offsets
  const calculateTimes = useCallback(() => {
    const date = new Date(dateTime);
    if (isNaN(date.getTime())) {
      setBaseTime("Invalid date");
      setCompareTime("Invalid date");
      setOffsetDifference("N/A");
      return;
    }

    const options = {
      timeZone: undefined,
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: showSeconds ? "2-digit" : undefined,
      hour12: timeFormat === "12",
    };

    const baseFormatter = new Intl.DateTimeFormat("en-US", {
      ...options,
      timeZone: baseTimeZone,
    });
    const compareFormatter = new Intl.DateTimeFormat("en-US", {
      ...options,
      timeZone: compareTimeZone,
    });

    setBaseTime(baseFormatter.format(date));
    setCompareTime(compareFormatter.format(date));

    const baseOffset = getOffset(date, baseTimeZone);
    const compareOffset = getOffset(date, compareTimeZone);

    const baseMinutes = parseOffsetToMinutes(baseOffset);
    const compareMinutes = parseOffsetToMinutes(compareOffset);
    const diffMinutes = compareMinutes - baseMinutes;

    setOffsetDifference(formatOffsetDifference(diffMinutes));
    setIsDSTBase(isDaylightSaving(date, baseTimeZone));
    setIsDSTCompare(isDaylightSaving(date, compareTimeZone));
  }, [dateTime, baseTimeZone, compareTimeZone, timeFormat, showSeconds]);

  const parseOffsetToMinutes = (offset) => {
    const match = offset.match(/([+-])(\d{2}):(\d{2})/);
    if (!match) return 0;
    const sign = match[1] === "+" ? 1 : -1;
    const hours = parseInt(match[2], 10);
    const minutes = parseInt(match[3], 10);
    return sign * (hours * 60 + minutes);
  };

  const formatOffsetDifference = (minutes) => {
    const sign = minutes >= 0 ? "+" : "-";
    const absMinutes = Math.abs(minutes);
    const hours = Math.floor(absMinutes / 60);
    const remainingMinutes = absMinutes % 60;
    return `${sign}${String(hours).padStart(2, "0")}:${String(remainingMinutes).padStart(2, "0")}`;
  };

  // Live update effect
  useEffect(() => {
    calculateTimes();
    if (updateLive) {
      const interval = setInterval(calculateTimes, 1000);
      return () => clearInterval(interval);
    }
  }, [calculateTimes, updateLive]);

  // Reset to current time
  const handleNow = () => {
    setDateTime(new Date().toISOString().slice(0, 16));
  };

  // Reset all settings
  const handleReset = () => {
    setBaseTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    setCompareTimeZone("UTC");
    setDateTime(new Date().toISOString().slice(0, 16));
    setUpdateLive(true);
    setTimeFormat("12");
    setShowSeconds(true);
    setSearchTerm("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="w-full bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Time Zone Offset Calculator
        </h1>

        <div className="space-y-6">
          {/* Input Section */}
          <div className="grid gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date/Time
                </label>
                <input
                  type="datetime-local"
                  value={dateTime}
                  onChange={(e) => setDateTime(e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={handleNow}
                className="mt-6 sm:mt-0 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <FaClock className="mr-2" /> Now
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "Base Time Zone", value: baseTimeZone, setter: setBaseTimeZone },
                {
                  label: "Compare Time Zone",
                  value: compareTimeZone,
                  setter: setCompareTimeZone,
                },
              ].map(({ label, value, setter }) => (
                <div key={label}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                  </label>
                  <select
                    value={value}
                    onChange={(e) => setter(e.target.value)}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    {filteredTimeZones.map((tz) => (
                      <option key={tz} value={tz}>
                        {tz}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            {/* Time Zone Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search Time Zones
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Type to filter time zones..."
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={updateLive}
                  onChange={(e) => setUpdateLive(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Live Update</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showSeconds}
                  onChange={(e) => setShowSeconds(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Show Seconds</span>
              </label>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time Format
                </label>
                <select
                  value={timeFormat}
                  onChange={(e) => setTimeFormat(e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="12">12-hour</option>
                  <option value="24">24-hour</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Time Zone Information
            </h2>
            <div className="grid gap-3 text-sm text-gray-700">
              <p>
                <span className="font-medium">{baseTimeZone}:</span> {baseTime}{" "}
                <span className="text-gray-500">
                  ({getOffset(new Date(dateTime), baseTimeZone)})
                </span>
                {isDSTBase && (
                  <span className="ml-2 text-green-600 flex items-center">
                    <FaSun className="mr-1" /> DST
                  </span>
                )}
              </p>
              <p>
                <span className="font-medium">{compareTimeZone}:</span> {compareTime}{" "}
                <span className="text-gray-500">
                  ({getOffset(new Date(dateTime), compareTimeZone)})
                </span>
                {isDSTCompare && (
                  <span className="ml-2 text-green-600 flex items-center">
                    <FaSun className="mr-1" /> DST
                  </span>
                )}
              </p>
              <p>
                <span className="font-medium">Offset Difference:</span> {offsetDifference}{" "}
                <span className="text-gray-500">
                  {offsetDifference.startsWith("-")
                    ? `(${baseTimeZone} is behind)`
                    : `(${baseTimeZone} is ahead)`}
                </span>
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end">
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>

          {/* Features */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Calculate time zone offsets and differences</li>
              <li>Live updates with toggle</li>
              <li>12/24-hour format and seconds toggle</li>
              <li>DST detection with indicators</li>
              <li>Custom date/time input with "Now" button</li>
              <li>Searchable time zone dropdowns</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeZoneOffsetCalculator;