"use client";
import React, { useState, useCallback } from "react";
import { FaSync, FaCopy, FaClock } from "react-icons/fa";

const TimeToSecondsConverter = () => {
  const [timeInput, setTimeInput] = useState("");
  const [seconds, setSeconds] = useState("");
  const [error, setError] = useState("");
  const [format, setFormat] = useState("short"); // 'short' (h/m/s) or 'long' (hours/minutes/seconds)
  const [includeDays, setIncludeDays] = useState(false);
  const [precision, setPrecision] = useState(2); // Decimal places for output
  const [history, setHistory] = useState([]);

  // Regular expressions for parsing time formats
  const timePatterns = {
    short: /(\d+\.?\d*)\s*(d|h|m|s)/gi,
    long: /(\d+\.?\d*)\s*(days?|hours?|minutes?|seconds?)/gi,
  };

  const conversionFactors = {
    d: 86400, // days
    h: 3600,  // hours
    m: 60,    // minutes
    s: 1,     // seconds
  };

  // Convert time to seconds
  const convertToSeconds = useCallback(
    (input) => {
      setError("");
      if (!input.trim()) {
        setSeconds("");
        return;
      }

      const pattern = timePatterns[format];
      let totalSeconds = 0;
      let match;

      while ((match = pattern.exec(input)) !== null) {
        const value = parseFloat(match[1]);
        const unit =
          format === "short"
            ? match[2].toLowerCase()
            : match[2].toLowerCase().startsWith("d")
            ? "d"
            : match[2].toLowerCase().startsWith("h")
            ? "h"
            : match[2].toLowerCase().startsWith("m")
            ? "m"
            : "s";

        if (!includeDays && unit === "d") {
          setError('Days not allowed unless "Include Days" is enabled');
          setSeconds("");
          return;
        }

        totalSeconds += value * conversionFactors[unit];
      }

      if (totalSeconds === 0 && input.trim()) {
        setError(`Invalid time format. Use e.g., "${format === "short" ? "1h 30m 15s" : "1 hour 30 minutes 15 seconds"}"`);
        setSeconds("");
        return;
      }

      const formattedSeconds = totalSeconds.toFixed(precision);
      setSeconds(formattedSeconds);
      setHistory((prev) => [
        { time: input, seconds: formattedSeconds, timestamp: new Date().toLocaleTimeString() },
        ...prev.slice(0, 9),
      ]);
    },
    [format, includeDays, precision]
  );

  // Convert seconds to time
  const convertFromSeconds = useCallback(
    (input) => {
      setError("");
      if (!input || isNaN(input)) {
        setTimeInput("");
        return;
      }

      const totalSeconds = parseFloat(input);
      if (totalSeconds < 0) {
        setError("Seconds cannot be negative");
        setTimeInput("");
        return;
      }

      let remainingSeconds = totalSeconds;
      const parts = [];

      if (includeDays) {
        const days = Math.floor(remainingSeconds / conversionFactors.d);
        if (days > 0) {
          parts.push(`${days}${format === "short" ? "d" : " days"}`);
          remainingSeconds %= conversionFactors.d;
        }
      }

      const hours = Math.floor(remainingSeconds / conversionFactors.h);
      if (hours > 0) {
        parts.push(`${hours}${format === "short" ? "h" : " hours"}`);
        remainingSeconds %= conversionFactors.h;
      }

      const minutes = Math.floor(remainingSeconds / conversionFactors.m);
      if (minutes > 0) {
        parts.push(`${minutes}${format === "short" ? "m" : " minutes"}`);
        remainingSeconds %= conversionFactors.m;
      }

      const secondsPart = Number(remainingSeconds.toFixed(precision));
      if (secondsPart > 0 || parts.length === 0) {
        parts.push(`${secondsPart}${format === "short" ? "s" : " seconds"}`);
      }

      const result = parts.join(" ");
      setTimeInput(result);
      setHistory((prev) => [
        { time: result, seconds: totalSeconds.toFixed(precision), timestamp: new Date().toLocaleTimeString() },
        ...prev.slice(0, 9),
      ]);
    },
    [format, includeDays, precision]
  );

  const handleTimeInput = (value) => {
    setTimeInput(value);
    convertToSeconds(value);
  };

  const handleSecondsInput = (value) => {
    setSeconds(value);
    convertFromSeconds(value);
  };

  const reset = () => {
    setTimeInput("");
    setSeconds("");
    setError("");
    setHistory([]);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Time to Seconds Converter
        </h1>

        <div className="space-y-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Time Format
              </label>
              <input
                type="text"
                value={timeInput}
                onChange={(e) => handleTimeInput(e.target.value)}
                placeholder={format === "short" ? "e.g., 1d 2h 30m 15s" : "e.g., 1 day 2 hours 30 minutes"}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => copyToClipboard(timeInput)}
                disabled={!timeInput}
                className="mt-1 w-full py-1 px-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed flex items-center justify-center text-sm"
              >
                <FaCopy className="mr-2" /> Copy
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Total Seconds
              </label>
              <input
                type="number"
                value={seconds}
                onChange={(e) => handleSecondsInput(e.target.value)}
                placeholder="e.g., 9015"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => copyToClipboard(seconds)}
                disabled={!seconds}
                className="mt-1 w-full py-1 px-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed flex items-center justify-center text-sm"
              >
                <FaCopy className="mr-2" /> Copy
              </button>
            </div>
          </div>

          {/* Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Input Format
              </label>
              <select
                value={format}
                onChange={(e) => {
                  setFormat(e.target.value);
                  convertToSeconds(timeInput);
                  convertFromSeconds(seconds);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="short">Short (h/m/s)</option>
                <option value="long">Long (hours/minutes/seconds)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precision (decimals)
              </label>
              <input
                type="number"
                min="0"
                max="6"
                value={precision}
                onChange={(e) => {
                  const value = Math.max(0, Math.min(6, e.target.value));
                  setPrecision(value);
                  convertToSeconds(timeInput);
                  convertFromSeconds(seconds);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={includeDays}
                onChange={(e) => {
                  setIncludeDays(e.target.checked);
                  convertToSeconds(timeInput);
                  convertFromSeconds(seconds);
                }}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="text-sm font-medium text-gray-700">
                Include Days
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center">
            <button
              onClick={reset}
              className="py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
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
              <h3 className="font-semibold text-gray-700 mb-2 flex items-center">
                <FaClock className="mr-2" /> Conversion History
              </h3>
              <ul className="text-sm text-gray-600 space-y-2 max-h-40 overflow-y-auto">
                {history.map((entry, index) => (
                  <li key={index} className="flex justify-between">
                    <span>
                      {entry.time} = {entry.seconds}s
                    </span>
                    <span className="text-gray-400">{entry.timestamp}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Features Section */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Bidirectional conversion between time and seconds</li>
              <li>Supports short (h/m/s) and long (hours/minutes/seconds) formats</li>
              <li>Optional days support with toggle</li>
              <li>Adjustable decimal precision (0-6)</li>
              <li>Copy results to clipboard</li>
              <li>Conversion history (last 10 entries)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeToSecondsConverter;