"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaSync, FaClock, FaDownload } from "react-icons/fa";

const MilitaryTimeConverter = () => {
  const [militaryTime, setMilitaryTime] = useState("");
  const [standardTime, setStandardTime] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [timeZone, setTimeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [bulkInput, setBulkInput] = useState("");
  const [bulkOutput, setBulkOutput] = useState([]);
  const [error, setError] = useState("");
  const [realTimeUpdate, setRealTimeUpdate] = useState(false);
  const [formatOptions, setFormatOptions] = useState({
    includeSeconds: false,
    includeTimeZone: false,
  });

  const timeZones = Intl.supportedValuesOf("timeZone");

  // Parse and validate military time
  const parseMilitaryTime = useCallback((time) => {
    const regex = formatOptions.includeSeconds
      ? /^([0-1]?[0-9]|2[0-3])([0-5][0-9])([0-5][0-9])$/
      : /^([0-1]?[0-9]|2[0-3])([0-5][0-9])$/;
    if (!regex.test(time)) throw new Error(`Invalid military time format (${formatOptions.includeSeconds ? "HHMMSS" : "HHMM"})`);
    const hours = parseInt(time.slice(0, 2));
    const minutes = parseInt(time.slice(2, 4));
    const seconds = formatOptions.includeSeconds ? parseInt(time.slice(4, 6)) : 0;
    return { hours, minutes, seconds };
  }, [formatOptions.includeSeconds]);

  // Convert to standard time
  const convertToStandard = useCallback((military) => {
    try {
      const { hours, minutes, seconds } = parseMilitaryTime(military);
      const period = hours >= 12 ? "PM" : "AM";
      const standardHours = hours % 12 || 12;
      let result = `${standardHours}:${minutes.toString().padStart(2, "0")}`;
      if (formatOptions.includeSeconds) result += `:${seconds.toString().padStart(2, "0")}`;
      result += ` ${period}`;
      if (formatOptions.includeTimeZone) result += ` ${timeZone}`;
      return result;
    } catch (err) {
      setError(err.message);
      return "";
    }
  }, [formatOptions, timeZone]);

  // Convert to military time
  const convertToMilitary = useCallback((standard) => {
    try {
      const regex = formatOptions.includeSeconds
        ? /^(\d{1,2}):([0-5][0-9]):([0-5][0-9])\s*(AM|PM)$/i
        : /^(\d{1,2}):([0-5][0-9])\s*(AM|PM)$/i;
      if (!regex.test(standard)) throw new Error(`Invalid standard time format (e.g., ${formatOptions.includeSeconds ? "1:30:00 PM" : "1:30 PM"})`);
      const parts = standard.match(regex);
      let hours = parseInt(parts[1]);
      const minutes = parts[2];
      const seconds = formatOptions.includeSeconds ? parts[3] : "00";
      const period = parts[formatOptions.includeSeconds ? 4 : 3];
      if (hours > 12) throw new Error("Hours must be 1-12 for standard time");
      if (period.toUpperCase() === "PM" && hours !== 12) hours += 12;
      if (period.toUpperCase() === "AM" && hours === 12) hours = 0;
      return `${hours.toString().padStart(2, "0")}${minutes}${seconds}`;
    } catch (err) {
      setError(err.message);
      return "";
    }
  }, [formatOptions]);

  // Input handlers
  const handleMilitaryInput = (value) => {
    setMilitaryTime(value);
    setError("");
    const standard = convertToStandard(value);
    setStandardTime(standard);
  };

  const handleStandardInput = (value) => {
    setStandardTime(value);
    setError("");
    const military = convertToMilitary(value);
    setMilitaryTime(military);
  };

  // Set current time
  const handleNow = useCallback(() => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const seconds = now.getSeconds().toString().padStart(2, "0");
    const military = formatOptions.includeSeconds ? `${hours}${minutes}${seconds}` : `${hours}${minutes}`;
    setMilitaryTime(military);
    setStandardTime(convertToStandard(military));
    setDate(now.toISOString().slice(0, 10));
    setError("");
  }, [formatOptions, convertToStandard]);

  // Bulk conversion
  const handleBulkConvert = useCallback(() => {
    setError("");
    const times = bulkInput.split("\n").map((line) => line.trim()).filter(Boolean);
    const results = times.map((time) => {
      if (formatOptions.includeSeconds ? /^\d{6}$/.test(time) : /^\d{4}$/.test(time)) {
        return `${time} → ${convertToStandard(time)}`;
      } else if (
        formatOptions.includeSeconds
          ? /^\d{1,2}:[0-5][0-9]:[0-5][0-9]\s*(AM|PM)$/i.test(time)
          : /^\d{1,2}:[0-5][0-9]\s*(AM|PM)$/i.test(time)
      ) {
        return `${time} → ${convertToMilitary(time)}`;
      }
      return `${time} → Invalid format`;
    });
    setBulkOutput(results);
  }, [bulkInput, formatOptions, convertToStandard, convertToMilitary]);

  // Download bulk results
  const downloadBulkResults = () => {
    if (bulkOutput.length === 0) return;
    const blob = new Blob([bulkOutput.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `bulk_time_conversion_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Real-time update effect
  useEffect(() => {
    if (realTimeUpdate) {
      handleNow(); // Immediate update
      const interval = setInterval(handleNow, 1000);
      return () => clearInterval(interval);
    }
  }, [realTimeUpdate, handleNow]);

  return (
    <div className="min-h-screen  flex items-center justify-center">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Military Time Converter
        </h1>

        <div className="space-y-8">
          {/* Single Conversion Section */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Military Time ({formatOptions.includeSeconds ? "HHMMSS" : "HHMM"})
                </label>
                <input
                  type="text"
                  value={militaryTime}
                  onChange={(e) => handleMilitaryInput(e.target.value)}
                  placeholder={formatOptions.includeSeconds ? "e.g., 143022" : "e.g., 1430"}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  maxLength={formatOptions.includeSeconds ? 6 : 4}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Standard Time (12-hour)
                </label>
                <input
                  type="text"
                  value={standardTime}
                  onChange={(e) => handleStandardInput(e.target.value)}
                  placeholder={formatOptions.includeSeconds ? "e.g., 2:30:22 PM" : "e.g., 2:30 PM"}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

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
            </div>
          </div>

          {/* Options */}
          <div className="flex flex-col sm:flex-row gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formatOptions.includeSeconds}
                onChange={(e) =>
                  setFormatOptions((prev) => ({ ...prev, includeSeconds: e.target.checked }))
                }
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">Include Seconds</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formatOptions.includeTimeZone}
                onChange={(e) =>
                  setFormatOptions((prev) => ({ ...prev, includeTimeZone: e.target.checked }))
                }
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">Include Time Zone</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={realTimeUpdate}
                onChange={(e) => setRealTimeUpdate(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">Real-time Update</span>
            </label>
            <button
              onClick={handleNow}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center"
            >
              <FaClock className="mr-2" /> Now
            </button>
          </div>

          {/* Bulk Conversion Section */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bulk Conversion (one per line)
              </label>
              <textarea
                value={bulkInput}
                onChange={(e) => setBulkInput(e.target.value)}
                placeholder={formatOptions.includeSeconds ? "143022\n2:30:00 PM" : "1430\n2:30 PM"}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
              />
            </div>
            <div className="flex gap-4">
              <button
                onClick={handleBulkConvert}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Convert Bulk
              </button>
              <button
                onClick={downloadBulkResults}
                disabled={bulkOutput.length === 0}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <FaDownload className="mr-2" /> Download Results
              </button>
            </div>
            {bulkOutput.length > 0 && (
              <div className="p-4 bg-gray-50 rounded-lg max-h-48 overflow-y-auto">
                <h2 className="text-lg font-semibold mb-2 text-gray-700">Bulk Results:</h2>
                <ul className="list-disc list-inside text-sm text-gray-600">
                  {bulkOutput.map((result, index) => (
                    <li key={index}>{result}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

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
              <li>Convert between military (24-hour) and standard (12-hour) time</li>
              <li>Optional seconds and time zone inclusion</li>
              <li>Real-time clock update</li>
              <li>Bulk conversion with downloadable results</li>
              <li>Supports all IANA time zones</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MilitaryTimeConverter;