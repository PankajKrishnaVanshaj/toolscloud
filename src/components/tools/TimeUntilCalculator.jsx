'use client';

import React, { useState, useEffect } from 'react';

const TimeUntilCalculator = () => {
  const [targetTime, setTargetTime] = useState('');
  const [timeZone, setTimeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [recurring, setRecurring] = useState(false);
  const [recurrenceInterval, setRecurrenceInterval] = useState('day');
  const [recurrenceCount, setRecurrenceCount] = useState(1);
  const [timeRemaining, setTimeRemaining] = useState({});
  const [countdown, setCountdown] = useState(false);
  const [error, setError] = useState('');

  // Time zones
  const timeZones = Intl.supportedValuesOf('timeZone');

  // Recurrence options
  const recurrenceOptions = ['second', 'minute', 'hour', 'day', 'week', 'month', 'year'];

  const calculateTimeUntil = (target) => {
    const now = new Date();
    let targetDate = new Date(target);

    if (isNaN(targetDate.getTime())) {
      setError('Invalid date/time');
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
      setError('Target time is in the past');
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
      formatted: `${years > 0 ? `${years}y ` : ''}${months % 12 > 0 ? `${months % 12}m ` : ''}${days % 30 > 0 ? `${days % 30}d ` : ''}${hours % 24}h ${minutes % 60}m ${seconds % 60}s`,
    };
  };

  const updateTime = () => {
    if (!targetTime) {
      setTimeRemaining({});
      setError('');
      return;
    }

    const result = calculateTimeUntil(targetTime);
    setTimeRemaining(result);
    setError(Object.keys(result).length === 0 ? error : '');
  };

  useEffect(() => {
    updateTime();
    if (countdown) {
      const interval = setInterval(updateTime, 1000);
      return () => clearInterval(interval);
    }
  }, [targetTime, timeZone, recurring, recurrenceInterval, recurrenceCount, countdown]);

  const handleNow = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5); // Default to 5 minutes from now
    setTargetTime(now.toISOString().slice(0, 16));
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Time Until Calculator
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Date/Time
              </label>
              <div className="flex gap-2">
                <input
                  type="datetime-local"
                  value={targetTime}
                  onChange={(e) => setTargetTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleNow}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  +5 min
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

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={recurring}
                onChange={(e) => setRecurring(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="text-sm font-medium text-gray-700">
                Recurring Event
              </label>
            </div>

            {recurring && (
              <div className="grid gap-4 md:grid-cols-2">
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
                      <option key={option} value={option}>{option}</option>
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
                    onChange={(e) => setRecurrenceCount(Math.max(1, parseInt(e.target.value) || 1))}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={countdown}
                onChange={(e) => setCountdown(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="text-sm font-medium text-gray-700">
                Live Countdown
              </label>
            </div>
          </div>

          {/* Results Section */}
          {Object.keys(timeRemaining).length > 0 && (
            <div className="p-4 bg-gray-50 rounded-md">
              <h2 className="text-lg font-semibold mb-2">Time Remaining:</h2>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <p>Years: {timeRemaining.years}</p>
                <p>Months: {timeRemaining.months}</p>
                <p>Weeks: {timeRemaining.weeks}</p>
                <p>Days: {timeRemaining.days}</p>
                <p>Hours: {timeRemaining.hours}</p>
                <p>Minutes: {timeRemaining.minutes}</p>
                <p>Seconds: {timeRemaining.seconds}</p>
                <p>Milliseconds: {timeRemaining.milliseconds}</p>
                <p className="col-span-2">Formatted: {timeRemaining.formatted}</p>
              </div>
            </div>
          )}

          {/* Error Section */}
          {error && (
            <div className="p-4 bg-red-50 rounded-md text-red-700">
              <p>{error}</p>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-6 text-sm text-gray-600">
          <details>
            <summary className="cursor-pointer font-medium">Features & Usage</summary>
            <ul className="list-disc list-inside mt-2">
              <li>Calculates time until a future date</li>
              <li>Supports multiple units (years to milliseconds)</li>
              <li>Time zone adjustments</li>
              <li>Recurring event support (e.g., every 2 weeks)</li>
              <li>Live countdown option</li>
              <li>Use "+5 min" for quick future time</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default TimeUntilCalculator;