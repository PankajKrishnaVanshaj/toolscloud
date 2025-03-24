"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaSync, FaCopy, FaDownload } from "react-icons/fa";

const TimeSinceCalculator = () => {
  const [inputDate, setInputDate] = useState(new Date().toISOString().slice(0, 16));
  const [timeZone, setTimeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [updateLive, setUpdateLive] = useState(true);
  const [units, setUnits] = useState({
    years: true,
    months: true,
    weeks: true,
    days: true,
    hours: true,
    minutes: true,
    seconds: true,
  });
  const [difference, setDifference] = useState({});
  const [displayFormat, setDisplayFormat] = useState("detailed"); // New: "detailed" or "summary"
  const [precision, setPrecision] = useState(0); // Decimal places for remaining values

  const timeZones = Intl.supportedValuesOf("timeZone");

  const calculateTimeSince = useCallback(() => {
    try {
      const now = new Date();
      const past = new Date(new Date(inputDate).toLocaleString("en-US", { timeZone }));
      const diffMs = now - past;

      if (isNaN(diffMs)) throw new Error("Invalid date");

      const seconds = Math.floor(diffMs / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);
      const weeks = Math.floor(days / 7);
      const months = Math.floor(days / 30.44);
      const years = Math.floor(days / 365.25);

      const remaining = {
        months: (days % 365.25 / 30.44).toFixed(precision), // More precise remaining months
        weeks: (days % 7).toFixed(precision),
        days: (hours % 24).toFixed(precision),
        hours: (minutes % 60).toFixed(precision),
        minutes: (seconds % 60).toFixed(precision),
        seconds: (diffMs / 1000 % 60).toFixed(precision),
      };

      return {
        years,
        months,
        weeks,
        days,
        hours,
        minutes,
        seconds,
        milliseconds: diffMs,
        remaining,
      };
    } catch (err) {
      return { error: "Invalid date input" };
    }
  }, [inputDate, timeZone, precision]);

  const updateDifference = () => {
    const diff = calculateTimeSince();
    setDifference(diff);
  };

  useEffect(() => {
    updateDifference();
    if (updateLive) {
      const interval = setInterval(updateDifference, 1000);
      return () => clearInterval(interval);
    }
  }, [inputDate, updateLive, timeZone, precision]);

  const handleNow = () => {
    setInputDate(new Date().toISOString().slice(0, 16));
  };

  const toggleUnit = (unit) => {
    setUnits((prev) => ({ ...prev, [unit]: !prev[unit] }));
  };

  const reset = () => {
    setInputDate(new Date().toISOString().slice(0, 16));
    setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    setUpdateLive(true);
    setUnits({
      years: true,
      months: true,
      weeks: true,
      days: true,
      hours: true,
      minutes: true,
      seconds: true,
    });
    setDisplayFormat("detailed");
    setPrecision(0);
  };

  const copyToClipboard = () => {
    const text = formatDifference();
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const downloadResult = () => {
    const text = formatDifference();
    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `time-since-${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
  };

  const formatDifference = () => {
    if (difference.error) return difference.error;
    if (Object.keys(difference).length === 0) return "No calculation yet";

    if (displayFormat === "summary") {
      const parts = [];
      if (units.years && difference.years) parts.push(`${difference.years} years`);
      if (units.months && difference.remaining.months) parts.push(`${difference.remaining.months} months`);
      if (units.weeks && difference.weeks) parts.push(`${difference.weeks} weeks`);
      if (units.days && difference.days) parts.push(`${difference.days} days`);
      if (units.hours && difference.hours) parts.push(`${difference.hours} hours`);
      if (units.minutes && difference.minutes) parts.push(`${difference.minutes} minutes`);
      if (units.seconds && difference.seconds) parts.push(`${difference.seconds} seconds`);
      return parts.join(", ") || "Less than a second";
    }

    return [
      units.years && `Years: ${difference.years || 0}`,
      units.months && `Months: ${difference.months || 0} (Remaining: ${difference.remaining?.months || 0})`,
      units.weeks && `Weeks: ${difference.weeks || 0} (Remaining: ${difference.remaining?.weeks || 0})`,
      units.days && `Days: ${difference.days || 0} (Remaining: ${difference.remaining?.days || 0})`,
      units.hours && `Hours: ${difference.hours || 0} (Remaining: ${difference.remaining?.hours || 0})`,
      units.minutes && `Minutes: ${difference.minutes || 0} (Remaining: ${difference.remaining?.minutes || 0})`,
      units.seconds && `Seconds: ${difference.seconds || 0} (Remaining: ${difference.remaining?.seconds || 0})`,
      `Total Milliseconds: ${(difference.milliseconds || 0).toLocaleString()}`,
    ]
      .filter(Boolean)
      .join("\n");
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-xl p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Time Since Calculator
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date/Time
              </label>
              <div className="flex gap-2">
                <input
                  type="datetime-local"
                  value={inputDate}
                  onChange={(e) => setInputDate(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleNow}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Now
                </button>
              </div>
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
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Settings Section */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Format
                </label>
                <select
                  value={displayFormat}
                  onChange={(e) => setDisplayFormat(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="detailed">Detailed</option>
                  <option value="summary">Summary</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precision (decimals)
                </label>
                <input
                  type="number"
                  min="0"
                  max="3"
                  value={precision}
                  onChange={(e) => setPrecision(Math.max(0, Math.min(3, e.target.value)))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={updateLive}
                    onChange={(e) => setUpdateLive(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">Update Live</span>
                </label>
              </div>
            </div>
          </div>

          {/* Unit Selection */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Display Units</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
              {Object.keys(units).map((unit) => (
                <label key={unit} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={units[unit]}
                    onChange={() => toggleUnit(unit)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  {unit.charAt(0).toUpperCase() + unit.slice(1)}
                </label>
              ))}
            </div>
          </div>

          {/* Results Section */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Time Since:</h2>
            {difference.error ? (
              <p className="text-red-700">{difference.error}</p>
            ) : Object.keys(difference).length > 0 ? (
              <pre className="text-sm whitespace-pre-wrap">{formatDifference()}</pre>
            ) : (
              <p className="text-gray-500">Enter a date to see the time difference</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={copyToClipboard}
              disabled={!Object.keys(difference).length}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaCopy className="mr-2" /> Copy Result
            </button>
            <button
              onClick={downloadResult}
              disabled={!Object.keys(difference).length}
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

        {/* Features Section */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Live updates with customizable units</li>
            <li>Detailed or summary display formats</li>
            <li>Adjustable precision for remaining values</li>
            <li>Time zone support</li>
            <li>Copy to clipboard and download options</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TimeSinceCalculator;