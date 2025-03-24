"use client";
import React, { useState, useCallback, useRef } from "react";
import { FaSync, FaClipboard, FaHistory } from "react-icons/fa";

const TimeAdder = () => {
  const [baseTime, setBaseTime] = useState(new Date().toISOString().slice(0, 16));
  const [duration, setDuration] = useState("");
  const [unit, setUnit] = useState("minutes");
  const [operation, setOperation] = useState("add");
  const [timeZone, setTimeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [result, setResult] = useState("");
  const [history, setHistory] = useState([]);
  const [formatOptions, setFormatOptions] = useState({
    date: true,
    time: true,
    seconds: true,
    timeZoneName: "short",
    hour12: true,
  });
  const [isCalculating, setIsCalculating] = useState(false);
  const resultRef = useRef(null);

  // Supported units
  const units = {
    seconds: 1000,
    minutes: 1000 * 60,
    hours: 1000 * 60 * 60,
    days: 1000 * 60 * 60 * 24,
    weeks: 1000 * 60 * 60 * 24 * 7,
    months: 1000 * 60 * 60 * 24 * 30, // Approximate
    years: 1000 * 60 * 60 * 24 * 365, // Approximate
  };

  // Time zones
  const timeZones = Intl.supportedValuesOf("timeZone");

  // Calculate result
  const calculateResult = useCallback(() => {
    if (!duration || isNaN(duration)) {
      setResult("Please enter a valid duration");
      return;
    }

    setIsCalculating(true);
    const baseDate = new Date(baseTime);
    if (isNaN(baseDate.getTime())) {
      setResult("Invalid base time");
      setIsCalculating(false);
      return;
    }

    const milliseconds = parseFloat(duration) * units[unit];
    const newTime = new Date(
      baseDate.getTime() + (operation === "add" ? milliseconds : -milliseconds)
    );

    const options = {
      timeZone,
      year: formatOptions.date ? "numeric" : undefined,
      month: formatOptions.date ? "long" : undefined,
      day: formatOptions.date ? "numeric" : undefined,
      hour: formatOptions.time ? "2-digit" : undefined,
      minute: formatOptions.time ? "2-digit" : undefined,
      second: formatOptions.seconds ? "2-digit" : undefined,
      timeZoneName: formatOptions.timeZoneName !== "none" ? formatOptions.timeZoneName : undefined,
      hour12: formatOptions.hour12,
    };

    const formattedResult = new Intl.DateTimeFormat("en-US", options).format(newTime);
    setResult(formattedResult);

    setHistory((prev) => [
      {
        baseTime: baseDate.toISOString(),
        duration: `${operation === "add" ? "+" : "-"}${duration} ${unit}`,
        result: formattedResult,
        timestamp: new Date().toISOString(),
      },
      ...prev,
    ].slice(0, 10)); // Keep last 10 entries, newest first

    setIsCalculating(false);
  }, [baseTime, duration, unit, operation, timeZone, formatOptions]);

  // Set to current time
  const handleNow = () => {
    const now = new Date().toISOString().slice(0, 16);
    setBaseTime(now);
    calculateResult();
  };

  // Handle format option changes
  const handleFormatChange = (key, value) => {
    setFormatOptions((prev) => {
      const newOptions = { ...prev, [key]: value };
      if (result) calculateResult(); // Recalculate with new format
      return newOptions;
    });
  };

  // Copy result to clipboard
  const copyToClipboard = () => {
    if (result && result !== "Please enter a valid duration" && result !== "Invalid base time") {
      navigator.clipboard.writeText(result);
      alert("Result copied to clipboard!");
    }
  };

  // Reset all fields
  const reset = () => {
    setBaseTime(new Date().toISOString().slice(0, 16));
    setDuration("");
    setUnit("minutes");
    setOperation("add");
    setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    setResult("");
    setHistory([]);
    setFormatOptions({
      date: true,
      time: true,
      seconds: true,
      timeZoneName: "short",
      hour12: true,
    });
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Time Adder
        </h1>

        <div className="space-y-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 gap-4">
            <div className="grid gap-2">
              <label className="block text-sm font-medium text-gray-700">Base Time</label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="datetime-local"
                  value={baseTime}
                  onChange={(e) => setBaseTime(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isCalculating}
                />
                <button
                  onClick={handleNow}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  disabled={isCalculating}
                >
                  Now
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Duration</label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g., 5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isCalculating}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Unit</label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isCalculating}
                >
                  {Object.keys(units).map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Operation</label>
                <select
                  value={operation}
                  onChange={(e) => setOperation(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isCalculating}
                >
                  <option value="add">Add</option>
                  <option value="subtract">Subtract</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time Zone</label>
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

            <button
              onClick={calculateResult}
              className="w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              disabled={isCalculating}
            >
              {isCalculating ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin h-5 w-5 mr-2 text-white"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Calculating...
                </span>
              ) : (
                "Calculate"
              )}
            </button>
          </div>

          {/* Format Options */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Format Options</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formatOptions.date}
                  onChange={(e) => handleFormatChange("date", e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={isCalculating}
                />
                Include Date
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formatOptions.time}
                  onChange={(e) => handleFormatChange("time", e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={isCalculating}
                />
                Include Time
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formatOptions.seconds}
                  onChange={(e) => handleFormatChange("seconds", e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={isCalculating}
                />
                Include Seconds
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formatOptions.hour12}
                  onChange={(e) => handleFormatChange("hour12", e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={isCalculating}
                />
                12-Hour Format
              </label>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  Time Zone Display
                </label>
                <select
                  value={formatOptions.timeZoneName}
                  onChange={(e) => handleFormatChange("timeZoneName", e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isCalculating}
                >
                  <option value="none">None</option>
                  <option value="short">Short (e.g., EST)</option>
                  <option value="long">Long (e.g., Eastern Standard Time)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Result Section */}
          {result && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold text-gray-800">Result</h2>
                <button
                  onClick={copyToClipboard}
                  className="p-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                  title="Copy to Clipboard"
                >
                  <FaClipboard />
                </button>
              </div>
              <p ref={resultRef} className="text-sm break-words">
                {result}
              </p>
            </div>
          )}

          {/* History Section */}
          {history.length > 0 && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FaHistory className="text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-800">
                  Calculation History (Last 10)
                </h2>
              </div>
              <div className="space-y-2 text-sm max-h-48 overflow-y-auto">
                {history.map((entry, index) => (
                  <div
                    key={index}
                    className="p-2 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    <p>
                      <span className="font-medium">
                        {new Date(entry.timestamp).toLocaleString()}
                      </span>
                      : {entry.baseTime} {entry.duration} = {entry.result}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={reset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={isCalculating}
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>

          {/* Features Section */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Add or subtract time from a base date/time</li>
              <li>Supports multiple units (seconds to years)</li>
              <li>Time zone selection with global options</li>
              <li>Customizable output format (date, time, 12/24-hour)</li>
              <li>History of last 10 calculations</li>
              <li>Copy result to clipboard</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeAdder;