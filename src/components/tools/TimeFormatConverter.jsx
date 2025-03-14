"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaClock, FaSync, FaCopy } from "react-icons/fa";

const TimeFormatConverter = () => {
  const [inputValue, setInputValue] = useState("");
  const [inputFormat, setInputFormat] = useState("iso");
  const [timeZone, setTimeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [customFormat, setCustomFormat] = useState("HH:mm:ss");
  const [output, setOutput] = useState({});
  const [error, setError] = useState("");
  const [autoUpdate, setAutoUpdate] = useState(false);

  // Supported input formats
  const formats = {
    iso: "ISO 8601 (e.g., 2025-03-02T14:30:00Z)",
    "12h": "12-Hour (e.g., 02:30:00 PM)",
    "24h": "24-Hour (e.g., 14:30:00)",
    unix: "UNIX Timestamp (e.g., 1743592200)",
    rfc2822: "RFC 2822 (e.g., Sun, 02 Mar 2025 14:30:00 GMT)",
    custom: "Custom Format",
  };

  const timeZones = Intl.supportedValuesOf("timeZone");

  // Parse input based on selected format
  const parseInput = useCallback((value, format) => {
    try {
      let date;
      switch (format) {
        case "iso":
          date = new Date(value);
          break;
        case "12h":
          date = new Date(`1970-01-01 ${value}`);
          break;
        case "24h":
          date = new Date(`1970-01-01 ${value}`);
          break;
        case "unix":
          date = new Date(parseInt(value) * 1000);
          break;
        case "rfc2822":
          date = new Date(value);
          break;
        case "custom":
          const [hours, minutes, seconds] = value.split(":").map(Number);
          date = new Date();
          date.setHours(hours || 0, minutes || 0, seconds || 0, 0);
          break;
        default:
          throw new Error("Unsupported format");
      }
      if (isNaN(date.getTime())) throw new Error("Invalid time");
      return date;
    } catch (err) {
      setError(`Invalid input: ${err.message}`);
      return null;
    }
  }, []);

  // Convert to various formats
  const convertTime = useCallback(
    (date) => {
      if (!date) return {};

      const iso = date.toISOString();
      const options = {
        timeZone,
        hour12: true,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      };
      const options24 = { ...options, hour12: false };
      const rfc2822 = date.toUTCString();

      const customFormatOutput = customFormat
        .replace("YYYY", date.getFullYear())
        .replace("MM", String(date.getMonth() + 1).padStart(2, "0"))
        .replace("DD", String(date.getDate()).padStart(2, "0"))
        .replace("HH", String(date.getHours()).padStart(2, "0"))
        .replace("hh", String(date.getHours() % 12 || 12).padStart(2, "0"))
        .replace("mm", String(date.getMinutes()).padStart(2, "0"))
        .replace("ss", String(date.getSeconds()).padStart(2, "0"))
        .replace("A", date.getHours() >= 12 ? "PM" : "AM")
        .replace("a", date.getHours() >= 12 ? "pm" : "am")
        .replace("Z", date.toLocaleTimeString("en-US", { timeZoneName: "short" }).split(" ")[2]);

      return {
        iso,
        "12h": new Intl.DateTimeFormat("en-US", options).format(date),
        "24h": new Intl.DateTimeFormat("en-US", options24).format(date),
        unix: Math.floor(date.getTime() / 1000),
        rfc2822,
        custom: customFormatOutput,
      };
    },
    [timeZone, customFormat]
  );

  const handleInputChange = (value) => {
    setInputValue(value);
    setError("");
    const date = parseInput(value, inputFormat);
    setOutput(date ? convertTime(date) : {});
  };

  const handleNow = () => {
    const now = new Date();
    const converted = convertTime(now);
    setInputValue(converted[inputFormat]);
    setOutput(converted);
    setError("");
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  // Auto-update for "Now" when enabled
  useEffect(() => {
    let interval;
    if (autoUpdate) {
      interval = setInterval(() => {
        handleNow();
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [autoUpdate]);

  // Reconvert on format/timezone/custom format change
  useEffect(() => {
    handleInputChange(inputValue);
  }, [inputFormat, timeZone, customFormat]);

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Time Format Converter
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder={`Enter time in ${formats[inputFormat]} format`}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleNow}
                className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <FaClock className="mr-2" /> Now
              </button>
              <button
                onClick={() => {
                  setInputValue("");
                  setOutput({});
                  setError("");
                }}
                className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                <FaSync className="mr-2" /> Clear
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Input Format
                </label>
                <select
                  value={inputFormat}
                  onChange={(e) => setInputFormat(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(formats).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
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
              <div className="flex items-center">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={autoUpdate}
                    onChange={(e) => setAutoUpdate(e.target.checked)}
                    className="mr-2 accent-blue-500"
                  />
                  <span className="text-sm text-gray-700">Auto-Update (Now)</span>
                </label>
              </div>
            </div>

            {inputFormat === "custom" && (
              <div className="grid gap-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Custom Format
                </label>
                <input
                  type="text"
                  value={customFormat}
                  onChange={(e) => setCustomFormat(e.target.value)}
                  placeholder="e.g., YYYY-MM-DD HH:mm:ss"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500">
                  Use: YYYY (year), MM (month), DD (day), HH (24h), hh (12h), mm (minutes), ss
                  (seconds), A (AM/PM), a (am/pm), Z (timezone)
                </p>
              </div>
            )}
          </div>

          {/* Output Section */}
          {Object.keys(output).length > 0 && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Converted Times</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                {Object.entries(output).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <p>
                      <span className="font-medium capitalize">
                        {key === "12h" ? "12-Hour" : key === "24h" ? "24-Hour" : key}:
                      </span>{" "}
                      {value}
                    </p>
                    <button
                      onClick={() => copyToClipboard(value)}
                      className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                    >
                      <FaCopy />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error Section */}
          {error && (
            <div className="p-4 bg-red-50 rounded-lg text-red-700">
              <p>{error}</p>
            </div>
          )}
        </div>

        {/* Features Section */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Convert between ISO, 12/24-hour, UNIX, RFC 2822, and custom formats</li>
            <li>Supports all IANA time zones</li>
            <li>Enhanced custom format with date and time options</li>
            <li>Real-time conversion and auto-update option</li>
            <li>Copy output to clipboard</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TimeFormatConverter;