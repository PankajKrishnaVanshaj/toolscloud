"use client";
import React, { useState, useCallback } from "react";
import { FaClock, FaCopy, FaSync } from "react-icons/fa";

const ISO8601Converter = () => {
  const [isoString, setIsoString] = useState("");
  const [humanReadable, setHumanReadable] = useState("");
  const [timeZone, setTimeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [error, setError] = useState("");
  const [formatOptions, setFormatOptions] = useState({
    date: true,
    time: true,
    seconds: true,
    milliseconds: false,
    timeZoneName: "short",
    hour12: true,
  });
  const [customFormat, setCustomFormat] = useState(""); // For custom Intl.DateTimeFormat

  const timeZones = Intl.supportedValuesOf("timeZone");

  // Validate and parse ISO string
  const validateAndParseISO = useCallback((input) => {
    try {
      const date = new Date(input);
      if (isNaN(date.getTime())) throw new Error("Invalid ISO 8601 string");
      return date;
    } catch (err) {
      setError(`Invalid ISO 8601 format: ${err.message}`);
      return null;
    }
  }, []);

  // Convert to ISO format
  const convertToISO = useCallback(
    (date) => {
      if (!date) return "";
      const options = {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: formatOptions.time ? "2-digit" : undefined,
        minute: formatOptions.time ? "2-digit" : undefined,
        second: formatOptions.seconds ? "2-digit" : undefined,
        fractionalSecondDigits: formatOptions.milliseconds ? 3 : undefined,
      };
      const iso = date.toISOString();
      const offset = date
        .toLocaleString("en-US", { timeZone, timeZoneName: "short" })
        .split(" ")
        .pop();
      return formatOptions.timeZoneName === "offset" ? `${iso.split(".")[0]}[${offset}]` : iso;
    },
    [timeZone, formatOptions]
  );

  // Convert to human-readable format
  const convertToHumanReadable = useCallback(
    (date) => {
      if (!date) return "";
      const options = {
        timeZone,
        year: formatOptions.date ? "numeric" : undefined,
        month: formatOptions.date ? "long" : undefined,
        day: formatOptions.date ? "numeric" : undefined,
        hour: formatOptions.time ? "2-digit" : undefined,
        minute: formatOptions.time ? "2-digit" : undefined,
        second: formatOptions.seconds ? "2-digit" : undefined,
        fractionalSecondDigits: formatOptions.milliseconds ? 3 : undefined,
        timeZoneName: formatOptions.timeZoneName !== "none" ? formatOptions.timeZoneName : undefined,
        hour12: formatOptions.hour12,
      };
      return customFormat
        ? date.toLocaleString("en-US", { ...options, ...JSON.parse(customFormat) })
        : new Intl.DateTimeFormat("en-US", options).format(date);
    },
    [timeZone, formatOptions, customFormat]
  );

  // Handle ISO input
  const handleISOInput = (value) => {
    setIsoString(value);
    setError("");
    const date = validateAndParseISO(value);
    if (date) {
      setHumanReadable(convertToHumanReadable(date));
    } else {
      setHumanReadable("");
    }
  };

  // Handle human-readable input
  const handleHumanInput = (value) => {
    setHumanReadable(value);
    setError("");
    try {
      const date = new Date(value);
      if (isNaN(date.getTime())) throw new Error("Invalid date");
      setIsoString(convertToISO(date));
    } catch {
      setIsoString("");
      setError("Invalid human-readable date format");
    }
  };

  // Set current time
  const handleNow = () => {
    const now = new Date();
    setIsoString(convertToISO(now));
    setHumanReadable(convertToHumanReadable(now));
    setError("");
  };

  // Reset all fields
  const handleReset = () => {
    setIsoString("");
    setHumanReadable("");
    setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    setError("");
    setFormatOptions({
      date: true,
      time: true,
      seconds: true,
      milliseconds: false,
      timeZoneName: "short",
      hour12: true,
    });
    setCustomFormat("");
  };

  // Handle format option changes
  const handleFormatChange = (key, value) => {
    setFormatOptions((prev) => {
      const newOptions = { ...prev, [key]: value };
      const date = validateAndParseISO(isoString) || new Date();
      setIsoString(convertToISO(date));
      setHumanReadable(convertToHumanReadable(date));
      return newOptions;
    });
  };

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          ISO 8601 Converter
        </h1>

        <div className="space-y-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 gap-4">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ISO 8601 String
              </label>
              <input
                type="text"
                value={isoString}
                onChange={(e) => handleISOInput(e.target.value)}
                placeholder="e.g., 2025-03-02T12:00:00Z"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {isoString && (
                <button
                  onClick={() => copyToClipboard(isoString)}
                  className="absolute right-2 top-9 p-1 text-gray-500 hover:text-blue-600"
                >
                  <FaCopy />
                </button>
              )}
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Human-Readable Format
              </label>
              <input
                type="text"
                value={humanReadable}
                onChange={(e) => handleHumanInput(e.target.value)}
                placeholder="e.g., March 2, 2025, 12:00 PM EST"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {humanReadable && (
                <button
                  onClick={() => copyToClipboard(humanReadable)}
                  className="absolute right-2 top-9 p-1 text-gray-500 hover:text-blue-600"
                >
                  <FaCopy />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time Zone
                </label>
                <select
                  value={timeZone}
                  onChange={(e) => setTimeZone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {timeZones.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 items-end">
                <button
                  onClick={handleNow}
                  className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <FaClock className="mr-2" /> Now
                </button>
                <button
                  onClick={handleReset}
                  className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
                >
                  <FaSync className="mr-2" /> Reset
                </button>
              </div>
            </div>
          </div>

          {/* Format Options */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Format Options</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formatOptions.date}
                    onChange={(e) => handleFormatChange("date", e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  Include Date
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formatOptions.time}
                    onChange={(e) => handleFormatChange("time", e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  Include Time
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formatOptions.seconds}
                    onChange={(e) => handleFormatChange("seconds", e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  Include Seconds
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formatOptions.milliseconds}
                    onChange={(e) => handleFormatChange("milliseconds", e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  Include Milliseconds
                </label>
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formatOptions.hour12}
                    onChange={(e) => handleFormatChange("hour12", e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  Use 12-Hour Clock
                </label>
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">
                    Time Zone Display:
                  </label>
                  <select
                    value={formatOptions.timeZoneName}
                    onChange={(e) => handleFormatChange("timeZoneName", e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="none">None</option>
                    <option value="short">Short (e.g., EST)</option>
                    <option value="long">Long (e.g., Eastern Standard Time)</option>
                    <option value="offset">Offset (e.g., -05:00)</option>
                  </select>
                </div>
                <div className="grid gap-1">
                  <label className="text-sm font-medium text-gray-700">
                    Custom Format (JSON)
                  </label>
                  <input
                    type="text"
                    value={customFormat}
                    onChange={(e) => setCustomFormat(e.target.value)}
                    placeholder='e.g., {"weekday": "long"}'
                    className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500">
                    Use Intl.DateTimeFormat options {`(e.g., {"weekday": "long"})`}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Error Section */}
          {error && (
            <div className="p-4 bg-red-50 rounded-lg text-red-700 border border-red-200">
              <p>{error}</p>
            </div>
          )}

          {/* Features & Usage */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features & Usage</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Convert between ISO 8601 and human-readable formats</li>
              <li>Support for all time zones</li>
              <li>Customizable date/time components</li>
              <li>12/24-hour clock option</li>
              <li>Copy output to clipboard</li>
              <li>Custom format with Intl.DateTimeFormat JSON</li>
              <li>Use "Now" for current timestamp</li>
              <li>Examples: 2025-03-02T12:00:00Z, March 2, 2025, 12:00 PM EST</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ISO8601Converter;