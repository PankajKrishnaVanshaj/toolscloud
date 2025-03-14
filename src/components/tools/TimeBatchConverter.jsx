"use client";
import React, { useState, useCallback, useRef } from "react";
import { FaDownload, FaUpload, FaSync, FaCopy } from "react-icons/fa";

const TimeBatchConverter = () => {
  const [inputTimes, setInputTimes] = useState("");
  const [outputFormat, setOutputFormat] = useState("iso");
  const [timeZone, setTimeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");
  const [delimiter, setDelimiter] = useState("\n"); // For input parsing
  const [customFormat, setCustomFormat] = useState(""); // For custom output format
  const fileInputRef = useRef(null);

  // Time zones
  const timeZones = Intl.supportedValuesOf("timeZone");

  // Output format options
  const formats = {
    iso: "ISO 8601",
    unix: "Unix Timestamp (seconds)",
    unixMs: "Unix Timestamp (milliseconds)",
    human: "Human-Readable",
    custom: "Custom Format",
  };

  // Parse input time
  const parseTime = useCallback((input) => {
    const trimmed = input.trim();
    if (!trimmed) return null;

    if (/^\d+$/.test(trimmed)) {
      const num = parseInt(trimmed);
      return new Date(num * (trimmed.length > 10 ? 1 : 1000));
    }

    const date = new Date(trimmed);
    return isNaN(date.getTime()) ? null : date;
  }, []);

  // Convert time to desired format
  const convertTime = useCallback(
    (date) => {
      if (!date) return "Invalid";

      switch (outputFormat) {
        case "iso":
          return date.toISOString();
        case "unix":
          return Math.floor(date.getTime() / 1000);
        case "unixMs":
          return date.getTime();
        case "human":
          return new Intl.DateTimeFormat("en-US", {
            timeZone,
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            timeZoneName: "short",
            hour12: true,
          }).format(date);
        case "custom":
          if (!customFormat) return "Invalid: No custom format specified";
          try {
            return new Intl.DateTimeFormat("en-US", {
              timeZone,
              ...parseCustomFormat(customFormat),
            }).format(date);
          } catch (e) {
            return "Invalid: Bad custom format";
          }
        default:
          return "";
      }
    },
    [outputFormat, timeZone, customFormat]
  );

  // Parse custom format string into Intl options
  const parseCustomFormat = (format) => {
    const options = {};
    if (format.includes("YYYY")) options.year = "numeric";
    if (format.includes("YY")) options.year = "2-digit";
    if (format.includes("MMMM")) options.month = "long";
    if (format.includes("MMM")) options.month = "short";
    if (format.includes("MM")) options.month = "2-digit";
    if (format.includes("DD")) options.day = "2-digit";
    if (format.includes("D")) options.day = "numeric";
    if (format.includes("HH")) options.hour = "2-digit";
    if (format.includes("mm")) options.minute = "2-digit";
    if (format.includes("ss")) options.second = "2-digit";
    if (format.includes("A")) options.hour12 = true;
    if (format.includes("a")) options.hour12 = true;
    if (format.includes("Z")) options.timeZoneName = "short";
    return options;
  };

  // Handle conversion
  const handleConvert = useCallback(() => {
    setError("");
    setResults([]);

    const times = inputTimes.split(delimiter).filter((line) => line.trim());
    if (times.length === 0) {
      setError("No valid timestamps provided");
      return;
    }

    const converted = times.map((time, index) => ({
      original: time,
      converted: convertTime(parseTime(time)),
      index: index + 1,
    }));

    setResults(converted);
    if (converted.every((result) => result.converted.startsWith("Invalid"))) {
      setError("All timestamps failed to parse");
    }
  }, [inputTimes, delimiter, convertTime, parseTime]);

  // Import CSV/TSV
  const handleFileImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      setInputTimes(text.split(delimiter === "\n" ? "," : delimiter).join("\n"));
    };
    reader.readAsText(file);
  };

  // Export to CSV
  const handleCSVExport = () => {
    if (results.length === 0) return;

    const csv = [
      "Index,Original,Converted",
      ...results.map((r) => `${r.index},"${r.original}","${r.converted}"`),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `time_conversion_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Copy results to clipboard
  const handleCopyToClipboard = () => {
    if (results.length === 0) return;
    const text = results.map((r) => `${r.original} → ${r.converted}`).join("\n");
    navigator.clipboard.writeText(text);
    alert("Results copied to clipboard!");
  };

  // Clear all
  const handleClear = () => {
    setInputTimes("");
    setResults([]);
    setError("");
    setCustomFormat("");
    setDelimiter("\n");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Time Batch Converter
        </h1>

        <div className="space-y-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Input Timestamps
              </label>
              <textarea
                value={inputTimes}
                onChange={(e) => setInputTimes(e.target.value)}
                placeholder="Enter timestamps (one per line or custom delimiter)"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-40 resize-y"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Output Format
                </label>
                <select
                  value={outputFormat}
                  onChange={(e) => setOutputFormat(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(formats).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>
              {outputFormat === "custom" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Custom Format
                  </label>
                  <input
                    type="text"
                    value={customFormat}
                    onChange={(e) => setCustomFormat(e.target.value)}
                    placeholder="e.g., YYYY-MM-DD HH:mm:ss Z"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Input Delimiter
                </label>
                <select
                  value={delimiter}
                  onChange={(e) => setDelimiter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="\n">Newline</option>
                  <option value=",">Comma (,)</option>
                  <option value=";">Semicolon (;)</option>
                  <option value="\t">Tab</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleConvert}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                Convert
              </button>
              <label className="flex-1 py-2 px-4 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 cursor-pointer flex items-center justify-center">
                <FaUpload className="mr-2" /> Import File
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileImport}
                  className="hidden"
                />
              </label>
              <button
                onClick={handleCSVExport}
                disabled={results.length === 0}
                className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-purple-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaDownload className="mr-2" /> Export CSV
              </button>
              <button
                onClick={handleCopyToClipboard}
                disabled={results.length === 0}
                className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaCopy className="mr-2" /> Copy Results
              </button>
              <button
                onClick={handleClear}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
              >
                <FaSync className="mr-2" /> Clear
              </button>
            </div>
          </div>

          {/* Results Section */}
          {results.length > 0 && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h2 className="text-lg font-semibold mb-2 text-gray-700">Converted Times</h2>
              <div className="space-y-2 text-sm max-h-64 overflow-y-auto">
                {results.map((result) => (
                  <div key={result.index} className="flex flex-wrap gap-2">
                    <span className="font-medium text-gray-600">#{result.index}:</span>
                    <span className="text-gray-800">{result.original}</span>
                    <span className="text-gray-500">→</span>
                    <span
                      className={
                        result.converted.startsWith("Invalid") ? "text-red-600" : "text-gray-800"
                      }
                    >
                      {result.converted}
                    </span>
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

          {/* Features & Instructions */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features & Usage</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Batch convert multiple timestamps</li>
              <li>Supports ISO 8601, Unix (seconds/milliseconds), human-readable, and custom formats</li>
              <li>Custom format examples: YYYY-MM-DD HH:mm:ss Z</li>
              <li>Time zone adjustments with all IANA time zones</li>
              <li>Flexible input delimiters (newline, comma, semicolon, tab)</li>
              <li>Import from CSV/TXT, export to CSV, copy to clipboard</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeBatchConverter;