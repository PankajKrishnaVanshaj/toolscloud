"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaClock, FaSync, FaPlay, FaPause } from "react-icons/fa";

const TimeUntilCalculator = () => {
  const [targetTime, setTargetTime] = useState("");
  const [timeZone, setTimeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [recurring, setRecurring] = useState(false);
  const [recurrenceInterval, setRecurrenceInterval] = useState("day");
  const [recurrenceCount, setRecurrenceCount] = useState(1);
  const [timeRemaining, setTimeRemaining] = useState({});
  const [countdown, setCountdown] = useState(false);
  const [error, setError] = useState("");
  const [customFormat, setCustomFormat] = useState(""); // Custom display format
  const [isPaused, setIsPaused] = useState(false);

  // Time zones and recurrence options
  const timeZones = Intl.supportedValuesOf("timeZone");
  const recurrenceOptions = ["second", "minute", "hour", "day", "week", "month", "year"];

  const calculateTimeUntil = useCallback(() => {
    if (!targetTime) return {};

    const now = new Date();
    let targetDate = new Date(targetTime);

    if (isNaN(targetDate.getTime())) {
      setError("Invalid date/time");
      return {};
    }

    if (recurring) {
      const intervalMs = {
        second: 1000,
        minute: 60 * 1000,
        hour: 60 * 60 * 1000,
        day: 24 * 60 * 60 * 1000,
        week: 7 * 24 * 60 * 60 * 1000,
        month: 30 * 24 * 60 * 60 * 1000, // Approximate
        year: 365 * 24 * 60 * 60 * 1000, // Approximate
      }[recurrenceInterval] * recurrenceCount;

      while (targetDate <= now) {
        targetDate = new Date(targetDate.getTime() + intervalMs);
      }
    }

    const diffMs = targetDate - now;
    if (diffMs < 0) {
      setError("Target time is in the past");
      return {};
    }

    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30); // Approximate
    const years = Math.floor(days / 365); // Approximate

    return {
      milliseconds: diffMs,
      seconds,
      minutes,
      hours,
      days,
      weeks,
      months,
      years,
      formatted: customFormat
        ? customFormat
            .replace("{y}", years)
            .replace("{mo}", months % 12)
            .replace("{w}", weeks)
            .replace("{d}", days % 30)
            .replace("{h}", hours % 24)
            .replace("{m}", minutes % 60)
            .replace("{s}", seconds % 60)
            .replace("{ms}", diffMs % 1000)
        : `${years > 0 ? `${years}y ` : ""}${months % 12 > 0 ? `${months % 12}m ` : ""}${
            days % 30 > 0 ? `${days % 30}d ` : ""
          }${hours % 24}h ${minutes % 60}m ${seconds % 60}s`,
    };
  }, [targetTime, recurring, recurrenceInterval, recurrenceCount, customFormat]);

  const updateTime = useCallback(() => {
    if (!targetTime) {
      setTimeRemaining({});
      setError("");
      return;
    }

    const result = calculateTimeUntil();
    setTimeRemaining(result);
    setError(Object.keys(result).length === 0 ? error : "");
  }, [calculateTimeUntil, targetTime, error]);

  useEffect(() => {
    updateTime();
    if (countdown && !isPaused) {
      const interval = setInterval(updateTime, 1000);
      return () => clearInterval(interval);
    }
  }, [countdown, isPaused, updateTime]);

  // Quick set buttons
  const handleQuickSet = (minutes) => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + minutes);
    setTargetTime(now.toISOString().slice(0, 16));
  };

  // Reset all
  const reset = () => {
    setTargetTime("");
    setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    setRecurring(false);
    setRecurrenceInterval("day");
    setRecurrenceCount(1);
    setTimeRemaining({});
    setCountdown(false);
    setError("");
    setCustomFormat("");
    setIsPaused(false);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Time Until Calculator
        </h1>

        <div className="space-y-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Date/Time
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="datetime-local"
                  value={targetTime}
                  onChange={(e) => setTargetTime(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleQuickSet(5)}
                    className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                  >
                    +5 min
                  </button>
                  <button
                    onClick={() => handleQuickSet(60)}
                    className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                  >
                    +1 hr
                  </button>
                </div>
              </div>
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

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={recurring}
                onChange={(e) => setRecurring(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="text-sm font-medium text-gray-700">Recurring Event</label>
            </div>

            {recurring && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Recurrence Interval
                  </label>
                  <select
                    value={recurrenceInterval}
                    onChange={(e) => setRecurrenceInterval(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {recurrenceOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Every X Intervals
                  </label>
                  <input
                    type="number"
                    value={recurrenceCount}
                    onChange={(e) =>
                      setRecurrenceCount(Math.max(1, parseInt(e.target.value) || 1))
                    }
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Custom Format (e.g., {`{y}y {d}d {h}h`})
              </label>
              <input
                type="text"
                value={customFormat}
                onChange={(e) => setCustomFormat(e.target.value)}
                placeholder="Leave blank for default"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Use: {`{y}`} (years), {`{mo}`} (months), {`{w}`} (weeks), {`{d}`} (days), {`{h}`}
                (hours), {`{m}`} (minutes), {`{s}`} (seconds), {`{ms}`} (milliseconds)
              </p>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={countdown}
                  onChange={(e) => setCountdown(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-700">Live Countdown</span>
              </label>
              {countdown && (
                <button
                  onClick={() => setIsPaused((prev) => !prev)}
                  className="flex items-center px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  {isPaused ? <FaPlay className="mr-1" /> : <FaPause className="mr-1" />}
                  {isPaused ? "Resume" : "Pause"}
                </button>
              )}
            </div>
          </div>

          {/* Results Section */}
          {Object.keys(timeRemaining).length > 0 && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
                <FaClock className="mr-2" /> Time Remaining
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                <p>Years: {timeRemaining.years}</p>
                <p>Months: {timeRemaining.months}</p>
                <p>Weeks: {timeRemaining.weeks}</p>
                <p>Days: {timeRemaining.days}</p>
                <p>Hours: {timeRemaining.hours}</p>
                <p>Minutes: {timeRemaining.minutes}</p>
                <p>Seconds: {timeRemaining.seconds}</p>
                <p>Ms: {timeRemaining.milliseconds}</p>
                <p className="col-span-2 sm:col-span-4 font-medium">
                  Formatted: {timeRemaining.formatted}
                </p>
              </div>
            </div>
          )}

          {/* Error Section */}
          {error && (
            <div className="p-4 bg-red-50 rounded-lg text-red-700">
              <p>{error}</p>
            </div>
          )}

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={reset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>

          {/* Features Section */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Calculate time until a future date</li>
              <li>Support for multiple units and custom formatting</li>
              <li>Time zone selection</li>
              <li>Recurring events with customizable intervals</li>
              <li>Live countdown with pause/resume</li>
              <li>Quick-set buttons (+5 min, +1 hr)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeUntilCalculator;