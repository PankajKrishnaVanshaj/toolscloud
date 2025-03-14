"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaSync, FaCopy, FaCalendar } from "react-icons/fa";

const DateSubtractor = () => {
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 16));
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 16));
  const [timeZone, setTimeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [unit, setUnit] = useState("days");
  const [includeTime, setIncludeTime] = useState(true);
  const [precision, setPrecision] = useState(2); // Decimal precision
  const [result, setResult] = useState({ value: 0, formatted: "", breakdown: {} });
  const [error, setError] = useState("");

  // Supported units with detailed breakdown capability
  const units = [
    { value: "years", label: "Years" },
    { value: "months", label: "Months" },
    { value: "weeks", label: "Weeks" },
    { value: "days", label: "Days" },
    { value: "hours", label: "Hours" },
    { value: "minutes", label: "Minutes" },
    { value: "seconds", label: "Seconds" },
    { value: "detailed", label: "Detailed Breakdown" },
  ];

  const timeZones = Intl.supportedValuesOf("timeZone");

  const calculateDifference = useCallback(() => {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new Error("Invalid date input");
      }

      const startAdjusted = new Date(start.toLocaleString("en-US", { timeZone }));
      const endAdjusted = new Date(end.toLocaleString("en-US", { timeZone }));

      if (!includeTime) {
        startAdjusted.setHours(0, 0, 0, 0);
        endAdjusted.setHours(0, 0, 0, 0);
      }

      const diffMs = endAdjusted - startAdjusted;
      let value, formatted, breakdown = {};

      if (unit === "detailed") {
        const absDiffMs = Math.abs(diffMs);
        breakdown = {
          years: Math.floor(absDiffMs / (1000 * 60 * 60 * 24 * 365.25)),
          months: Math.floor((absDiffMs % (1000 * 60 * 60 * 24 * 365.25)) / (1000 * 60 * 60 * 24 * 30.44)),
          days: Math.floor((absDiffMs % (1000 * 60 * 60 * 24 * 30.44)) / (1000 * 60 * 60 * 24)),
          hours: Math.floor((absDiffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((absDiffMs % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((absDiffMs % (1000 * 60)) / 1000),
        };
        value = diffMs / (1000 * 60 * 60 * 24); // Default to days for raw value
        formatted = `${breakdown.years}y ${breakdown.months}m ${breakdown.days}d ${breakdown.hours}h ${breakdown.minutes}m ${breakdown.seconds}s`;
      } else {
        switch (unit) {
          case "years":
            value = diffMs / (1000 * 60 * 60 * 24 * 365.25);
            formatted = `${value.toFixed(precision)} years`;
            break;
          case "months":
            value = diffMs / (1000 * 60 * 60 * 24 * 30.44);
            formatted = `${value.toFixed(precision)} months`;
            break;
          case "weeks":
            value = diffMs / (1000 * 60 * 60 * 24 * 7);
            formatted = `${value.toFixed(precision)} weeks`;
            break;
          case "days":
            value = diffMs / (1000 * 60 * 60 * 24);
            formatted = `${value.toFixed(precision)} days`;
            break;
          case "hours":
            value = diffMs / (1000 * 60 * 60);
            formatted = `${value.toFixed(precision)} hours`;
            break;
          case "minutes":
            value = diffMs / (1000 * 60);
            formatted = `${value.toFixed(precision)} minutes`;
            break;
          case "seconds":
            value = diffMs / 1000;
            formatted = `${value.toFixed(precision)} seconds`;
            break;
          default:
            value = 0;
            formatted = "Unknown unit";
        }
      }

      setResult({ value, formatted, breakdown });
      setError("");
    } catch (err) {
      setResult({ value: 0, formatted: "", breakdown: {} });
      setError(`Error: ${err.message}`);
    }
  }, [startDate, endDate, timeZone, unit, includeTime, precision]);

  useEffect(() => {
    calculateDifference();
  }, [calculateDifference]);

  const handleNow = (setter) => {
    setter(new Date().toISOString().slice(0, 16));
  };

  const reset = () => {
    const now = new Date().toISOString().slice(0, 16);
    setStartDate(now);
    setEndDate(now);
    setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    setUnit("days");
    setIncludeTime(true);
    setPrecision(2);
    setResult({ value: 0, formatted: "", breakdown: {} });
    setError("");
  };

  const copyToClipboard = () => {
    const text = unit === "detailed" ? result.formatted : `${result.formatted} (${result.value.toLocaleString()})`;
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Date Subtractor
        </h1>

        <div className="space-y-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {[
              { label: "Start Date/Time", value: startDate, setter: setStartDate },
              { label: "End Date/Time", value: endDate, setter: setEndDate },
            ].map(({ label, value, setter }) => (
              <div key={label} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">{label}</label>
                <div className="flex gap-2">
                  <input
                    type="datetime-local"
                    value={value}
                    onChange={(e) => setter(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => handleNow(setter)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <FaCalendar className="inline mr-2" /> Now
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Time Zone</label>
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
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Unit</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {units.map((u) => (
                  <option key={u.value} value={u.value}>
                    {u.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Precision ({precision} decimals)
              </label>
              <input
                type="range"
                min="0"
                max="6"
                value={precision}
                onChange={(e) => setPrecision(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={includeTime}
              onChange={(e) => setIncludeTime(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="text-sm font-medium text-gray-700">
              Include Time in Calculation
            </label>
          </div>

          {/* Results Section */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Difference</h2>
            <div className="space-y-2 text-sm text-gray-700">
              <p>
                <span className="font-medium">Formatted:</span> {result.formatted}
              </p>
              <p>
                <span className="font-medium">Raw Value:</span>{" "}
                {result.value.toLocaleString(undefined, {
                  minimumFractionDigits: precision,
                  maximumFractionDigits: precision,
                })}
              </p>
              {unit === "detailed" && Object.keys(result.breakdown).length > 0 && (
                <div>
                  <span className="font-medium">Breakdown:</span>
                  <ul className="list-disc list-inside mt-1">
                    {Object.entries(result.breakdown).map(([key, val]) => (
                      <li key={key}>
                        {key.charAt(0).toUpperCase() + key.slice(1)}: {val}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <button
              onClick={copyToClipboard}
              className="mt-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center"
            >
              <FaCopy className="mr-2" /> Copy Result
            </button>
          </div>

          {/* Error Section */}
          {error && (
            <div className="p-4 bg-red-50 rounded-lg text-red-700">
              <p>{error}</p>
            </div>
          )}

          {/* Actions */}
          <button
            onClick={reset}
            className="w-full py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Reset
          </button>

          {/* Features Section */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Calculate differences in multiple units</li>
              <li>Detailed breakdown option</li>
              <li>Adjustable decimal precision</li>
              <li>Time zone support</li>
              <li>Option to include/exclude time</li>
              <li>Real-time updates</li>
              <li>Copy result to clipboard</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DateSubtractor;