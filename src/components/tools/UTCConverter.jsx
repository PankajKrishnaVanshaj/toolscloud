"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaSync, FaCopy, FaClock } from "react-icons/fa";

const UTCConverter = () => {
  const [utcTime, setUtcTime] = useState(new Date().toISOString().slice(0, 16));
  const [localTime, setLocalTime] = useState("");
  const [timeZone, setTimeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [timestamp, setTimestamp] = useState(Math.floor(Date.now() / 1000));
  const [formatOptions, setFormatOptions] = useState({
    date: true,
    time: true,
    seconds: true,
    milliseconds: false,
    timeZoneName: "short",
    hour12: true,
  });
  const [error, setError] = useState("");
  const [liveUpdate, setLiveUpdate] = useState(true);
  const [copiedField, setCopiedField] = useState(null);

  const timeZones = Intl.supportedValuesOf("timeZone");

  // Format date based on options
  const formatDate = useCallback(
    (date, tz, isUTC = false) => {
      const options = {
        timeZone: isUTC ? "UTC" : tz,
        year: formatOptions.date ? "numeric" : undefined,
        month: formatOptions.date ? "2-digit" : undefined,
        day: formatOptions.date ? "2-digit" : undefined,
        hour: formatOptions.time ? "2-digit" : undefined,
        minute: formatOptions.time ? "2-digit" : undefined,
        second: formatOptions.seconds ? "2-digit" : undefined,
        fractionalSecondDigits: formatOptions.milliseconds ? 3 : undefined,
        timeZoneName:
          formatOptions.timeZoneName !== "none" ? formatOptions.timeZoneName : undefined,
        hour12: formatOptions.hour12,
      };
      return new Intl.DateTimeFormat("en-US", options).format(date);
    },
    [formatOptions]
  );

  // Update all times based on UTC input
  const updateTimes = useCallback(() => {
    try {
      const utcDate = new Date(utcTime + ":00Z");
      if (isNaN(utcDate.getTime())) throw new Error("Invalid UTC time");

      setUtcTime(utcDate.toISOString().slice(0, 16));
      setLocalTime(formatDate(utcDate, timeZone));
      setTimestamp(Math.floor(utcDate.getTime() / 1000));
      setError("");
    } catch (err) {
      setError(`Error: ${err.message}`);
    }
  }, [utcTime, timeZone, formatDate]);

  // Live update effect
  useEffect(() => {
    updateTimes();
    if (liveUpdate) {
      const interval = setInterval(() => {
        const now = new Date();
        setUtcTime(now.toISOString().slice(0, 16));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [liveUpdate, updateTimes]);

  // Handlers for input changes
  const handleUTCTime = (value) => {
    setUtcTime(value);
    updateTimes();
  };

  const handleLocalTime = (value) => {
    setLocalTime(value);
    try {
      const localDate = new Date(value);
      if (isNaN(localDate.getTime())) throw new Error("Invalid local time");
      const utcDate = new Date(localDate.toLocaleString("en-US", { timeZone: "UTC" }));
      setUtcTime(utcDate.toISOString().slice(0, 16));
      setTimestamp(Math.floor(utcDate.getTime() / 1000));
      setError("");
    } catch (err) {
      setError(`Error: ${err.message}`);
    }
  };

  const handleTimestamp = (value) => {
    setTimestamp(value);
    try {
      const date = new Date(parseInt(value) * 1000);
      if (isNaN(date.getTime())) throw new Error("Invalid timestamp");
      setUtcTime(date.toISOString().slice(0, 16));
      setLocalTime(formatDate(date, timeZone));
      setError("");
    } catch (err) {
      setError(`Error: ${err.message}`);
    }
  };

  const handleNow = () => {
    const now = new Date();
    setUtcTime(now.toISOString().slice(0, 16));
    updateTimes();
  };

  const handleReset = () => {
    setUtcTime(new Date().toISOString().slice(0, 16));
    setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    setFormatOptions({
      date: true,
      time: true,
      seconds: true,
      milliseconds: false,
      timeZoneName: "short",
      hour12: true,
    });
    setLiveUpdate(true);
    setError("");
    updateTimes();
  };

  const handleFormatChange = (key, value) => {
    setFormatOptions((prev) => {
      const newOptions = { ...prev, [key]: value };
      updateTimes();
      return newOptions;
    });
  };

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          UTC Time Converter
        </h1>

        <div className="space-y-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 gap-4">
            {[
              {
                label: "UTC Time",
                value: utcTime,
                onChange: handleUTCTime,
                type: "datetime-local",
                field: "utc",
              },
              {
                label: "Local Time",
                value: localTime,
                onChange: handleLocalTime,
                type: "text",
                placeholder: "e.g., March 2, 2025, 07:00 AM EST",
                field: "local",
              },
              {
                label: "Unix Timestamp (seconds)",
                value: timestamp,
                onChange: handleTimestamp,
                type: "number",
                field: "timestamp",
              },
            ].map(({ label, value, onChange, type, placeholder, field }) => (
              <div key={label} className="grid gap-2">
                <label className="text-sm font-medium text-gray-700">{label}</label>
                <div className="flex items-center gap-2">
                  <input
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => copyToClipboard(value, field)}
                    className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                    title="Copy to clipboard"
                  >
                    <FaCopy />
                    {copiedField === field && (
                      <span className="absolute text-xs text-green-600 bg-white px-1 rounded">
                        Copied!
                      </span>
                    )}
                  </button>
                </div>
              </div>
            ))}

            {/* Time Zone and Controls */}
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
              <div className="flex flex-col sm:flex-row gap-2">
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

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={liveUpdate}
                onChange={(e) => setLiveUpdate(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Live Update</span>
            </label>
          </div>

          {/* Format Options */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Format Options</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "Include Date", key: "date" },
                { label: "Include Time", key: "time" },
                { label: "Include Seconds", key: "seconds" },
                { label: "Include Milliseconds", key: "milliseconds" },
                { label: "Use 12-Hour Format", key: "hour12" },
              ].map(({ label, key }) => (
                <label key={key} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formatOptions[key]}
                    onChange={(e) => handleFormatChange(key, e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">{label}</span>
                </label>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time Zone Display
                </label>
                <select
                  value={formatOptions.timeZoneName}
                  onChange={(e) => handleFormatChange("timeZoneName", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="none">None</option>
                  <option value="short">Short (e.g., EST)</option>
                  <option value="long">Long (e.g., Eastern Standard Time)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Error Section */}
          {error && (
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Features Section */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Convert between UTC, local time, and Unix timestamp</li>
              <li>Supports all IANA time zones</li>
              <li>Live updates with toggle</li>
              <li>Customizable output format (date, time, 12/24-hour)</li>
              <li>Copy values to clipboard</li>
              <li>Reset to current time and default settings</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UTCConverter;