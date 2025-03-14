"use client";
import React, { useState, useCallback } from "react";
import { FaCalculator, FaSync, FaDownload, FaClock } from "react-icons/fa";

const TimeDurationCalculator = () => {
  const [startDateTime, setStartDateTime] = useState("");
  const [endDateTime, setEndDateTime] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [unitPreference, setUnitPreference] = useState("detailed"); // New: Unit display preference
  const [includeBusinessDays, setIncludeBusinessDays] = useState(false); // New: Business days option

  // Calculate time duration
  const calculateDuration = useCallback((start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return { error: "Invalid date/time format" };
    }
    if (startDate > endDate) {
      return { error: "End date/time must be after start date/time" };
    }

    const diffMs = endDate - startDate;

    const totalSeconds = Math.floor(diffMs / 1000);
    const totalMinutes = Math.floor(totalSeconds / 60);
    const totalHours = Math.floor(totalMinutes / 60);
    const totalDays = Math.floor(totalHours / 24);

    const years = Math.floor(totalDays / 365.25);
    const remainingDaysAfterYears = totalDays % 365.25;
    const months = Math.floor(remainingDaysAfterYears / 30.44);
    const days = Math.floor(remainingDaysAfterYears % 30.44);

    const hours = totalHours % 24;
    const minutes = totalMinutes % 60;
    const seconds = totalSeconds % 60;

    // Calculate business days (Monday to Friday)
    let businessDays = 0;
    if (includeBusinessDays) {
      let current = new Date(startDate);
      while (current <= endDate) {
        const dayOfWeek = current.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) businessDays++; // Exclude Sunday (0) and Saturday (6)
        current.setDate(current.getDate() + 1);
      }
    }

    return {
      years,
      months,
      days,
      hours,
      minutes,
      seconds,
      totalDays,
      totalHours,
      totalMinutes,
      totalSeconds,
      totalWeeks: Math.floor(totalDays / 7),
      businessDays: includeBusinessDays ? businessDays : null,
      start: startDate.toLocaleString(),
      end: endDate.toLocaleString(),
    };
  }, [includeBusinessDays]);

  const calculate = () => {
    setError("");
    setResult(null);

    if (!startDateTime || !endDateTime) {
      setError("Please enter both start and end date/time");
      return;
    }

    const calcResult = calculateDuration(startDateTime, endDateTime);
    if (calcResult.error) {
      setError(calcResult.error);
      return;
    }

    setResult(calcResult);
  };

  const reset = () => {
    setStartDateTime("");
    setEndDateTime("");
    setResult(null);
    setError("");
    setShowDetails(false);
    setUnitPreference("detailed");
    setIncludeBusinessDays(false);
  };

  // Download result as text file
  const downloadResult = () => {
    if (!result) return;
    const text = `
Time Duration Result
From: ${result.start}
To: ${result.end}
Duration: ${getFormattedDuration()}
${showDetails ? `
Total Days: ${result.totalDays}
Total Weeks: ${result.totalWeeks}
Total Hours: ${result.totalHours}
Total Minutes: ${result.totalMinutes}
Total Seconds: ${result.totalSeconds}
${result.businessDays !== null ? `Business Days: ${result.businessDays}` : ""}` : ""}
    `.trim();
    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `duration-result-${Date.now()}.txt`;
    link.click();
  };

  // Format duration based on unit preference
  const getFormattedDuration = () => {
    if (!result) return "";
    switch (unitPreference) {
      case "detailed":
        return `${result.years > 0 ? `${result.years} years, ` : ""}${
          result.months > 0 ? `${result.months} months, ` : ""
        }${result.days} days, ${result.hours} hours, ${result.minutes} minutes, ${result.seconds} seconds`;
      case "days":
        return `${result.totalDays} days`;
      case "hours":
        return `${result.totalHours} hours`;
      case "minutes":
        return `${result.totalMinutes} minutes`;
      case "seconds":
        return `${result.totalSeconds} seconds`;
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Time Duration Calculator
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div className="space-y-4">
            {[
              { label: "Start Date/Time", value: startDateTime, setter: setStartDateTime },
              { label: "End Date/Time", value: endDateTime, setter: setEndDateTime },
            ].map(({ label, value, setter }) => (
              <div key={label} className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <label className="w-32 text-sm font-medium text-gray-700">{label}:</label>
                <input
                  type="datetime-local"
                  value={value}
                  onChange={(e) => setter(e.target.value)}
                  className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  max={new Date().toISOString().slice(0, 16)}
                />
              </div>
            ))}
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Units
              </label>
              <select
                value={unitPreference}
                onChange={(e) => setUnitPreference(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="detailed">Detailed (Years to Seconds)</option>
                <option value="days">Total Days</option>
                <option value="hours">Total Hours</option>
                <option value="minutes">Total Minutes</option>
                <option value="seconds">Total Seconds</option>
              </select>
            </div>
            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={includeBusinessDays}
                  onChange={(e) => setIncludeBusinessDays(e.target.checked)}
                  className="mr-2 accent-blue-500"
                />
                <span className="text-sm text-gray-700">Include Business Days</span>
              </label>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={calculate}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <FaCalculator className="mr-2" /> Calculate
            </button>
            <button
              onClick={downloadResult}
              disabled={!result}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> Download
            </button>
            <button
              onClick={reset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200 text-center">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h2 className="text-lg font-semibold text-blue-700 text-center">Duration</h2>
            <div className="mt-2 space-y-2">
              <p className="text-center text-xl text-blue-600">{getFormattedDuration()}</p>
              <p className="text-center text-sm text-gray-600">From: {result.start}</p>
              <p className="text-center text-sm text-gray-600">To: {result.end}</p>

              {/* Details Toggle */}
              <div className="text-center">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {showDetails ? "Hide Details" : "Show Details"}
                </button>
              </div>

              {showDetails && (
                <div className="text-sm text-gray-600 space-y-2">
                  <p>Total Duration Breakdown:</p>
                  <ul className="list-disc list-inside">
                    <li>Total Days: {result.totalDays}</li>
                    <li>Total Weeks: {result.totalWeeks}</li>
                    <li>Total Hours: {result.totalHours}</li>
                    <li>Total Minutes: {result.totalMinutes}</li>
                    <li>Total Seconds: {result.totalSeconds}</li>
                    {result.businessDays !== null && (
                      <li>Business Days: {result.businessDays}</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-gray-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
            <li>Calculate duration between two dates</li>
            <li>Flexible unit display options</li>
            <li>Include business days (Mon-Fri)</li>
            <li>Download result as text file</li>
            <li>Detailed breakdown toggle</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TimeDurationCalculator;