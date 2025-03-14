"use client";
import React, { useState, useCallback, useEffect } from "react";
import { FaSync, FaClock, FaCopy } from "react-icons/fa";

const TimeSubtractor = () => {
  const [startTime, setStartTime] = useState(new Date().toISOString().slice(0, 16));
  const [subtractValue, setSubtractValue] = useState("");
  const [subtractUnit, setSubtractUnit] = useState("minutes");
  const [timeZone, setTimeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [formatOptions, setFormatOptions] = useState({
    showSeconds: true,
    hour12: true,
    showTimeZone: true,
  });

  // Time units in milliseconds
  const timeUnits = {
    seconds: 1000,
    minutes: 60 * 1000,
    hours: 60 * 60 * 1000,
    days: 24 * 60 * 60 * 1000,
    weeks: 7 * 24 * 60 * 60 * 1000,
    months: 30 * 24 * 60 * 60 * 1000, // Approximate
    years: 365 * 24 * 60 * 60 * 1000, // Approximate
  };

  const timeZones = Intl.supportedValuesOf("timeZone");

  // Calculate result
  const subtractTime = useCallback(() => {
    setError("");
    setResult(null);

    if (!subtractValue || isNaN(subtractValue) || parseFloat(subtractValue) < 0) {
      setError("Please enter a valid positive numeric value to subtract");
      return;
    }

    try {
      const startDate = new Date(startTime);
      if (isNaN(startDate.getTime())) {
        throw new Error("Invalid start time");
      }

      const subtractMs = parseFloat(subtractValue) * timeUnits[subtractUnit];
      const resultDate = new Date(startDate.getTime() - subtractMs);

      const options = {
        timeZone,
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: formatOptions.showSeconds ? "2-digit" : undefined,
        hour12: formatOptions.hour12,
        timeZoneName: formatOptions.showTimeZone ? "short" : undefined,
      };

      const formattedResult = new Intl.DateTimeFormat("en-US", options).format(resultDate);
      const isoResult = resultDate.toISOString();

      setResult({
        humanReadable: formattedResult,
        iso: isoResult,
        timestamp: resultDate.getTime(),
      });
    } catch (err) {
      setError(`Error: ${err.message}`);
    }
  }, [startTime, subtractValue, subtractUnit, timeZone, formatOptions]);

  // Auto-update effect
  useEffect(() => {
    if (autoUpdate && subtractValue) {
      subtractTime();
    }
  }, [startTime, subtractValue, subtractUnit, timeZone, autoUpdate, subtractTime]);

  // Set to current time
  const handleNow = () => {
    setStartTime(new Date().toISOString().slice(0, 16));
  };

  // Copy result to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  // Reset all inputs
  const reset = () => {
    setStartTime(new Date().toISOString().slice(0, 16));
    setSubtractValue("");
    setSubtractUnit("minutes");
    setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    setResult(null);
    setError("");
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Time Subtractor
        </h1>

        <div className="space-y-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time
              </label>
              <div className="flex gap-2">
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleNow}
                  className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  title="Set to Now"
                >
                  <FaClock />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subtract Amount
              </label>
              <input
                type="number"
                value={subtractValue}
                onChange={(e) => setSubtractValue(e.target.value)}
                placeholder="Enter value"
                min="0"
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit
              </label>
              <select
                value={subtractUnit}
                onChange={(e) => setSubtractUnit(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                {Object.keys(timeUnits).map((unit) => (
                  <option key={unit} value={unit}>
                    {unit.charAt(0).toUpperCase() + unit.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time Zone
              </label>
              <select
                value={timeZone}
                onChange={(e) => setTimeZone(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                {timeZones.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Settings */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Display Options</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formatOptions.showSeconds}
                  onChange={(e) =>
                    setFormatOptions((prev) => ({
                      ...prev,
                      showSeconds: e.target.checked,
                    }))
                  }
                  className="mr-2 accent-blue-500"
                />
                <span className="text-sm text-gray-600">Show Seconds</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formatOptions.hour12}
                  onChange={(e) =>
                    setFormatOptions((prev) => ({
                      ...prev,
                      hour12: e.target.checked,
                    }))
                  }
                  className="mr-2 accent-blue-500"
                />
                <span className="text-sm text-gray-600">12-Hour Format</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formatOptions.showTimeZone}
                  onChange={(e) =>
                    setFormatOptions((prev) => ({
                      ...prev,
                      showTimeZone: e.target.checked,
                    }))
                  }
                  className="mr-2 accent-blue-500"
                />
                <span className="text-sm text-gray-600">Show Time Zone</span>
              </label>
            </div>
            <label className="flex items-center mt-2">
              <input
                type="checkbox"
                checked={autoUpdate}
                onChange={(e) => setAutoUpdate(e.target.checked)}
                className="mr-2 accent-blue-500"
              />
              <span className="text-sm text-gray-600">Auto-Update Result</span>
            </label>
          </div>

          {/* Results */}
          {result && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h2 className="text-lg font-semibold text-green-700 mb-2">Result</h2>
              <div className="space-y-2 text-sm text-green-600">
                <p className="flex items-center justify-between">
                  <span>
                    <strong>Human-Readable:</strong> {result.humanReadable}
                  </span>
                  <button
                    onClick={() => copyToClipboard(result.humanReadable)}
                    className="p-1 text-gray-500 hover:text-gray-700"
                    title="Copy"
                  >
                    <FaCopy />
                  </button>
                </p>
                <p className="flex items-center justify-between">
                  <span>
                    <strong>ISO 8601:</strong> {result.iso}
                  </span>
                  <button
                    onClick={() => copyToClipboard(result.iso)}
                    className="p-1 text-gray-500 hover:text-gray-700"
                    title="Copy"
                  >
                    <FaCopy />
                  </button>
                </p>
                <p className="flex items-center justify-between">
                  <span>
                    <strong>Unix Timestamp:</strong> {result.timestamp}
                  </span>
                  <button
                    onClick={() => copyToClipboard(result.timestamp.toString())}
                    className="p-1 text-gray-500 hover:text-gray-700"
                    title="Copy"
                  >
                    <FaCopy />
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-50 rounded-lg border border-red-200 text-red-700">
              <p>{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={subtractTime}
              disabled={!subtractValue || autoUpdate}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Calculate
            </button>
            <button
              onClick={reset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>

          {/* Features */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Subtract time in multiple units</li>
              <li>Customizable time zone</li>
              <li>Flexible display options (seconds, 12/24-hour, time zone)</li>
              <li>Auto-update toggle</li>
              <li>Copy results to clipboard</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeSubtractor;