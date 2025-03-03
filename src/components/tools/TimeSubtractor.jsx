'use client';

import React, { useState } from 'react';

const TimeSubtractor = () => {
  const [startTime, setStartTime] = useState(new Date().toISOString().slice(0, 16));
  const [subtractValue, setSubtractValue] = useState('');
  const [subtractUnit, setSubtractUnit] = useState('minutes');
  const [timeZone, setTimeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Time units and their conversion to milliseconds
  const timeUnits = {
    seconds: 1000,
    minutes: 60 * 1000,
    hours: 60 * 60 * 1000,
    days: 24 * 60 * 60 * 1000,
    weeks: 7 * 24 * 60 * 60 * 1000,
    months: 30 * 24 * 60 * 60 * 1000, // Approximate
    years: 365 * 24 * 60 * 60 * 1000, // Approximate, ignoring leap years
  };

  // Available time zones
  const timeZones = Intl.supportedValuesOf('timeZone');

  const subtractTime = () => {
    setError('');
    setResult(null);

    if (!subtractValue || isNaN(subtractValue)) {
      setError('Please enter a valid numeric value to subtract');
      return;
    }

    try {
      const startDate = new Date(startTime);
      if (isNaN(startDate.getTime())) {
        throw new Error('Invalid start time');
      }

      const subtractMs = parseFloat(subtractValue) * timeUnits[subtractUnit];
      const resultDate = new Date(startDate.getTime() - subtractMs);

      const options = {
        timeZone,
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
        timeZoneName: 'short',
      };

      const formattedResult = new Intl.DateTimeFormat('en-US', options).format(resultDate);
      const isoResult = resultDate.toISOString();

      setResult({
        humanReadable: formattedResult,
        iso: isoResult,
        timestamp: resultDate.getTime(),
      });
    } catch (err) {
      setError(`Error: ${err.message}`);
    }
  };

  const handleNow = () => {
    setStartTime(new Date().toISOString().slice(0, 16));
    subtractTime();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Time Subtractor
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time
              </label>
              <div className="flex gap-2">
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => {
                    setStartTime(e.target.value);
                    subtractTime();
                  }}
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

            <div className="grid gap-2 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subtract Amount
                </label>
                <input
                  type="number"
                  value={subtractValue}
                  onChange={(e) => {
                    setSubtractValue(e.target.value);
                    subtractTime();
                  }}
                  placeholder="Enter value"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unit
                </label>
                <select
                  value={subtractUnit}
                  onChange={(e) => {
                    setSubtractUnit(e.target.value);
                    subtractTime();
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.keys(timeUnits).map((unit) => (
                    <option key={unit} value={unit}>
                      {unit.charAt(0).toUpperCase() + unit.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time Zone
              </label>
              <select
                value={timeZone}
                onChange={(e) => {
                  setTimeZone(e.target.value);
                  subtractTime();
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {timeZones.map((tz) => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Section */}
          {result && (
            <div className="p-4 bg-gray-50 rounded-md">
              <h2 className="text-lg font-semibold mb-2">Result:</h2>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium">Human-Readable:</span> {result.humanReadable}
                </p>
                <p>
                  <span className="font-medium">ISO 8601:</span> {result.iso}
                </p>
                <p>
                  <span className="font-medium">Unix Timestamp:</span> {result.timestamp}
                </p>
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
              <li>Subtract time from a given timestamp</li>
              <li>Supports multiple units (seconds to years)</li>
              <li>Time zone adjustments</li>
              <li>Outputs in human-readable, ISO 8601, and Unix timestamp formats</li>
              <li>Use "Now" for current time</li>
              <li>Real-time updates as inputs change</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default TimeSubtractor;