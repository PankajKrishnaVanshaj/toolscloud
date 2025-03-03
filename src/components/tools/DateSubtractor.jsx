'use client';

import React, { useState, useEffect } from 'react';

const DateSubtractor = () => {
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 16));
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 16));
  const [timeZone, setTimeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [unit, setUnit] = useState('days');
  const [includeTime, setIncludeTime] = useState(true);
  const [result, setResult] = useState({ value: 0, formatted: '' });
  const [error, setError] = useState('');

  // Supported units
  const units = [
    { value: 'years', label: 'Years' },
    { value: 'months', label: 'Months' },
    { value: 'weeks', label: 'Weeks' },
    { value: 'days', label: 'Days' },
    { value: 'hours', label: 'Hours' },
    { value: 'minutes', label: 'Minutes' },
    { value: 'seconds', label: 'Seconds' },
  ];

  // Time zones
  const timeZones = Intl.supportedValuesOf('timeZone');

  const calculateDifference = () => {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new Error('Invalid date input');
      }

      // Adjust for time zone
      const startAdjusted = new Date(start.toLocaleString('en-US', { timeZone }));
      const endAdjusted = new Date(end.toLocaleString('en-US', { timeZone }));

      // If not including time, reset to midnight
      if (!includeTime) {
        startAdjusted.setHours(0, 0, 0, 0);
        endAdjusted.setHours(0, 0, 0, 0);
      }

      const diffMs = endAdjusted - startAdjusted;

      let value;
      let formatted;

      switch (unit) {
        case 'years':
          value = diffMs / (1000 * 60 * 60 * 24 * 365.25); // Accounting for leap years
          formatted = `${value.toFixed(2)} years`;
          break;
        case 'months':
          value = diffMs / (1000 * 60 * 60 * 24 * 30.44); // Average month length
          formatted = `${value.toFixed(2)} months`;
          break;
        case 'weeks':
          value = diffMs / (1000 * 60 * 60 * 24 * 7);
          formatted = `${value.toFixed(2)} weeks`;
          break;
        case 'days':
          value = diffMs / (1000 * 60 * 60 * 24);
          formatted = `${value.toFixed(2)} days`;
          break;
        case 'hours':
          value = diffMs / (1000 * 60 * 60);
          formatted = `${value.toFixed(2)} hours`;
          break;
        case 'minutes':
          value = diffMs / (1000 * 60);
          formatted = `${value.toFixed(2)} minutes`;
          break;
        case 'seconds':
          value = diffMs / 1000;
          formatted = `${value.toFixed(2)} seconds`;
          break;
        default:
          value = 0;
          formatted = 'Unknown unit';
      }

      setResult({ value, formatted });
      setError('');
    } catch (err) {
      setResult({ value: 0, formatted: '' });
      setError(`Error: ${err.message}`);
    }
  };

  useEffect(() => {
    calculateDifference();
  }, [startDate, endDate, timeZone, unit, includeTime]);

  const handleNow = (setter) => {
    setter(new Date().toISOString().slice(0, 16));
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Date Subtractor
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4">
            <div className="grid gap-2">
              <label className="block text-sm font-medium text-gray-700">
                Start Date/Time
              </label>
              <div className="flex gap-2">
                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => handleNow(setStartDate)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Now
                </button>
              </div>
            </div>

            <div className="grid gap-2">
              <label className="block text-sm font-medium text-gray-700">
                End Date/Time
              </label>
              <div className="flex gap-2">
                <input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => handleNow(setEndDate)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Now
                </button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unit
                </label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {units.map((u) => (
                    <option key={u.value} value={u.value}>{u.label}</option>
                  ))}
                </select>
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
          </div>

          {/* Results Section */}
          <div className="p-4 bg-gray-50 rounded-md">
            <h2 className="text-lg font-semibold mb-2">Difference:</h2>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium">Result:</span> {result.formatted}
              </p>
              <p>
                <span className="font-medium">Raw Value:</span> {result.value.toLocaleString()}
              </p>
            </div>
          </div>

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
              <li>Calculate difference between two dates</li>
              <li>Supports multiple units (years, months, etc.)</li>
              <li>Time zone aware calculations</li>
              <li>Option to include/exclude time</li>
              <li>Use "Now" buttons for current date/time</li>
              <li>Real-time updates as inputs change</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default DateSubtractor;