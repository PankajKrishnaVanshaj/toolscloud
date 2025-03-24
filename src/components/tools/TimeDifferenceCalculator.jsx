"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaSync, FaClock, FaSave } from "react-icons/fa";

const TimeDifferenceCalculator = () => {
  const [startTime, setStartTime] = useState(new Date().toISOString().slice(0, 16));
  const [endTime, setEndTime] = useState(new Date().toISOString().slice(0, 16));
  const [startZone, setStartZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [endZone, setEndZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [units, setUnits] = useState({
    years: true,
    months: true,
    weeks: true,
    days: true,
    hours: true,
    minutes: true,
    seconds: true,
  });
  const [liveUpdate, setLiveUpdate] = useState(false);
  const [difference, setDifference] = useState({});
  const [error, setError] = useState("");
  const [format, setFormat] = useState("detailed"); // New: output format
  const [history, setHistory] = useState([]); // New: calculation history

  const timeZones = Intl.supportedValuesOf("timeZone");

  const calculateDifference = useCallback(() => {
    try {
      const start = new Date(new Date(startTime).toLocaleString("en-US", { timeZone: startZone }));
      const end = new Date(new Date(endTime).toLocaleString("en-US", { timeZone: endZone }));

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new Error("Invalid date/time input");
      }

      const diffMs = end - start;
      const diffSeconds = Math.floor(diffMs / 1000);
      const diffMinutes = Math.floor(diffSeconds / 60);
      const diffHours = Math.floor(diffMinutes / 60);
      const diffDays = Math.floor(diffHours / 24);
      const diffWeeks = Math.floor(diffDays / 7);
      const diffMonths = Math.floor(diffDays / 30.44);
      const diffYears = Math.floor(diffDays / 365.25);

      const result = {};
      if (units.years) result.years = diffYears;
      if (units.months) result.months = diffMonths - diffYears * 12;
      if (units.weeks) result.weeks = diffWeeks;
      if (units.days) result.days = diffDays - diffMonths * 30.44;
      if (units.hours) result.hours = diffHours - diffDays * 24;
      if (units.minutes) result.minutes = diffMinutes - diffHours * 60;
      if (units.seconds) result.seconds = diffSeconds - diffMinutes * 60;

      setDifference(result);
      setError("");
    } catch (err) {
      setError(`Error: ${err.message}`);
      setDifference({});
    }
  }, [startTime, endTime, startZone, endZone, units]);

  useEffect(() => {
    calculateDifference();
    if (liveUpdate) {
      const interval = setInterval(calculateDifference, 1000);
      return () => clearInterval(interval);
    }
  }, [calculateDifference, liveUpdate]);

  const handleNow = (type) => {
    const now = new Date().toISOString().slice(0, 16);
    if (type === "start") setStartTime(now);
    else setEndTime(now);
  };

  const toggleUnit = (unit) => {
    setUnits((prev) => ({ ...prev, [unit]: !prev[unit] }));
  };

  const reset = () => {
    const now = new Date().toISOString().slice(0, 16);
    setStartTime(now);
    setEndTime(now);
    setStartZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    setEndZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    setUnits({
      years: true,
      months: true,
      weeks: true,
      days: true,
      hours: true,
      minutes: true,
      seconds: true,
    });
    setLiveUpdate(false);
    setFormat("detailed");
    setError("");
  };

  const saveToHistory = () => {
    if (Object.keys(difference).length > 0) {
      setHistory((prev) => [
        {
          start: { time: startTime, zone: startZone },
          end: { time: endTime, zone: endZone },
          difference,
          timestamp: new Date().toISOString(),
        },
        ...prev.slice(0, 9), // Keep last 10 entries
      ]);
    }
  };

  const formatDifference = () => {
    if (Object.keys(difference).length === 0) return "";

    if (format === "compact") {
      const parts = Object.entries(difference)
        .filter(([_, value]) => value !== 0)
        .map(([unit, value]) => `${value}${unit.charAt(0)}`);
      return parts.length > 0 ? parts.join(" ") : "0s";
    } else if (format === "sentence") {
      const parts = Object.entries(difference)
        .filter(([_, value]) => value !== 0)
        .map(([unit, value]) => `${value} ${value === 1 ? unit.slice(0, -1) : unit}`);
      return parts.length > 0 ? parts.join(", ") : "No difference";
    }
    return difference; // detailed format returns the object
  };

  return (
    <div className="min-h-screen  flex items-center justify-center">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Time Difference Calculator
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {["start", "end"].map((type) => (
              <div key={type}>
                <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                  {type} Date/Time
                </label>
                <div className="flex gap-2">
                  <input
                    type="datetime-local"
                    value={type === "start" ? startTime : endTime}
                    onChange={(e) =>
                      type === "start" ? setStartTime(e.target.value) : setEndTime(e.target.value)
                    }
                    className="flex-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => handleNow(type)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Now
                  </button>
                </div>
                <select
                  value={type === "start" ? startZone : endZone}
                  onChange={(e) =>
                    type === "start" ? setStartZone(e.target.value) : setEndZone(e.target.value)
                  }
                  className="w-full mt-2 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  {timeZones.map((tz) => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          {/* Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Output Format
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="detailed">Detailed</option>
                <option value="compact">Compact (e.g., 2y 3m)</option>
                <option value="sentence">Sentence (e.g., 2 years, 3 months)</option>
              </select>
            </div>
            <div className="flex items-center">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={liveUpdate}
                  onChange={(e) => setLiveUpdate(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-700">Live Update</span>
              </label>
            </div>
            <div className="flex gap-2">
              <button
                onClick={saveToHistory}
                disabled={Object.keys(difference).length === 0}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaSave className="mr-2" /> Save
              </button>
              <button
                onClick={reset}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
              >
                <FaSync className="mr-2" /> Reset
              </button>
            </div>
          </div>

          {/* Units Selection */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Display Units</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
              {Object.keys(units).map((unit) => (
                <label key={unit} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={units[unit]}
                    onChange={() => toggleUnit(unit)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span>{unit.charAt(0).toUpperCase() + unit.slice(1)}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Results */}
          {Object.keys(difference).length > 0 && (
            <div className="p-4 bg-green-50 rounded-lg">
              <h2 className="text-lg font-semibold text-green-700 mb-2">Time Difference</h2>
              {format === "detailed" ? (
                <div className="grid gap-1 text-sm text-green-600">
                  {Object.entries(difference).map(([unit, value]) => (
                    <p key={unit}>
                      <span className="font-medium">
                        {unit.charAt(0).toUpperCase() + unit.slice(1)}:
                      </span>{" "}
                      {value.toLocaleString()} {value === 1 ? unit.slice(0, -1) : unit}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-green-600">{formatDifference()}</p>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-50 rounded-lg text-red-700">
              <p>{error}</p>
            </div>
          )}

          {/* History */}
          {history.length > 0 && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <h2 className="text-lg font-semibold text-blue-700 mb-2">Calculation History</h2>
              <ul className="text-sm text-blue-600 space-y-2 max-h-40 overflow-y-auto">
                {history.map((entry, index) => (
                  <li key={index}>
                    <strong>{new Date(entry.timestamp).toLocaleString()}</strong>:{" "}
                    {entry.start.time} ({entry.start.zone}) to {entry.end.time} ({entry.end.zone}) -{" "}
                    {Object.entries(entry.difference)
                      .map(([unit, value]) => `${value} ${value === 1 ? unit.slice(0, -1) : unit}`)
                      .join(", ")}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Calculate time differences across time zones</li>
            <li>Multiple output formats: Detailed, Compact, Sentence</li>
            <li>Live updates with toggle</li>
            <li>Customizable units</li>
            <li>Save calculations to history (up to 10)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TimeDifferenceCalculator;