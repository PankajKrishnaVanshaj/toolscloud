"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaCopy, FaSync, FaSave, FaTrash } from "react-icons/fa";

const DateFormatter = () => {
  const [inputDate, setInputDate] = useState(new Date().toISOString().slice(0, 16));
  const [locale, setLocale] = useState("en-US");
  const [timeZone, setTimeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [customPattern, setCustomPattern] = useState("");
  const [formattedDate, setFormattedDate] = useState("");
  const [savedTemplates, setSavedTemplates] = useState([]);
  const [templateName, setTemplateName] = useState("");
  const [options, setOptions] = useState({
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZoneName: "short",
    weekday: undefined,
  });

  const locales = ["en-US", "en-GB", "fr-FR", "es-ES", "de-DE", "it-IT", "ja-JP", "zh-CN", "ru-RU", "ar-SA"];
  const timeZones = Intl.supportedValuesOf("timeZone");

  // Format date based on options or custom pattern
  const formatDate = useCallback((date) => {
    try {
      if (customPattern) {
        return formatWithCustomPattern(date, customPattern);
      }
      const formatter = new Intl.DateTimeFormat(locale, { ...options, timeZone });
      return formatter.format(date);
    } catch (err) {
      return `Error: ${err.message}`;
    }
  }, [locale, timeZone, customPattern, options]);

  // Custom pattern formatter
  const formatWithCustomPattern = (date, pattern) => {
    const replacements = {
      "YYYY": date.getFullYear(),
      "YY": String(date.getFullYear()).slice(-2),
      "MMMM": new Intl.DateTimeFormat(locale, { month: "long", timeZone }).format(date),
      "MMM": new Intl.DateTimeFormat(locale, { month: "short", timeZone }).format(date),
      "MM": String(date.getMonth() + 1).padStart(2, "0"),
      "M": date.getMonth() + 1,
      "DD": String(date.getDate()).padStart(2, "0"),
      "D": date.getDate(),
      "dddd": new Intl.DateTimeFormat(locale, { weekday: "long", timeZone }).format(date),
      "ddd": new Intl.DateTimeFormat(locale, { weekday: "short", timeZone }).format(date),
      "HH": String(date.getHours()).padStart(2, "0"),
      "H": date.getHours(),
      "hh": String(date.getHours() % 12 || 12).padStart(2, "0"),
      "h": date.getHours() % 12 || 12,
      "mm": String(date.getMinutes()).padStart(2, "0"),
      "m": date.getMinutes(),
      "ss": String(date.getSeconds()).padStart(2, "0"),
      "s": date.getSeconds(),
      "SSS": String(date.getMilliseconds()).padStart(3, "0"),
      "A": date.getHours() < 12 ? "AM" : "PM",
      "Z": new Intl.DateTimeFormat(locale, { timeZone, timeZoneName: "short" })
        .format(date)
        .split(" ")
        .pop(),
    };

    let result = pattern;
    for (const [key, value] of Object.entries(replacements)) {
      result = result.replace(new RegExp(key, "g"), value);
    }
    return result;
  };

  // Update formatted date when inputs change
  useEffect(() => {
    const date = new Date(inputDate);
    setFormattedDate(formatDate(date));
  }, [inputDate, formatDate]);

  // Reset to current date/time
  const handleNow = () => {
    setInputDate(new Date().toISOString().slice(0, 16));
  };

  // Save template
  const saveTemplate = () => {
    if (!templateName || !customPattern) return;
    setSavedTemplates((prev) => [...prev, { name: templateName, pattern: customPattern }]);
    setTemplateName("");
  };

  // Apply saved template
  const applyTemplate = (pattern) => {
    setCustomPattern(pattern);
  };

  // Delete template
  const deleteTemplate = (index) => {
    setSavedTemplates((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle option changes
  const handleOptionChange = (key, value) => {
    setOptions((prev) => ({ ...prev, [key]: value || undefined }));
    setCustomPattern(""); // Clear custom pattern when using options
  };

  // Copy formatted date to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(formattedDate);
    alert("Copied to clipboard!");
  };

  // Reset all settings
  const resetAll = () => {
    setInputDate(new Date().toISOString().slice(0, 16));
    setLocale("en-US");
    setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    setCustomPattern("");
    setOptions({
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
      timeZoneName: "short",
      weekday: undefined,
    });
    setSavedTemplates([]);
    setTemplateName("");
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Date Formatter
        </h1>

        <div className="space-y-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date/Time
                </label>
                <input
                  type="datetime-local"
                  value={inputDate}
                  onChange={(e) => setInputDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={handleNow}
                className="mt-6 sm:mt-0 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <FaSync className="mr-2" /> Now
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Locale
                </label>
                <select
                  value={locale}
                  onChange={(e) => setLocale(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {locales.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
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
                Custom Pattern (optional)
              </label>
              <input
                type="text"
                value={customPattern}
                onChange={(e) => setCustomPattern(e.target.value)}
                placeholder="e.g., YYYY-MM-DD hh:mm:ss A Z"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Format Options */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Format Options</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              {[
                { label: "Year", key: "year", options: ["numeric", "2-digit", undefined] },
                {
                  label: "Month",
                  key: "month",
                  options: ["long", "short", "numeric", "2-digit", undefined],
                },
                { label: "Day", key: "day", options: ["numeric", "2-digit", undefined] },
                {
                  label: "Weekday",
                  key: "weekday",
                  options: ["long", "short", "narrow", undefined],
                },
                { label: "Hour", key: "hour", options: ["2-digit", "numeric", undefined] },
                { label: "Minute", key: "minute", options: ["2-digit", "numeric", undefined] },
                { label: "Second", key: "second", options: ["2-digit", "numeric", undefined] },
                { label: "Hour Format", key: "hour12", options: [true, false] },
                {
                  label: "Time Zone Name",
                  key: "timeZoneName",
                  options: ["short", "long", undefined],
                },
              ].map(({ label, key, options: opts }) => (
                <div key={key} className="flex items-center gap-2">
                  <label className="w-24">{label}:</label>
                  <select
                    value={options[key]}
                    onChange={(e) =>
                      handleOptionChange(
                        key,
                        key === "hour12" ? e.target.value === "true" : e.target.value
                      )
                    }
                    className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    {opts.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt === undefined
                          ? "None"
                          : key === "hour12"
                          ? opt
                            ? "12-hour"
                            : "24-hour"
                          : opt}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Result Section */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold text-gray-800">Formatted Date:</h2>
              <button
                onClick={copyToClipboard}
                className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors flex items-center"
              >
                <FaCopy className="mr-2" /> Copy
              </button>
            </div>
            <p className="text-sm text-gray-700 break-words">{formattedDate}</p>
          </div>

          {/* Template Section */}
          <div className="grid gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Template Name"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={saveTemplate}
                disabled={!templateName || !customPattern}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaSave className="mr-2" /> Save Template
              </button>
            </div>
            {savedTemplates.length > 0 && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">Saved Templates:</h2>
                <div className="space-y-3 text-sm">
                  {savedTemplates.map((template, index) => (
                    <div
                      key={index}
                      className="flex flex-col sm:flex-row justify-between items-center gap-2"
                    >
                      <span className="truncate flex-1">{template.name}: {template.pattern}</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => applyTemplate(template.pattern)}
                          className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                          Apply
                        </button>
                        <button
                          onClick={() => deleteTemplate(index)}
                          className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end">
            <button
              onClick={resetAll}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
            >
              <FaSync className="mr-2" /> Reset All
            </button>
          </div>

          {/* Features & Guide */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <details>
              <summary className="cursor-pointer font-semibold text-blue-700">
                Features & Custom Pattern Guide
              </summary>
              <ul className="list-disc list-inside mt-2 text-blue-600 text-sm space-y-1">
                <li>Supports multiple locales and time zones</li>
                <li>Custom pattern support with weekday (dddd, ddd)</li>
                <li>Save, apply, and delete templates</li>
                <li>Copy formatted date to clipboard</li>
                <li>Pattern options: YYYY, YY, MMMM, MMM, MM, M, DD, D, dddd, ddd, HH, H, hh, h, mm, m, ss, s, SSS, A, Z</li>
              </ul>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DateFormatter;