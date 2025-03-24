"use client";
import React, { useState, useCallback, useEffect } from "react";
import { FaSync, FaClock, FaCalendarAlt } from "react-icons/fa";

const DateAdder = () => {
  const [baseDate, setBaseDate] = useState(new Date().toISOString().slice(0, 16));
  const [interval, setInterval] = useState(0);
  const [unit, setUnit] = useState("days");
  const [timeZone, setTimeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [operation, setOperation] = useState("add");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [formatOptions, setFormatOptions] = useState({
    date: true,
    time: true,
    seconds: false,
    timeZoneName: "short",
    weekday: false,
  });
  const [autoUpdate, setAutoUpdate] = useState(false);

  const units = ["years", "months", "weeks", "days", "hours", "minutes", "seconds"];
  const timeZones = Intl.supportedValuesOf("timeZone");

  // Calculate date with useCallback for optimization
  const calculateDate = useCallback(() => {
    setError("");
    try {
      const date = new Date(baseDate);
      if (isNaN(date.getTime())) throw new Error("Invalid base date");

      const multiplier = operation === "add" ? 1 : -1;
      const value = Number(interval) * multiplier;

      let resultDate = new Date(date);
      switch (unit) {
        case "years":
          resultDate.setFullYear(date.getFullYear() + value);
          break;
        case "months":
          resultDate.setMonth(date.getMonth() + value);
          break;
        case "weeks":
          resultDate.setDate(date.getDate() + value * 7);
          break;
        case "days":
          resultDate.setDate(date.getDate() + value);
          break;
        case "hours":
          resultDate.setHours(date.getHours() + value);
          break;
        case "minutes":
          resultDate.setMinutes(date.getMinutes() + value);
          break;
        case "seconds":
          resultDate.setSeconds(date.getSeconds() + value);
          break;
        default:
          throw new Error("Invalid unit");
      }

      const options = {
        timeZone,
        year: formatOptions.date ? "numeric" : undefined,
        month: formatOptions.date ? "long" : undefined,
        day: formatOptions.date ? "numeric" : undefined,
        weekday: formatOptions.weekday ? "long" : undefined,
        hour: formatOptions.time ? "2-digit" : undefined,
        minute: formatOptions.time ? "2-digit" : undefined,
        second: formatOptions.seconds ? "2-digit" : undefined,
        timeZoneName:
          formatOptions.timeZoneName !== "none" ? formatOptions.timeZoneName : undefined,
        hour12: true,
      };

      const formattedResult = new Intl.DateTimeFormat("en-US", options).format(resultDate);
      setResult(formattedResult);

      // Add to history
      setHistory((prev) => [
        {
          baseDate,
          interval,
          unit,
          operation,
          timeZone,
          result: formattedResult,
          timestamp: new Date().toISOString(),
        },
        ...prev.slice(0, 9), // Keep last 10 entries
      ]);
    } catch (err) {
      setError(`Error: ${err.message}`);
      setResult("");
    }
  }, [baseDate, interval, unit, operation, timeZone, formatOptions]);

  // Auto-update effect
  useEffect(() => {
    if (autoUpdate) {
      calculateDate();
    }
  }, [baseDate, interval, unit, operation, timeZone, formatOptions, autoUpdate, calculateDate]);

  const handleNow = () => {
    setBaseDate(new Date().toISOString().slice(0, 16));
    if (autoUpdate) calculateDate();
  };

  const handleReset = () => {
    setBaseDate(new Date().toISOString().slice(0, 16));
    setInterval(0);
    setUnit("days");
    setOperation("add");
    setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    setResult("");
    setError("");
    setFormatOptions({
      date: true,
      time: true,
      seconds: false,
      timeZoneName: "short",
      weekday: false,
    });
  };

  const handleFormatChange = (key, value) => {
    setFormatOptions((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearHistory = () => setHistory([]);

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Date Adder/Subtractor
        </h1>

        <div className="space-y-6">
          {/* Input Section */}
          <div className="grid gap-4">
            <div className="grid gap-2">
              <label className="block text-sm font-medium text-gray-700">
                Base Date/Time
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="datetime-local"
                  value={baseDate}
                  onChange={(e) => setBaseDate(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleNow}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center"
                >
                  <FaClock className="mr-2" /> Now
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Interval</label>
                <input
                  type="number"
                  value={interval}
                  onChange={(e) => setInterval(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  {units.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Operation</label>
                <select
                  value={operation}
                  onChange={(e) => setOperation(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="add">Add</option>
                  <option value="subtract">Subtract</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time Zone</label>
              <select
                value={timeZone}
                onChange={(e) => setTimeZone(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                {timeZones.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={autoUpdate}
                onChange={(e) => setAutoUpdate(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="text-sm font-medium text-gray-700">
                Auto-Update Result
              </label>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={calculateDate}
                disabled={autoUpdate}
                className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Calculate
              </button>
              <button
                onClick={handleReset}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
              >
                <FaSync className="mr-2" /> Reset
              </button>
            </div>
          </div>

          {/* Format Options */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Format Options</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "Include Date", key: "date" },
                { label: "Include Time", key: "time" },
                { label: "Include Seconds", key: "seconds" },
                { label: "Include Weekday", key: "weekday" },
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
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time Zone Display
                </label>
                <select
                  value={formatOptions.timeZoneName}
                  onChange={(e) => handleFormatChange("timeZoneName", e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="none">None</option>
                  <option value="short">Short (e.g., EST)</option>
                  <option value="long">Long (e.g., Eastern Standard Time)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Result */}
          {result && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <h2 className="text-lg font-semibold text-blue-700 mb-2">Result</h2>
              <p className="text-sm text-blue-600">{result}</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-50 rounded-lg text-red-700">
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* History */}
          {history.length > 0 && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold text-gray-700">Calculation History</h2>
                <button
                  onClick={clearHistory}
                  className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm"
                >
                  Clear
                </button>
              </div>
              <ul className="text-sm text-gray-600 space-y-2 max-h-48 overflow-y-auto">
                {history.map((entry, index) => (
                  <li key={index} className="border-b py-1">
                    {entry.operation === "add" ? "Added" : "Subtracted"} {entry.interval}{" "}
                    {entry.unit} to {new Date(entry.baseDate).toLocaleString()} ({entry.timeZone})
                    = <strong>{entry.result}</strong>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Features */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Add or subtract intervals in various units</li>
              <li>Time zone support with customizable display</li>
              <li>Flexible date/time format options</li>
              <li>Auto-update result on input change</li>
              <li>Calculation history tracking</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DateAdder;