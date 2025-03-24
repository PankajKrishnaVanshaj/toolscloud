"use client";
import React, { useState, useCallback, useRef } from "react";
import { FaDownload, FaSync, FaClock, FaUpload } from "react-icons/fa";

const UnixTimeBatchConverter = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState([]);
  const [timeZone, setTimeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [direction, setDirection] = useState("unixToDate");
  const [formatOptions, setFormatOptions] = useState({
    date: true,
    time: true,
    seconds: true,
    milliseconds: false,
    timeZoneName: "short",
    hour12: true,
  });
  const [error, setError] = useState("");
  const [delimiter, setDelimiter] = useState("\n"); // For parsing input
  const fileInputRef = useRef(null);

  const timeZones = Intl.supportedValuesOf("timeZone");

  // Parse input based on delimiter
  const parseInput = useCallback(
    (text) => {
      return text
        .split(delimiter === "\n" ? "\n" : delimiter)
        .map((line) => line.trim())
        .filter((line) => line.length > 0);
    },
    [delimiter]
  );

  // Convert Unix to Date
  const convertUnixToDate = useCallback(
    (unix) => {
      const num = parseInt(unix, 10);
      if (isNaN(num)) return "Invalid Unix timestamp";
      const date = new Date(num * (unix.length >= 13 ? 1 : 1000));
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
      return new Intl.DateTimeFormat("en-US", options).format(date);
    },
    [timeZone, formatOptions]
  );

  // Convert Date to Unix
  const convertDateToUnix = useCallback((dateStr) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) throw new Error("Invalid date");
      return formatOptions.milliseconds
        ? date.getTime().toString()
        : Math.floor(date.getTime() / 1000).toString();
    } catch {
      return "Invalid date format";
    }
  }, [formatOptions.milliseconds]);

  // Handle conversion
  const handleConvert = useCallback(() => {
    setError("");
    const lines = parseInput(input);
    if (lines.length === 0) {
      setError("No valid input provided");
      setOutput([]);
      return;
    }
    const results = lines.map((line) =>
      direction === "unixToDate" ? convertUnixToDate(line) : convertDateToUnix(line)
    );
    setOutput(results);
  }, [input, direction, parseInput, convertUnixToDate, convertDateToUnix]);

  // Insert current time
  const handleNow = () => {
    const now = Date.now();
    setInput(
      direction === "unixToDate"
        ? formatOptions.milliseconds
          ? now.toString()
          : Math.floor(now / 1000).toString()
        : new Date().toLocaleString("en-US", { timeZone })
    );
    handleConvert();
  };

  // Reset everything
  const handleReset = () => {
    setInput("");
    setOutput([]);
    setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    setDirection("unixToDate");
    setFormatOptions({
      date: true,
      time: true,
      seconds: true,
      milliseconds: false,
      timeZoneName: "short",
      hour12: true,
    });
    setError("");
    setDelimiter("\n");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Format options change
  const handleFormatChange = (key, value) => {
    setFormatOptions((prev) => ({ ...prev, [key]: value }));
    if (input) handleConvert();
  };

  // Export to CSV
  const exportToCSV = () => {
    const csvContent = [
      direction === "unixToDate" ? "Unix Timestamp,Human-Readable" : "Human-Readable,Unix Timestamp",
      ...parseInput(input).map((line, i) => `"${line}","${output[i] || ""}"`),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `unix_time_batch_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const lines = text.split(delimiter === "\n" ? "\n" : delimiter).map((line) => line.split(",")[0].replace(/^"|"$/g, ""));
      setInput(lines.join(delimiter === "\n" ? "\n" : delimiter));
      handleConvert();
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 w-full ">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Unix Time Batch Converter
        </h1>

        <div className="space-y-6">
          {/* Direction Toggle */}
          <div className="flex justify-center gap-6">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="unixToDate"
                checked={direction === "unixToDate"}
                onChange={() => setDirection("unixToDate")}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="text-sm font-medium text-gray-700">Unix to Date</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="dateToUnix"
                checked={direction === "dateToUnix"}
                onChange={() => setDirection("dateToUnix")}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="text-sm font-medium text-gray-700">Date to Unix</span>
            </label>
          </div>

          {/* Input Section */}
          <div className="grid gap-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Input ({direction === "unixToDate" ? "Unix Timestamps" : "Dates"})
                </label>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={
                    direction === "unixToDate"
                      ? "1617235200\n1617321600"
                      : "March 31, 2021, 8:00 PM\nApril 1, 2021, 8:00 PM"
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-y"
                />
              </div>
              {output.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Output
                  </label>
                  <textarea
                    value={output.join(delimiter === "\n" ? "\n" : delimiter)}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 h-32 resize-y"
                  />
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time Zone</label>
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
                  <option value="\n">New Line</option>
                  <option value=",">Comma</option>
                  <option value=";">Semicolon</option>
                  <option value="\t">Tab</option>
                </select>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleConvert}
                className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
              >
                <FaUpload className="mr-2" /> Convert
              </button>
              <button
                onClick={handleNow}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <FaClock className="mr-2" /> Now
              </button>
              <button
                onClick={exportToCSV}
                disabled={output.length === 0}
                className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-purple-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaDownload className="mr-2" /> Export CSV
              </button>
              <button
                onClick={handleReset}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
              >
                <FaSync className="mr-2" /> Reset
              </button>
            </div>

            {/* File Upload */}
            <div>
              <input
                type="file"
                accept=".txt,.csv"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
          </div>

          {/* Format Options */}
          {direction === "unixToDate" && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h2 className="text-lg font-semibold mb-2 text-gray-700">Format Options</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: "Include Date", key: "date" },
                  { label: "Include Time", key: "time" },
                  { label: "Include Seconds", key: "seconds" },
                  { label: "Include Milliseconds", key: "milliseconds" },
                  { label: "Use 12-Hour Clock", key: "hour12" },
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
                    className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="none">None</option>
                    <option value="short">Short (e.g., EST)</option>
                    <option value="long">Long (e.g., Eastern Standard Time)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Error Section */}
          {error && (
            <div className="p-4 bg-red-50 rounded-lg text-red-700">
              <p>{error}</p>
            </div>
          )}

          {/* Features Section */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Batch conversion between Unix timestamps and dates</li>
              <li>Support for seconds and milliseconds</li>
              <li>Customizable time zones and delimiters</li>
              <li>Flexible date/time format options</li>
              <li>Import from TXT/CSV and export to CSV</li>
              <li>Insert current timestamp with "Now" button</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnixTimeBatchConverter;