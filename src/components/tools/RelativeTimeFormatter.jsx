"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaClock, FaSync, FaCopy } from "react-icons/fa";

const RelativeTimeFormatter = () => {
  const [inputTime, setInputTime] = useState(new Date().toISOString().slice(0, 16));
  const [language, setLanguage] = useState("en");
  const [timeZone, setTimeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [customFormat, setCustomFormat] = useState("");
  const [relativeTime, setRelativeTime] = useState("");
  const [absoluteTime, setAbsoluteTime] = useState("");
  const [updateInterval, setUpdateInterval] = useState(true);
  const [style, setStyle] = useState("auto"); // New: style option
  const [copied, setCopied] = useState("");

  // Supported languages
  const languages = {
    en: "English",
    es: "Spanish",
    fr: "French",
    de: "German",
    it: "Italian",
    ja: "Japanese",
    zh: "Chinese (Simplified)",
    ru: "Russian",
    pt: "Portuguese",
  };

  // Time zones
  const timeZones = Intl.supportedValuesOf("timeZone");

  // Format relative time
  const formatRelativeTime = useCallback(
    (date) => {
      const now = new Date();
      const inputDate = new Date(date);
      const diffMs = now - inputDate;
      const diffSeconds = Math.floor(diffMs / 1000);
      const diffMinutes = Math.floor(diffSeconds / 60);
      const diffHours = Math.floor(diffMinutes / 60);
      const diffDays = Math.floor(diffHours / 24);
      const diffWeeks = Math.floor(diffDays / 7);
      const diffMonths = Math.floor(diffDays / 30);
      const diffYears = Math.floor(diffDays / 365);

      const formatter = new Intl.RelativeTimeFormat(language, {
        numeric: style === "always" ? "always" : "auto",
        style: style === "short" || style === "narrow" ? style : "long",
      });

      if (Math.abs(diffYears) >= 1) {
        return formatter.format(-diffYears, "year");
      } else if (Math.abs(diffMonths) >= 1) {
        return formatter.format(-diffMonths, "month");
      } else if (Math.abs(diffWeeks) >= 1) {
        return formatter.format(-diffWeeks, "week");
      } else if (Math.abs(diffDays) >= 1) {
        return formatter.format(-diffDays, "day");
      } else if (Math.abs(diffHours) >= 1) {
        return formatter.format(-diffHours, "hour");
      } else if (Math.abs(diffMinutes) >= 1) {
        return formatter.format(-diffMinutes, "minute");
      } else {
        return formatter.format(-diffSeconds, "second");
      }
    },
    [language, style]
  );

  // Format absolute time with more options
  const formatAbsoluteTime = useCallback(
    (date) => {
      const options = {
        timeZone,
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
        timeZoneName: "short",
      };
      return new Intl.DateTimeFormat(language, options).format(new Date(date));
    },
    [language, timeZone]
  );

  // Update time
  const updateTime = useCallback(() => {
    try {
      const date = new Date(inputTime);
      setRelativeTime(customFormat || formatRelativeTime(date));
      setAbsoluteTime(formatAbsoluteTime(date));
    } catch (err) {
      setRelativeTime("Invalid date");
      setAbsoluteTime("Invalid date");
    }
  }, [inputTime, customFormat, formatRelativeTime, formatAbsoluteTime]);

  useEffect(() => {
    updateTime();
    if (updateInterval) {
      const interval = setInterval(updateTime, 1000);
      return () => clearInterval(interval);
    }
  }, [updateTime, updateInterval]);

  // Set to current time
  const handleNow = () => {
    setInputTime(new Date().toISOString().slice(0, 16));
  };

  // Reset to defaults
  const handleReset = () => {
    setInputTime(new Date().toISOString().slice(0, 16));
    setLanguage("en");
    setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    setCustomFormat("");
    setStyle("auto");
    setUpdateInterval(true);
  };

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(text === relativeTime ? "relative" : "absolute");
    setTimeout(() => setCopied(""), 2000);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Relative Time Formatter
        </h1>

        <div className="space-y-6">
          {/* Input Section */}
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date/Time
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="datetime-local"
                  value={inputTime}
                  onChange={(e) => setInputTime(e.target.value)}
                  className="flex-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleNow}
                  className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <FaClock className="mr-2" /> Now
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(languages).map(([code, name]) => (
                    <option key={code} value={code}>
                      {name}
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
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Format Style
              </label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="auto">Auto (e.g., "yesterday")</option>
                <option value="always">Always Numeric (e.g., "1 day ago")</option>
                <option value="long">Long (e.g., "1 day ago")</option>
                <option value="short">Short (e.g., "1d ago")</option>
                <option value="narrow">Narrow (e.g., "1d")</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Custom Format (optional)
              </label>
              <input
                type="text"
                value={customFormat}
                onChange={(e) => setCustomFormat(e.target.value)}
                placeholder="e.g., 'Just now' or leave blank for auto"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={updateInterval}
                onChange={(e) => setUpdateInterval(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="text-sm font-medium text-gray-700">
                Update every second
              </label>
            </div>
          </div>

          {/* Results Section */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-2 text-gray-800">Formatted Time</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <p>
                  <span className="font-medium">Relative:</span> {relativeTime}
                </p>
                <button
                  onClick={() => copyToClipboard(relativeTime)}
                  className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                  title="Copy to clipboard"
                >
                  <FaCopy />
                  {copied === "relative" && (
                    <span className="ml-1 text-xs text-green-600">Copied!</span>
                  )}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <p>
                  <span className="font-medium">Absolute:</span> {absoluteTime}
                </p>
                <button
                  onClick={() => copyToClipboard(absoluteTime)}
                  className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                  title="Copy to clipboard"
                >
                  <FaCopy />
                  {copied === "absolute" && (
                    <span className="ml-1 text-xs text-green-600">Copied!</span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleReset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Multiple languages and time zones</li>
            <li>Real-time updates (toggleable)</li>
            <li>Custom format override</li>
            <li>Format style options: auto, numeric, long, short, narrow</li>
            <li>Copy to clipboard functionality</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RelativeTimeFormatter;