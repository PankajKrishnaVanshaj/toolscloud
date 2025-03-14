"use client";
import React, { useState, useCallback } from "react";
import { FaSync, FaClock, FaCopy } from "react-icons/fa";

const TimeRoundingTool = () => {
  const [inputTime, setInputTime] = useState(new Date().toISOString().slice(0, 16));
  const [timeZone, setTimeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [interval, setInterval] = useState("15"); // minutes
  const [direction, setDirection] = useState("nearest");
  const [outputFormat, setOutputFormat] = useState("iso");
  const [customInterval, setCustomInterval] = useState("");
  const [roundedTime, setRoundedTime] = useState("");
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);

  // Time zones
  const timeZones = Intl.supportedValuesOf("timeZone");

  // Rounding intervals (in minutes)
  const intervals = ["1", "5", "10", "15", "30", "60", "custom"];

  // Rounding directions
  const directions = ["nearest", "up", "down"];

  // Output formats
  const formats = {
    iso: "ISO 8601",
    human: "Human-Readable",
    timestamp: "Unix Timestamp",
    custom: "Custom Format",
  };

  const roundTime = useCallback((date, intervalMinutes, direction) => {
    const msPerMinute = 60 * 1000;
    const intervalMs = intervalMinutes * msPerMinute;
    const timeMs = date.getTime();

    switch (direction) {
      case "nearest":
        return new Date(Math.round(timeMs / intervalMs) * intervalMs);
      case "up":
        return new Date(Math.ceil(timeMs / intervalMs) * intervalMs);
      case "down":
        return new Date(Math.floor(timeMs / intervalMs) * intervalMs);
      default:
        return date;
    }
  }, []);

  const formatOutput = useCallback(
    (date) => {
      switch (outputFormat) {
        case "iso":
          return date.toISOString();
        case "human":
          return new Intl.DateTimeFormat("en-US", {
            timeZone,
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
          }).format(date);
        case "timestamp":
          return Math.floor(date.getTime() / 1000).toString();
        case "custom":
          // Example custom format: "YYYY-MM-DD HH:mm"
          return date
            .toLocaleString("en-US", {
              timeZone,
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })
            .replace(/,/, "");
        default:
          return date.toISOString();
      }
    },
    [outputFormat, timeZone]
  );

  const handleInputChange = (value) => {
    setInputTime(value);
    setError("");
    try {
      const date = new Date(value);
      if (isNaN(date.getTime())) throw new Error("Invalid date");
      const intervalToUse =
        interval === "custom" && customInterval ? parseInt(customInterval) : parseInt(interval);
      if (isNaN(intervalToUse) || intervalToUse <= 0) throw new Error("Invalid interval");
      const rounded = roundTime(date, intervalToUse, direction);
      const formatted = formatOutput(rounded);
      setRoundedTime(formatted);
      setHistory((prev) => [
        { input: value, output: formatted, interval: intervalToUse, direction, timeZone },
        ...prev.slice(0, 9),
      ]);
    } catch (err) {
      setError(`Error: ${err.message}`);
      setRoundedTime("");
    }
  };

  const handleNow = () => {
    const now = new Date();
    setInputTime(now.toISOString().slice(0, 16));
    handleInputChange(now.toISOString().slice(0, 16));
  };

  const reset = () => {
    const now = new Date();
    setInputTime(now.toISOString().slice(0, 16));
    setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    setInterval("15");
    setDirection("nearest");
    setOutputFormat("iso");
    setCustomInterval("");
    setRoundedTime("");
    setError("");
    setHistory([]);
    handleInputChange(now.toISOString().slice(0, 16));
  };

  const copyToClipboard = () => {
    if (roundedTime) {
      navigator.clipboard.writeText(roundedTime);
      alert("Copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Time Rounding Tool
        </h1>

        <div className="space-y-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Input Time</label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="datetime-local"
                  value={inputTime}
                  onChange={(e) => handleInputChange(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleNow}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <FaClock className="mr-2" /> Now
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time Zone</label>
                <select
                  value={timeZone}
                  onChange={(e) => setTimeZone(e.target.value)}
                  onBlur={() => handleInputChange(inputTime)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {timeZones.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rounding Interval (minutes)
                </label>
                <select
                  value={interval}
                  onChange={(e) => setInterval(e.target.value)}
                  onBlur={() => handleInputChange(inputTime)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {intervals.map((int) => (
                    <option key={int} value={int}>
                      {int === "custom" ? "Custom" : int}
                    </option>
                  ))}
                </select>
                {interval === "custom" && (
                  <input
                    type="number"
                    value={customInterval}
                    onChange={(e) => {
                      setCustomInterval(e.target.value);
                      handleInputChange(inputTime);
                    }}
                    min="1"
                    placeholder="Enter minutes"
                    className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rounding Direction
                </label>
                <select
                  value={direction}
                  onChange={(e) => setDirection(e.target.value)}
                  onBlur={() => handleInputChange(inputTime)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {directions.map((dir) => (
                    <option key={dir} value={dir}>
                      {dir.charAt(0).toUpperCase() + dir.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Output Format
                </label>
                <select
                  value={outputFormat}
                  onChange={(e) => setOutputFormat(e.target.value)}
                  onBlur={() => handleInputChange(inputTime)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(formats).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold text-gray-700">Rounded Time:</h2>
              {roundedTime && (
                <button
                  onClick={copyToClipboard}
                  className="p-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  <FaCopy />
                </button>
              )}
            </div>
            <p className="text-sm text-gray-600 break-all">
              {roundedTime || "Enter a valid time to see the result"}
            </p>
          </div>

          {/* Error Section */}
          {error && (
            <div className="p-4 bg-red-50 rounded-lg text-red-700">
              <p>{error}</p>
            </div>
          )}

          {/* History Section */}
          {history.length > 0 && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-700 mb-2">History</h3>
              <ul className="text-sm text-blue-600 space-y-2 max-h-48 overflow-y-auto">
                {history.map((entry, index) => (
                  <li key={index} className="break-all">
                    {entry.input} → {entry.output} (Interval: {entry.interval}m, Direction:{" "}
                    {entry.direction}, Zone: {entry.timeZone})
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end">
            <button
              onClick={reset}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>

          {/* Features Section */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Rounds time to preset or custom intervals</li>
              <li>Supports Nearest, Up, and Down rounding</li>
              <li>Multiple output formats including custom</li>
              <li>Time zone support</li>
              <li>History of recent calculations</li>
              <li>Copy result to clipboard</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeRoundingTool;