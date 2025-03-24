"use client";
import React, { useState, useCallback } from "react";
import { FaSync, FaClock } from "react-icons/fa";

const TimeConverter = () => {
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("s");
  const [elapsedDays, setElapsedDays] = useState("");
  const [sourceTimezone, setSourceTimezone] = useState("UTC");
  const [targetTimezone, setTargetTimezone] = useState("UTC");
  const [customDate, setCustomDate] = useState("");
  const [displayFormat, setDisplayFormat] = useState("exponential");

  // Conversion factors to seconds (s)
  const conversionFactors = {
    s: 1, // Seconds
    ms: 1e-3, // Milliseconds
    μs: 1e-6, // Microseconds
    ns: 1e-9, // Nanoseconds
    min: 60, // Minutes
    h: 3600, // Hours
    d: 86400, // Days
    w: 604800, // Weeks
    y: 31536000, // Years (assuming 365 days)
    decade: 315360000, // Decades
    century: 3153600000, // Centuries
  };

  // Display names for units
  const unitDisplayNames = {
    s: "Seconds (s)",
    ms: "Milliseconds (ms)",
    μs: "Microseconds (μs)",
    ns: "Nanoseconds (ns)",
    min: "Minutes (min)",
    h: "Hours (h)",
    d: "Days (d)",
    w: "Weeks (w)",
    y: "Years (y)",
    decade: "Decades",
    century: "Centuries",
  };

  // Common time zones with offsets from UTC in hours
  const timezones = {
    UTC: 0,
    EST: -5, // Eastern Standard Time
    EDT: -4, // Eastern Daylight Time
    CST: -6, // Central Standard Time
    CDT: -5, // Central Daylight Time
    MST: -7, // Mountain Standard Time
    MDT: -6, // Mountain Daylight Time
    PST: -8, // Pacific Standard Time
    PDT: -7, // Pacific Daylight Time
    GMT: 0, // Greenwich Mean Time
    IST: 5.5, // Indian Standard Time
    CET: 1, // Central European Time
    JST: 9, // Japan Standard Time
  };

  // Format number based on display preference
  const formatNumber = (num) => {
    if (isNaN(num) || num === null) return "N/A";
    switch (displayFormat) {
      case "exponential":
        return num.toExponential(4);
      case "fixed":
        return num.toFixed(2);
      case "locale":
        return num.toLocaleString();
      default:
        return num.toString();
    }
  };

  // Convert value to all units
  const convertValue = useCallback((inputValue, fromUnit) => {
    if (!inputValue || isNaN(inputValue)) return {};
    const valueInSeconds = inputValue * conversionFactors[fromUnit];
    return Object.keys(conversionFactors).reduce((acc, unit) => {
      acc[unit] = valueInSeconds / conversionFactors[unit];
      return acc;
    }, {});
  }, []);

  // Calculate elapsed time
  const calculateElapsedTime = useCallback(() => {
    if (!value || !elapsedDays || isNaN(value) || isNaN(elapsedDays)) return null;
    const initialSeconds = value * conversionFactors[unit];
    const elapsedSeconds = elapsedDays * conversionFactors.d;
    return initialSeconds + elapsedSeconds;
  }, [value, unit, elapsedDays]);

  // Convert timezone
  const convertTimezone = useCallback(() => {
    if (!value || isNaN(value)) return null;
    const seconds = value * conversionFactors[unit];
    const offsetDiff = (timezones[targetTimezone] - timezones[sourceTimezone]) * 3600;
    return seconds + offsetDiff;
  }, [value, unit, sourceTimezone, targetTimezone]);

  // Convert to date
  const convertToDate = useCallback(() => {
    if (!value || isNaN(value) || !customDate) return null;
    const seconds = value * conversionFactors[unit];
    const date = new Date(customDate);
    date.setSeconds(date.getSeconds() + seconds);
    return date.toLocaleString();
  }, [value, unit, customDate]);

  // Reset all fields
  const reset = () => {
    setValue("");
    setUnit("s");
    setElapsedDays("");
    setSourceTimezone("UTC");
    setTargetTimezone("UTC");
    setCustomDate("");
    setDisplayFormat("exponential");
  };

  const results = convertValue(value, unit);
  const elapsedTime = calculateElapsedTime();
  const timezoneConverted = convertTimezone();
  const dateResult = convertToDate();

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Time Converter
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time Value
              </label>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Enter value"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.keys(conversionFactors).map((u) => (
                  <option key={u} value={u}>
                    {unitDisplayNames[u]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Elapsed Days
              </label>
              <input
                type="number"
                value={elapsedDays}
                onChange={(e) => setElapsedDays(e.target.value)}
                placeholder="Enter days"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Format
              </label>
              <select
                value={displayFormat}
                onChange={(e) => setDisplayFormat(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="exponential">Exponential</option>
                <option value="fixed">Fixed (2 decimals)</option>
                <option value="locale">Locale String</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Timezone Conversion
              </label>
              <div className="flex gap-2 items-center">
                <select
                  value={sourceTimezone}
                  onChange={(e) => setSourceTimezone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.keys(timezones).map((tz) => (
                    <option key={tz} value={tz}>
                      {tz} (UTC{timezones[tz] >= 0 ? "+" : ""}{timezones[tz]})
                    </option>
                  ))}
                </select>
                <span className="text-gray-500">→</span>
                <select
                  value={targetTimezone}
                  onChange={(e) => setTargetTimezone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.keys(timezones).map((tz) => (
                    <option key={tz} value={tz}>
                      {tz} (UTC{timezones[tz] >= 0 ? "+" : ""}{timezones[tz]})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Custom Start Date
              </label>
              <input
                type="datetime-local"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Results Section */}
          {value && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h2 className="text-lg font-semibold mb-2 text-gray-700">
                  Unit Conversions
                </h2>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                  {Object.entries(results).map(([unit, val]) => (
                    <p key={unit}>
                      {unitDisplayNames[unit].split(" ")[0]}: {formatNumber(val)}
                    </p>
                  ))}
                </div>
              </div>

              {elapsedTime && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h2 className="text-lg font-semibold mb-2 text-blue-700">
                    After Elapsed Time
                  </h2>
                  <p>s: {formatNumber(elapsedTime)}</p>
                  <p>d: {formatNumber(elapsedTime / conversionFactors.d)}</p>
                  <p className="mt-2 text-sm text-blue-600">
                    Initial + {elapsedDays} days
                  </p>
                </div>
              )}

              {timezoneConverted && (
                <div className="p-4 bg-green-50 rounded-lg">
                  <h2 className="text-lg font-semibold mb-2 text-green-700">
                    Timezone Result
                  </h2>
                  <p>s: {formatNumber(timezoneConverted)}</p>
                  <p>h: {formatNumber(timezoneConverted / conversionFactors.h)}</p>
                  <p className="mt-2 text-sm text-green-600">
                    Offset: {timezones[targetTimezone] - timezones[sourceTimezone]}h
                  </p>
                </div>
              )}

              {dateResult && (
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h2 className="text-lg font-semibold mb-2 text-purple-700">
                    Resulting Date
                  </h2>
                  <p>{dateResult}</p>
                  <p className="mt-2 text-sm text-purple-600">
                    From: {new Date(customDate).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Reset Button */}
          <div className="flex justify-center">
            <button
              onClick={reset}
              className="py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Convert between multiple time units</li>
            <li>Calculate elapsed time in days</li>
            <li>Timezone conversion with offset display</li>
            <li>Custom date calculation</li>
            <li>Flexible display formats (exponential, fixed, locale)</li>
          </ul>
        </div>

        {/* Conversion References */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <details>
            <summary className="cursor-pointer font-medium text-gray-700">
              Conversion References
            </summary>
            <ul className="list-disc list-inside mt-2 text-sm text-gray-600">
              <li>1 min = 60 s</li>
              <li>1 h = 3,600 s</li>
              <li>1 d = 86,400 s</li>
              <li>1 w = 604,800 s</li>
              <li>1 y = 31,536,000 s (365 days)</li>
              <li>1 century = 3,153,600,000 s</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default TimeConverter;