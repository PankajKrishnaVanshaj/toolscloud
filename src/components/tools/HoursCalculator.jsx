"use client";
import React, { useState, useCallback } from "react";
import { FaPlus, FaTrash, FaDownload, FaSync } from "react-icons/fa";

const HoursCalculator = () => {
  const [entries, setEntries] = useState([{ startTime: "", endTime: "" }]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [hourlyRate, setHourlyRate] = useState(0); // New feature: Calculate earnings
  const [timeFormat, setTimeFormat] = useState("24h"); // 24h or 12h format

  // Parse time string to minutes since midnight
  const parseTimeToMinutes = useCallback((time) => {
    if (!time) return null;

    if (timeFormat === "12h") {
      const [timePart, period] = time.split(" ");
      let [hours, minutes] = timePart.split(":").map(Number);
      if (isNaN(hours) || isNaN(minutes) || !period || minutes < 0 || minutes > 59) return null;
      if (period.toLowerCase() === "pm" && hours !== 12) hours += 12;
      if (period.toLowerCase() === "am" && hours === 12) hours = 0;
      if (hours < 0 || hours > 23) return null;
      return hours * 60 + minutes;
    } else {
      const [hours, minutes] = time.split(":").map(Number);
      if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59)
        return null;
      return hours * 60 + minutes;
    }
  }, [timeFormat]);

  // Convert minutes to hours and minutes
  const minutesToHoursMinutes = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return { hours, minutes, totalHours: (totalMinutes / 60).toFixed(2) };
  };

  // Calculate total hours and earnings
  const calculateHours = useCallback(() => {
    setError("");
    setResult(null);

    if (entries.some((entry) => !entry.startTime || !entry.endTime)) {
      setError("Please fill in all start and end times");
      return;
    }

    const timeData = entries.map((entry) => ({
      startMinutes: parseTimeToMinutes(entry.startTime),
      endMinutes: parseTimeToMinutes(entry.endTime),
    }));

    if (timeData.some((data) => data.startMinutes === null || data.endMinutes === null)) {
      setError(
        `Please enter valid times in ${timeFormat === "24h" ? "HH:MM (e.g., 09:00)" : "HH:MM AM/PM (e.g., 09:00 AM)"} format`
      );
      return;
    }

    let totalMinutes = 0;
    const breakdown = timeData.map((data, index) => {
      let diffMinutes = data.endMinutes - data.startMinutes;
      if (diffMinutes < 0) diffMinutes += 1440; // Handle crossing midnight
      totalMinutes += diffMinutes;
      const { hours, minutes } = minutesToHoursMinutes(diffMinutes);
      return {
        entry: index + 1,
        startTime: entries[index].startTime,
        endTime: entries[index].endTime,
        hours,
        minutes,
        totalMinutes: diffMinutes,
      };
    });

    const { hours, minutes, totalHours } = minutesToHoursMinutes(totalMinutes);
    const earnings = hourlyRate > 0 ? (totalMinutes / 60) * hourlyRate : null;

    return {
      breakdown,
      totalHours,
      totalMinutes,
      totalTime: `${hours}h ${minutes}m`,
      earnings: earnings ? earnings.toFixed(2) : null,
    };
  }, [entries, hourlyRate, timeFormat]);

  const calculate = () => {
    const calcResult = calculateHours();
    if (calcResult) setResult(calcResult);
  };

  // Handle input change
  const handleEntryChange = (index, field, value) => {
    const updatedEntries = [...entries];
    updatedEntries[index][field] = value;
    setEntries(updatedEntries);
  };

  // Add a new time entry
  const addEntry = () => {
    setEntries([...entries, { startTime: "", endTime: "" }]);
  };

  // Remove a time entry
  const removeEntry = (index) => {
    if (entries.length > 1) {
      setEntries(entries.filter((_, i) => i !== index));
    }
  };

  // Reset everything
  const reset = () => {
    setEntries([{ startTime: "", endTime: "" }]);
    setResult(null);
    setError("");
    setShowDetails(false);
    setHourlyRate(0);
    setTimeFormat("24h");
  };

  // Download result as text file
  const downloadResult = () => {
    if (!result) return;
    const text = [
      "Hours Calculator Result",
      `Total Time: ${result.totalTime}`,
      `Total Hours: ${result.totalHours}`,
      `Total Minutes: ${result.totalMinutes}`,
      result.earnings ? `Earnings: $${result.earnings}` : "",
      "",
      "Breakdown:",
      ...result.breakdown.map(
        (entry) =>
          `Entry ${entry.entry}: ${entry.startTime} - ${entry.endTime} = ${entry.hours}h ${entry.minutes}m (${entry.totalMinutes} minutes)`
      ),
    ].join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `hours-calculation-${Date.now()}.txt`;
    link.click();
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Hours Calculator
        </h1>

        {/* Settings */}
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time Format
            </label>
            <select
              value={timeFormat}
              onChange={(e) => setTimeFormat(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="24h">24-Hour (HH:MM)</option>
              <option value="12h">12-Hour (HH:MM AM/PM)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hourly Rate ($)
            </label>
            <input
              type="number"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(Math.max(0, e.target.value))}
              min="0"
              step="0.01"
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 15.50"
            />
          </div>
        </div>

        {/* Input Section */}
        <div className="space-y-4 mb-6">
          {entries.map((entry, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={entry.startTime}
                onChange={(e) => handleEntryChange(index, "startTime", e.target.value)}
                className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder={timeFormat === "24h" ? "Start (HH:MM)" : "Start (HH:MM AM/PM)"}
              />
              <input
                type="text"
                value={entry.endTime}
                onChange={(e) => handleEntryChange(index, "endTime", e.target.value)}
                className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder={timeFormat === "24h" ? "End (HH:MM)" : "End (HH:MM AM/PM)"}
              />
              {entries.length > 1 && (
                <button
                  onClick={() => removeEntry(index)}
                  className="p-2 text-red-600 hover:text-red-800 transition-colors"
                >
                  <FaTrash />
                </button>
              )}
            </div>
          ))}
          <button
            onClick={addEntry}
            className="w-full py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors flex items-center justify-center"
          >
            <FaPlus className="mr-2" /> Add Time Entry
          </button>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={calculate}
            className="flex-1 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Calculate Hours
          </button>
          <button
            onClick={downloadResult}
            disabled={!result}
            className="flex-1 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <FaDownload className="mr-2" /> Download Result
          </button>
          <button
            onClick={reset}
            className="flex-1 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Reset
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg text-center">
            {error}
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 text-center">Results</h2>
            <div className="mt-2 space-y-2">
              <p className="text-center text-xl font-medium">{result.totalTime}</p>
              <p className="text-center">Total Hours: {result.totalHours}</p>
              <p className="text-center">Total Minutes: {result.totalMinutes}</p>
              {result.earnings && (
                <p className="text-center text-green-600">Earnings: ${result.earnings}</p>
              )}

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
                <div className="text-sm space-y-2">
                  <p className="font-medium">Breakdown:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {result.breakdown.map((entry) => (
                      <li key={entry.entry}>
                        Entry {entry.entry}: {entry.startTime} - {entry.endTime} = {entry.hours}h{" "}
                        {entry.minutes}m ({entry.totalMinutes} minutes)
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Support for multiple time entries</li>
            <li>24-hour or 12-hour time format</li>
            <li>Handles overnight shifts</li>
            <li>Earnings calculation with hourly rate</li>
            <li>Download results as text file</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HoursCalculator;