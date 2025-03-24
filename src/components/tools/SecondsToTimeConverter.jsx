"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaCopy, FaSync } from "react-icons/fa";

const SecondsToTimeConverter = () => {
  const [seconds, setSeconds] = useState("");
  const [format, setFormat] = useState("readable");
  const [customFormat, setCustomFormat] = useState("");
  const [output, setOutput] = useState("");
  const [includeNegative, setIncludeNegative] = useState(true);
  const [autoUpdate, setAutoUpdate] = useState(false);
  const [precision, setPrecision] = useState(3); // Decimal precision for milliseconds
  const [isCopied, setIsCopied] = useState(false);

  // Conversion logic
  const convertSeconds = useCallback(
    (secs) => {
      if (!secs || isNaN(secs)) return "Invalid input";

      const absSeconds = Math.abs(parseFloat(secs));
      const sign = secs < 0 && includeNegative ? "-" : "";

      switch (format) {
        case "readable":
          return customFormat ? formatCustom(absSeconds, sign) : formatReadable(absSeconds, sign);
        case "HMS":
          return formatHMS(absSeconds, sign);
        case "DHMS":
          return formatDHMS(absSeconds, sign);
        case "ISO":
          return formatISO(absSeconds, sign);
        case "compact":
          return formatCompact(absSeconds, sign);
        default:
          return "Invalid format";
      }
    },
    [format, customFormat, includeNegative, precision]
  );

  const formatReadable = (secs, sign) => {
    const years = Math.floor(secs / (365 * 24 * 60 * 60));
    const days = Math.floor((secs % (365 * 24 * 60 * 60)) / (24 * 60 * 60));
    const hours = Math.floor((secs % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((secs % (60 * 60)) / 60);
    const seconds = Math.floor(secs % 60);
    const milliseconds = Number((secs % 1).toFixed(precision)) * 1000;

    const parts = [];
    if (years) parts.push(`${years} year${years !== 1 ? "s" : ""}`);
    if (days) parts.push(`${days} day${days !== 1 ? "s" : ""}`);
    if (hours) parts.push(`${hours} hour${hours !== 1 ? "s" : ""}`);
    if (minutes) parts.push(`${minutes} minute${minutes !== 1 ? "s" : ""}`);
    if (seconds || !parts.length) parts.push(`${seconds} second${seconds !== 1 ? "s" : ""}`);
    if (milliseconds) parts.push(`${milliseconds} ms`);

    return sign + parts.join(", ");
  };

  const formatHMS = (secs, sign) => {
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    const seconds = Math.floor(secs % 60);
    const milliseconds = Number((secs % 1).toFixed(precision)) * 1000;

    return `${sign}${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}${milliseconds ? `.${milliseconds.toString().padStart(3, "0")}` : ""}`;
  };

  const formatDHMS = (secs, sign) => {
    const days = Math.floor(secs / 86400);
    const hours = Math.floor((secs % 86400) / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    const seconds = Math.floor(secs % 60);
    const milliseconds = Number((secs % 1).toFixed(precision)) * 1000;

    return `${sign}${days}d ${hours.toString().padStart(2, "0")}h ${minutes
      .toString()
      .padStart(2, "0")}m ${seconds
      .toString()
      .padStart(2, "0")}s${milliseconds ? ` ${milliseconds}ms` : ""}`;
  };

  const formatISO = (secs, sign) => {
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    const seconds = Math.floor(secs % 60);
    const milliseconds = Number((secs % 1).toFixed(precision)) * 1000;

    return `${sign}PT${hours}H${minutes}M${seconds}${
      milliseconds ? `.${milliseconds.toString().padStart(3, "0")}` : ""
    }S`;
  };

  const formatCompact = (secs, sign) => {
    const years = Math.floor(secs / (365 * 24 * 60 * 60));
    const days = Math.floor((secs % (365 * 24 * 60 * 60)) / (24 * 60 * 60));
    const hours = Math.floor((secs % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((secs % (60 * 60)) / 60);
    const seconds = Math.floor(secs % 60);
    const milliseconds = Number((secs % 1).toFixed(precision)) * 1000;

    return `${sign}${years ? `${years}y` : ""}${days ? `${days}d` : ""}${hours ? `${hours}h` : ""}${
      minutes ? `${minutes}m` : ""
    }${seconds || !secs ? `${seconds}s` : ""}${milliseconds ? `${milliseconds}ms` : ""}`;
  };

  const formatCustom = (secs, sign) => {
    const years = Math.floor(secs / (365 * 24 * 60 * 60));
    const days = Math.floor((secs % (365 * 24 * 60 * 60)) / (24 * 60 * 60));
    const hours = Math.floor((secs % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((secs % (60 * 60)) / 60);
    const seconds = Math.floor(secs % 60);
    const milliseconds = Number((secs % 1).toFixed(precision)) * 1000;

    let result = customFormat;
    result = result.replace("{y}", years);
    result = result.replace("{d}", days);
    result = result.replace("{h}", hours.toString().padStart(2, "0"));
    result = result.replace("{m}", minutes.toString().padStart(2, "0"));
    result = result.replace("{s}", seconds.toString().padStart(2, "0"));
    result = result.replace("{ms}", milliseconds.toString().padStart(3, "0"));
    return sign + result;
  };

  // Handle input change
  const handleInputChange = (value) => {
    setSeconds(value);
    setOutput(convertSeconds(value));
  };

  // Auto-update effect
  useEffect(() => {
    if (autoUpdate && seconds) {
      const interval = setInterval(() => {
        const newSeconds = parseFloat(seconds) + 1;
        setSeconds(newSeconds.toString());
        setOutput(convertSeconds(newSeconds));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [seconds, autoUpdate, convertSeconds]);

  // Copy to clipboard
  const copyToClipboard = () => {
    if (output && output !== "Invalid input") {
      navigator.clipboard.writeText(output);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  // Reset all fields
  const reset = () => {
    setSeconds("");
    setFormat("readable");
    setCustomFormat("");
    setOutput("");
    setIncludeNegative(true);
    setAutoUpdate(false);
    setPrecision(3);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Seconds to Time Converter
        </h1>

        <div className="space-y-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Seconds</label>
              <input
                type="number"
                step="any"
                value={seconds}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="e.g., 3661.5"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="readable">Readable (1 hour, 1 minute)</option>
                <option value="HMS">HMS (01:01:01)</option>
                <option value="DHMS">DHMS (0d 01h 01m 01s)</option>
                <option value="ISO">ISO (PT1H1M1S)</option>
                <option value="compact">Compact (1h1m1s)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Custom Format (for Readable)
              </label>
              <input
                type="text"
                value={customFormat}
                onChange={(e) => setCustomFormat(e.target.value)}
                placeholder="e.g., {h}h {m}m {s}s"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Millisecond Precision
              </label>
              <input
                type="number"
                min="0"
                max="6"
                value={precision}
                onChange={(e) => setPrecision(Math.max(0, Math.min(6, e.target.value)))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Options */}
          <div className="flex flex-col sm:flex-row gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={includeNegative}
                onChange={(e) => setIncludeNegative(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">Show Negative Sign</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={autoUpdate}
                onChange={(e) => setAutoUpdate(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">Auto Increment</span>
            </label>
            <button
              onClick={reset}
              className="mt-2 sm:mt-0 flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>

          {/* Output Section */}
          {seconds && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold text-gray-800">Converted Time:</h2>
                <button
                  onClick={copyToClipboard}
                  className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm ${
                    isCopied ? "bg-green-500 text-white" : "bg-blue-500 text-white hover:bg-blue-600"
                  } transition-colors`}
                >
                  <FaCopy /> {isCopied ? "Copied!" : "Copy"}
                </button>
              </div>
              <p className="text-sm text-gray-700 break-words">{output}</p>
            </div>
          )}

          {/* Features & Info */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Formats: Readable, HMS, DHMS, ISO, Compact</li>
              <li>Custom format with {`{y}`}, {`{d}`}, {`{h}`}, {`{m}`}, {`{s}`}, {`{ms}`}</li>
              <li>Adjustable millisecond precision (0-6)</li>
              <li>Negative values and auto-increment support</li>
              <li>Copy output to clipboard</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecondsToTimeConverter;