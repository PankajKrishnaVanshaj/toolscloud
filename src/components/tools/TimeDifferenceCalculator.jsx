'use client';

import React, { useState, useEffect } from 'react';

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
  const [error, setError] = useState('');

  // Time zones
  const timeZones = Intl.supportedValuesOf('timeZone');

  const calculateDifference = () => {
    try {
      const start = new Date(new Date(startTime).toLocaleString('en-US', { timeZone: startZone }));
      const end = new Date(new Date(endTime).toLocaleString('en-US', { timeZone: endZone }));

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new Error('Invalid date/time input');
      }

      const diffMs = end - start;
      const diffSeconds = Math.floor(diffMs / 1000);
      const diffMinutes = Math.floor(diffSeconds / 60);
      const diffHours = Math.floor(diffMinutes / 60);
      const diffDays = Math.floor(diffHours / 24);
      const diffWeeks = Math.floor(diffDays / 7);
      const diffMonths = Math.floor(diffDays / 30.44); // Average month length
      const diffYears = Math.floor(diffDays / 365.25); // Accounting for leap years

      const result = {};
      if (units.years) result.years = diffYears;
      if (units.months) result.months = diffMonths;
      if (units.weeks) result.weeks = diffWeeks;
      if (units.days) result.days = diffDays;
      if (units.hours) result.hours = diffHours;
      if (units.minutes) result.minutes = diffMinutes;
      if (units.seconds) result.seconds = diffSeconds;

      setDifference(result);
      setError('');
    } catch (err) {
      setError(`Error: ${err.message}`);
      setDifference({});
    }
  };

  useEffect(() => {
    calculateDifference();
    if (liveUpdate) {
      const interval = setInterval(calculateDifference, 1000);
      return () => clearInterval(interval);
    }
  }, [startTime, endTime, startZone, endZone, units, liveUpdate]);

  const handleNow = (type) => {
    const now = new Date().toISOString().slice(0, 16);
    if (type === 'start') setStartTime(now);
    else setEndTime(now);
  };

  const toggleUnit = (unit) => {
    setUnits(prev => ({ ...prev, [unit]: !prev[unit] }));
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Time Difference Calculator
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4">
            <div className="grid gap-2 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date/Time
                </label>
                <div className="flex gap-2">
                  <input
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => handleNow('start')}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    Now
                  </button>
                </div>
                <select
                  value={startZone}
                  onChange={(e) => setStartZone(e.target.value)}
                  className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {timeZones.map((tz) => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date/Time
                </label>
                <div className="flex gap-2">
                  <input
                    type="datetime-local"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => handleNow('end')}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    Now
                  </button>
                </div>
                <select
                  value={endZone}
                  onChange={(e) => setEndZone(e.target.value)}
                  className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {timeZones.map((tz) => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={liveUpdate}
                onChange={(e) => setLiveUpdate(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="text-sm font-medium text-gray-700">
                Live Update
              </label>
            </div>
          </div>

          {/* Units Selection */}
          <div className="p-4 bg-gray-50 rounded-md">
            <h2 className="text-lg font-semibold mb-2">Display Units</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
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
          {Object.keys(difference).length > 0 && (
            <div className="p-4 bg-gray-50 rounded-md">
              <h2 className="text-lg font-semibold mb-2">Time Difference</h2>
              <div className="grid gap-1 text-sm">
                {Object.entries(difference).map(([unit, value]) => (
                  <p key={unit}>
                    <span className="font-medium">{unit.charAt(0).toUpperCase() + unit.slice(1)}:</span>{' '}
                    {value.toLocaleString()} {value === 1 ? unit.slice(0, -1) : unit}
                  </p>
                ))}
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
              <li>Calculate difference between two timestamps</li>
              <li>Supports all time zones</li>
              <li>Customizable output units</li>
              <li>Live updates (toggleable)</li>
              <li>Use "Now" buttons for current time</li>
              <li>Handles past and future dates</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default TimeDifferenceCalculator;