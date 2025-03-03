'use client';

import React, { useState } from 'react';

const TimeRoundingTool = () => {
  const [inputTime, setInputTime] = useState(new Date().toISOString().slice(0, 16));
  const [timeZone, setTimeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [interval, setInterval] = useState('15'); // minutes
  const [direction, setDirection] = useState('nearest');
  const [outputFormat, setOutputFormat] = useState('iso');
  const [roundedTime, setRoundedTime] = useState('');
  const [error, setError] = useState('');

  // Time zones
  const timeZones = Intl.supportedValuesOf('timeZone');

  // Rounding intervals (in minutes)
  const intervals = ['1', '5', '10', '15', '30', '60'];

  // Rounding directions
  const directions = ['nearest', 'up', 'down'];

  // Output formats
  const formats = {
    iso: 'ISO 8601',
    human: 'Human-Readable',
    timestamp: 'Unix Timestamp',
  };

  const roundTime = (date, intervalMinutes, direction) => {
    const msPerMinute = 60 * 1000;
    const intervalMs = intervalMinutes * msPerMinute;
    const timeMs = date.getTime();

    switch (direction) {
      case 'nearest':
        return new Date(Math.round(timeMs / intervalMs) * intervalMs);
      case 'up':
        return new Date(Math.ceil(timeMs / intervalMs) * intervalMs);
      case 'down':
        return new Date(Math.floor(timeMs / intervalMs) * intervalMs);
      default:
        return date;
    }
  };

  const formatOutput = (date) => {
    switch (outputFormat) {
      case 'iso':
        return date.toISOString();
      case 'human':
        return new Intl.DateTimeFormat('en-US', {
          timeZone,
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        }).format(date);
      case 'timestamp':
        return Math.floor(date.getTime() / 1000).toString();
      default:
        return date.toISOString();
    }
  };

  const handleInputChange = (value) => {
    setInputTime(value);
    setError('');
    try {
      const date = new Date(value);
      if (isNaN(date.getTime())) throw new Error('Invalid date');
      const rounded = roundTime(date, parseInt(interval), direction);
      setRoundedTime(formatOutput(rounded));
    } catch (err) {
      setError(`Invalid time input: ${err.message}`);
      setRoundedTime('');
    }
  };

  const handleNow = () => {
    const now = new Date();
    setInputTime(now.toISOString().slice(0, 16));
    const rounded = roundTime(now, parseInt(interval), direction);
    setRoundedTime(formatOutput(rounded));
    setError('');
  };

  const updateRoundedTime = () => {
    try {
      const date = new Date(inputTime);
      if (isNaN(date.getTime())) throw new Error('Invalid date');
      const rounded = roundTime(date, parseInt(interval), direction);
      setRoundedTime(formatOutput(rounded));
    } catch (err) {
      setError(`Invalid time input: ${err.message}`);
      setRoundedTime('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Time Rounding Tool
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Input Time
              </label>
              <div className="flex gap-2">
                <input
                  type="datetime-local"
                  value={inputTime}
                  onChange={(e) => handleInputChange(e.target.value)}
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

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time Zone
                </label>
                <select
                  value={timeZone}
                  onChange={(e) => {
                    setTimeZone(e.target.value);
                    updateRoundedTime();
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {timeZones.map((tz) => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rounding Interval (minutes)
                </label>
                <select
                  value={interval}
                  onChange={(e) => {
                    setInterval(e.target.value);
                    updateRoundedTime();
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {intervals.map((int) => (
                    <option key={int} value={int}>{int}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rounding Direction
                </label>
                <select
                  value={direction}
                  onChange={(e) => {
                    setDirection(e.target.value);
                    updateRoundedTime();
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {directions.map((dir) => (
                    <option key={dir} value={dir}>
                      {dir.charAt(0).toUpperCase() + dir.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Output Format
                </label>
                <select
                  value={outputFormat}
                  onChange={(e) => {
                    setOutputFormat(e.target.value);
                    updateRoundedTime();
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(formats).map(([key, value]) => (
                    <option key={key} value={key}>{value}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="p-4 bg-gray-50 rounded-md">
            <h2 className="text-lg font-semibold mb-2">Rounded Time:</h2>
            <p className="text-sm">
              {roundedTime || 'Enter a valid time to see the result'}
            </p>
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
              <li>Rounds time to specified intervals (1-60 minutes)</li>
              <li>Supports Nearest, Up, and Down rounding</li>
              <li>Output in ISO 8601, human-readable, or Unix timestamp</li>
              <li>Time zone adjustments</li>
              <li>Use "Now" for current time</li>
              <li>Example: 14:07 → 14:15 (15-min interval, up)</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default TimeRoundingTool;