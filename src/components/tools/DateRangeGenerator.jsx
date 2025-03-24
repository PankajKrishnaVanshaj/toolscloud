"use client";
import React, { useState, useCallback } from "react";
import { FaDownload, FaSync, FaClock } from "react-icons/fa";

const DateRangeGenerator = () => {
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 16));
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 16));
  const [step, setStep] = useState(1);
  const [stepUnit, setStepUnit] = useState("days");
  const [timeZone, setTimeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [format, setFormat] = useState("iso");
  const [customFormat, setCustomFormat] = useState(""); // For custom format input
  const [includeTime, setIncludeTime] = useState(true);
  const [dates, setDates] = useState([]);
  const [error, setError] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Constants
  const timeZones = Intl.supportedValuesOf("timeZone");
  const stepUnits = ["minutes", "hours", "days", "weeks", "months", "years"];
  const formatOptions = {
    iso: "ISO 8601 (e.g., 2023-03-14T12:00:00Z)",
    short: "Short (MM/DD/YYYY)",
    long: "Long (MMMM DD, YYYY)",
    dateTime: "Date & Time (MM/DD/YYYY HH:mm)",
    custom: "Custom (Define below)",
  };

  // Generate dates
  const generateDates = useCallback(() => {
    setError("");
    setDates([]);
    setIsGenerating(true);

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      setError("Invalid start or end date");
      setIsGenerating(false);
      return;
    }

    if (start > end) {
      setError("Start date must be before end date");
      setIsGenerating(false);
      return;
    }

    const result = [];
    let current = new Date(start);

    while (current <= end) {
      result.push(new Date(current));
      switch (stepUnit) {
        case "minutes":
          current.setMinutes(current.getMinutes() + step);
          break;
        case "hours":
          current.setHours(current.getHours() + step);
          break;
        case "days":
          current.setDate(current.getDate() + step);
          break;
        case "weeks":
          current.setDate(current.getDate() + step * 7);
          break;
        case "months":
          current.setMonth(current.getMonth() + step);
          break;
        case "years":
          current.setFullYear(current.getFullYear() + step);
          break;
        default:
          setError("Invalid step unit");
          setIsGenerating(false);
          return;
      }
    }

    setDates(result);
    setIsGenerating(false);
  }, [startDate, endDate, step, stepUnit]);

  // Format date based on selected options
  const formatDate = (date) => {
    const options = { timeZone };
    const formatter = new Intl.DateTimeFormat("en-US", {
      ...options,
      year: "numeric",
      month: format === "short" ? "2-digit" : "long",
      day: "numeric",
      hour: includeTime && format !== "short" && format !== "long" ? "2-digit" : undefined,
      minute: includeTime && format !== "short" && format !== "long" ? "2-digit" : undefined,
      hour12: format === "dateTime",
    });

    switch (format) {
      case "iso":
        return date.toISOString();
      case "short":
      case "long":
      case "dateTime":
        return formatter.format(date);
      case "custom":
        try {
          return customFormat
            ? new Intl.DateTimeFormat("en-US", {
                ...options,
                ...(customFormat.includes("yyyy") && { year: "numeric" }),
                ...(customFormat.includes("MM") && { month: "2-digit" }),
                ...(customFormat.includes("MMMM") && { month: "long" }),
                ...(customFormat.includes("dd") && { day: "2-digit" }),
                ...(customFormat.includes("HH") && { hour: "2-digit", hour12: false }),
                ...(customFormat.includes("hh") && { hour: "2-digit", hour12: true }),
                ...(customFormat.includes("mm") && { minute: "2-digit" }),
                ...(customFormat.includes("ss") && { second: "2-digit" }),
                ...(customFormat.includes("a") && { hour12: true }),
                ...(customFormat.includes("z") && { timeZoneName: "short" }),
              }).format(date)
            : date.toLocaleString("en-US", { ...options });
        } catch {
          return date.toISOString(); // Fallback
        }
      default:
        return date.toISOString();
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," + "Date\n" + dates.map((date) => formatDate(date)).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `date_range_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Set current time
  const handleNow = (type) => {
    const now = new Date().toISOString().slice(0, 16);
    if (type === "start") setStartDate(now);
    else setEndDate(now);
  };

  // Reset all fields
  const reset = () => {
    const now = new Date().toISOString().slice(0, 16);
    setStartDate(now);
    setEndDate(now);
    setStep(1);
    setStepUnit("days");
    setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    setFormat("iso");
    setCustomFormat("");
    setIncludeTime(true);
    setDates([]);
    setError("");
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Date Range Generator
        </h1>

        <div className="space-y-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date/Time
              </label>
              <div className="flex gap-2">
                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => handleNow("start")}
                  className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <FaClock />
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date/Time
              </label>
              <div className="flex gap-2">
                <input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => handleNow("end")}
                  className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <FaClock />
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Step Interval
              </label>
              <input
                type="number"
                value={step}
                onChange={(e) => setStep(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Step Unit
              </label>
              <select
                value={stepUnit}
                onChange={(e) => setStepUnit(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                {stepUnits.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
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
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
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
                Format
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(formatOptions).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            {format === "custom" && (
              <div className="sm:col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Custom Format (e.g., "yyyy-MM-dd HH:mm")
                </label>
                <input
                  type="text"
                  value={customFormat}
                  onChange={(e) => setCustomFormat(e.target.value)}
                  placeholder="yyyy-MM-dd HH:mm:ss"
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use: yyyy (year), MM (month), dd (day), HH (24h), hh (12h), mm (min), ss (sec), a (AM/PM), z (timezone)
                </p>
              </div>
            )}
            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={includeTime}
                  onChange={(e) => setIncludeTime(e.target.checked)}
                  className="mr-2 accent-blue-500"
                />
                <span className="text-sm text-gray-700">Include Time</span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={generateDates}
              disabled={isGenerating}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isGenerating ? "Generating..." : "Generate Dates"}
            </button>
            <button
              onClick={exportToCSV}
              disabled={!dates.length || isGenerating}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> Export to CSV
            </button>
            <button
              onClick={reset}
              disabled={isGenerating}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>

          {/* Results Section */}
          {dates.length > 0 && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">
                Generated Dates ({dates.length}):
              </h2>
              <div className="max-h-64 overflow-y-auto">
                <ul className="list-disc list-inside text-sm text-gray-600">
                  {dates.map((date, index) => (
                    <li key={index}>{formatDate(date)}</li>
                  ))}
                </ul>
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
              <li>Customizable date ranges with steps (minutes to years)</li>
              <li>Multiple format options including custom Intl.DateTimeFormat</li>
              <li>Time zone support</li>
              <li>Toggle time inclusion</li>
              <li>Export to CSV with formatted dates</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DateRangeGenerator;