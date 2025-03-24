"use client";
import React, { useState, useCallback } from "react";
import { FaClock, FaSync, FaCopy } from "react-icons/fa";

const TimeToDecimalConverter = () => {
  const [timeInput, setTimeInput] = useState("");
  const [decimalOutput, setDecimalOutput] = useState("");
  const [timeZone, setTimeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [options, setOptions] = useState({
    format: "24h", // 24h or 12h
    seconds: false,
    rounding: 2, // Decimal places
    autoUpdate: true, // Auto-convert on input
  });

  const timeZones = Intl.supportedValuesOf("timeZone");

  // Parse time to decimal
  const parseTimeToDecimal = useCallback(
    (timeStr, is12h = false) => {
      const regex = is12h
        ? /^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?$/i
        : /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/;
      const match = timeStr.match(regex);
      if (!match) {
        setError("Invalid time format. Use HH:MM[:SS] or HH:MM:SS AM/PM");
        return null;
      }

      let hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      const seconds = match[3] ? parseInt(match[3], 10) : 0;
      const period = is12h && match[4] ? match[4].toUpperCase() : null;

      if (is12h) {
        if (hours < 1 || hours > 12) {
          setError("Hours must be between 1 and 12 for 12-hour format");
          return null;
        }
        if (period === "PM" && hours !== 12) hours += 12;
        if (period === "AM" && hours === 12) hours = 0;
      } else if (hours > 23) {
        setError("Hours must be between 0 and 23 for 24-hour format");
        return null;
      }

      if (minutes > 59 || seconds > 59) {
        setError("Minutes and seconds must be between 0 and 59");
        return null;
      }

      const decimal = hours + minutes / 60 + seconds / 3600;
      return Number(decimal.toFixed(options.rounding));
    },
    [options.rounding]
  );

  // Convert decimal to time
  const convertDecimalToTime = useCallback(
    (decimal) => {
      if (isNaN(decimal)) {
        setError("Invalid decimal value");
        return "";
      }

      const totalSeconds = Math.round(decimal * 3600);
      let hours = Math.floor(totalSeconds / 3600);
      const remainingSeconds = totalSeconds % 3600;
      const minutes = Math.floor(remainingSeconds / 60);
      const seconds = remainingSeconds % 60;

      if (options.format === "12h") {
        const period = hours >= 12 ? "PM" : "AM";
        hours = hours % 12 || 12;
        return `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}${options.seconds ? `:${seconds.toString().padStart(2, "0")}` : ""} ${period}`;
      }

      return `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}${options.seconds ? `:${seconds.toString().padStart(2, "0")}` : ""}`;
    },
    [options.format, options.seconds]
  );

  // Handle time input
  const handleTimeInput = (value) => {
    setTimeInput(value);
    setError("");
    if (options.autoUpdate) {
      const decimal = parseTimeToDecimal(value, options.format === "12h");
      if (decimal !== null) {
        setDecimalOutput(decimal.toString());
        setHistory((prev) => [
          { time: value, decimal: decimal.toString() },
          ...prev.slice(0, 9),
        ]);
      } else {
        setDecimalOutput("");
      }
    }
  };

  // Handle decimal input
  const handleDecimalInput = (value) => {
    setDecimalOutput(value);
    setError("");
    if (options.autoUpdate) {
      const decimal = parseFloat(value);
      if (!isNaN(decimal)) {
        const time = convertDecimalToTime(decimal);
        setTimeInput(time);
        setHistory((prev) => [
          { time, decimal: value },
          ...prev.slice(0, 9),
        ]);
      } else {
        setTimeInput("");
      }
    }
  };

  // Set current time
  const handleNow = () => {
    const now = new Date().toLocaleTimeString("en-US", {
      timeZone,
      hour12: options.format === "12h",
    });
    const timeStr = options.seconds
      ? now
      : now.slice(0, 5) + (options.format === "12h" ? now.slice(8) : "");
    setTimeInput(timeStr);
    const decimal = parseTimeToDecimal(timeStr, options.format === "12h");
    if (decimal !== null) {
      setDecimalOutput(decimal.toString());
      setHistory((prev) => [
        { time: timeStr, decimal: decimal.toString() },
        ...prev.slice(0, 9),
      ]);
    }
  };

  // Manual convert button
  const handleConvert = () => {
    if (timeInput) {
      const decimal = parseTimeToDecimal(timeInput, options.format === "12h");
      if (decimal !== null) {
        setDecimalOutput(decimal.toString());
        setHistory((prev) => [
          { time: timeInput, decimal: decimal.toString() },
          ...prev.slice(0, 9),
        ]);
      }
    } else if (decimalOutput) {
      const decimal = parseFloat(decimalOutput);
      if (!isNaN(decimal)) {
        const time = convertDecimalToTime(decimal);
        setTimeInput(time);
        setHistory((prev) => [
          { time, decimal: decimalOutput },
          ...prev.slice(0, 9),
        ]);
      }
    }
  };

  // Reset all
  const reset = () => {
    setTimeInput("");
    setDecimalOutput("");
    setError("");
    setHistory([]);
  };

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  // Update options
  const handleOptionChange = (key, value) => {
    setOptions((prev) => {
      const newOptions = { ...prev, [key]: value };
      if (timeInput && options.autoUpdate) {
        const decimal = parseTimeToDecimal(timeInput, newOptions.format === "12h");
        if (decimal !== null) setDecimalOutput(decimal.toString());
      } else if (decimalOutput && options.autoUpdate) {
        setTimeInput(convertDecimalToTime(parseFloat(decimalOutput)));
      }
      return newOptions;
    });
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Time to Decimal Converter
        </h1>

        <div className="space-y-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time (HH:MM[:SS])
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={timeInput}
                  onChange={(e) => handleTimeInput(e.target.value)}
                  placeholder={options.format === "12h" ? "12:00 PM" : "12:00"}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {timeInput && (
                  <button
                    onClick={() => copyToClipboard(timeInput)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    <FaCopy />
                  </button>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Decimal Hours
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={decimalOutput}
                  onChange={(e) => handleDecimalInput(e.target.value)}
                  placeholder="e.g., 12.5"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {decimalOutput && (
                  <button
                    onClick={() => copyToClipboard(decimalOutput)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    <FaCopy />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleNow}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <FaClock className="mr-2" /> Current Time
            </button>
            {!options.autoUpdate && (
              <button
                onClick={handleConvert}
                disabled={!timeInput && !decimalOutput}
                className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Convert
              </button>
            )}
            <button
              onClick={reset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>

          {/* Options Section */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-2 text-gray-700">Options</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time Format
                </label>
                <select
                  value={options.format}
                  onChange={(e) => handleOptionChange("format", e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="24h">24-hour</option>
                  <option value="12h">12-hour (AM/PM)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Decimal Places
                </label>
                <select
                  value={options.rounding}
                  onChange={(e) => handleOptionChange("rounding", parseInt(e.target.value))}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  {[1, 2, 3, 4].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={options.seconds}
                    onChange={(e) => handleOptionChange("seconds", e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Include Seconds</span>
                </label>
              </div>
              <div className="flex items-center">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={options.autoUpdate}
                    onChange={(e) => handleOptionChange("autoUpdate", e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Auto-Convert</span>
                </label>
              </div>
            </div>
            <div className="mt-4">
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

          {/* Error Section */}
          {error && (
            <div className="p-4 bg-red-50 rounded-lg text-red-700">
              <p>{error}</p>
            </div>
          )}

          {/* History Section */}
          {history.length > 0 && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h2 className="text-lg font-semibold mb-2 text-gray-700">Conversion History</h2>
              <ul className="text-sm text-gray-600 space-y-1 max-h-40 overflow-y-auto">
                {history.map((entry, index) => (
                  <li key={index}>
                    {entry.time} → {entry.decimal}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Features Section */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Bidirectional conversion: time to decimal and decimal to time</li>
              <li>Supports 24-hour and 12-hour formats</li>
              <li>Time zone support for current time</li>
              <li>Customizable precision, seconds, and auto-conversion</li>
              <li>Copy results to clipboard</li>
              <li>Conversion history (last 10 entries)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeToDecimalConverter;