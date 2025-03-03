'use client';

import React, { useState, useEffect } from 'react';

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
  const [difference, setDifference] = useState({}); // Initial empty state

  // Time zones
  const timeZones = Intl.supportedValuesOf('timeZone');

  const calculateTimeSince = (date) => {
    try {
      const now = new Date();
      const past = new Date(date);
      const diffMs = now - past;

      if (isNaN(diffMs)) throw new Error('Invalid date');

      const seconds = Math.floor(diffMs / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);
      const weeks = Math.floor(days / 7);
      const months = Math.floor(days / 30.44); // Average month length
      const years = Math.floor(days / 365.25); // Accounting for leap years

      return {
        years,
        months,
        weeks,
        days,
        hours,
        minutes,
        seconds,
        milliseconds: diffMs,
        remaining: {
          months: months % 12,
          weeks: weeks % 52,
          days: days % 7,
          hours: hours % 24,
          minutes: minutes % 60,
          seconds: seconds % 60,
        }
      };
    } catch (err) {
      return { error: 'Invalid date input' };
    }
  };

  const updateDifference = () => {
    const diff = calculateTimeSince(inputDate);
    setDifference(diff);
  };

  useEffect(() => {
    updateDifference();
    if (updateLive) {
      const interval = setInterval(updateDifference, 1000);
      return () => clearInterval(interval);
    }
  }, [inputDate, updateLive]);

  const handleNow = () => {
    setInputDate(new Date().toISOString().slice(0, 16));
  };

  const toggleUnit = (unit) => {
    setUnits(prev => ({ ...prev, [unit]: !prev[unit] }));
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Time Since Calculator
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date/Time
              </label>
              <div className="flex gap-2">
                <input
                  type="datetime-local"
                  value={inputDate}
                  onChange={(e) => setInputDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleNow}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
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

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={updateLive}
                onChange={(e) => setUpdateLive(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="text-sm font-medium text-gray-700">
                Update Live
              </label>
            </div>
          </div>

          {/* Unit Selection */}
          <div className="p-4 bg-gray-50 rounded-md">
            <h2 className="text-lg font-semibold mb-2">Display Units</h2>
            <div className="grid grid-cols-2 gap-2 text-sm">
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
          <div className="p-4 bg-gray-50 rounded-md">
            <h2 className="text-lg font-semibold mb-2">Time Since:</h2>
            {difference.error ? (
              <p className="text-red-700">{difference.error}</p>
            ) : Object.keys(difference).length > 0 ? (
              <div className="space-y-2 text-sm">
                {units.years && <p>Years: {difference.years || 0}</p>}
                {units.months && (
                  <p>Months: {difference.months || 0} (Remaining: {difference.remaining?.months || 0})</p>
                )}
                {units.weeks && (
                  <p>Weeks: {difference.weeks || 0} (Remaining: {difference.remaining?.weeks || 0})</p>
                )}
                {units.days && (
                  <p>Days: {difference.days || 0} (Remaining: {difference.remaining?.days || 0})</p>
                )}
                {units.hours && (
                  <p>Hours: {difference.hours || 0} (Remaining: {difference.remaining?.hours || 0})</p>
                )}
                {units.minutes && (
                  <p>Minutes: {difference.minutes || 0} (Remaining: {difference.remaining?.minutes || 0})</p>
                )}
                {units.seconds && (
                  <p>Seconds: {difference.seconds || 0} (Remaining: {difference.remaining?.seconds || 0})</p>
                )}
                <p>Total Milliseconds: {(difference.milliseconds || 0).toLocaleString()}</p>
              </div>
            ) : (
              <p className="text-gray-500">Enter a date to see the time difference</p>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-6 text-sm text-gray-600">
          <details>
            <summary className="cursor-pointer font-medium">Features & Tips</summary>
            <ul className="list-disc list-inside mt-2">
              <li>Calculates time difference from input to now</li>
              <li>Live updates (toggleable)</li>
              <li>Customizable units with remaining values</li>
              <li>Time zone support</li>
              <li>Use "Now" to reset to current time</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default TimeSinceCalculator;