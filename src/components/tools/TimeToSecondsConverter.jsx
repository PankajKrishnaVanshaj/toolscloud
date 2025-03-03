'use client';

import React, { useState } from 'react';

const TimeToSecondsConverter = () => {
  const [timeInput, setTimeInput] = useState('');
  const [seconds, setSeconds] = useState('');
  const [error, setError] = useState('');
  const [format, setFormat] = useState('short'); // 'short' (h/m/s) or 'long' (hours/minutes/seconds)
  const [includeDays, setIncludeDays] = useState(false);

  // Regular expressions for parsing time formats
  const timePatterns = {
    short: /(\d+\.?\d*)\s*(d|h|m|s)/gi,
    long: /(\d+\.?\d*)\s*(days?|hours?|minutes?|seconds?)/gi,
  };

  const conversionFactors = {
    d: 86400,  // days
    h: 3600,   // hours
    m: 60,     // minutes
    s: 1,      // seconds
  };

  const convertToSeconds = (input) => {
    setError('');
    if (!input.trim()) {
      setSeconds('');
      return;
    }

    const pattern = timePatterns[format];
    let totalSeconds = 0;
    let match;

    while ((match = pattern.exec(input)) !== null) {
      const value = parseFloat(match[1]);
      const unit = format === 'short' ? match[2].toLowerCase() : 
                   match[2].toLowerCase().startsWith('d') ? 'd' :
                   match[2].toLowerCase().startsWith('h') ? 'h' :
                   match[2].toLowerCase().startsWith('m') ? 'm' : 's';

      if (!includeDays && unit === 'd') {
        setError('Days not allowed unless "Include Days" is enabled');
        setSeconds('');
        return;
      }

      totalSeconds += value * conversionFactors[unit];
    }

    if (totalSeconds === 0 && input.trim()) {
      setError('Invalid time format. Use e.g., "1h 30m 15s" or "1 hour 30 minutes"');
      setSeconds('');
      return;
    }

    setSeconds(totalSeconds.toString());
  };

  const convertFromSeconds = (input) => {
    setError('');
    if (!input || isNaN(input)) {
      setTimeInput('');
      return;
    }

    const totalSeconds = parseFloat(input);
    if (totalSeconds < 0) {
      setError('Seconds cannot be negative');
      setTimeInput('');
      return;
    }

    let remainingSeconds = totalSeconds;
    const parts = [];

    if (includeDays) {
      const days = Math.floor(remainingSeconds / conversionFactors.d);
      if (days > 0) {
        parts.push(`${days}${format === 'short' ? 'd' : ' days'}`);
        remainingSeconds %= conversionFactors.d;
      }
    }

    const hours = Math.floor(remainingSeconds / conversionFactors.h);
    if (hours > 0) {
      parts.push(`${hours}${format === 'short' ? 'h' : ' hours'}`);
      remainingSeconds %= conversionFactors.h;
    }

    const minutes = Math.floor(remainingSeconds / conversionFactors.m);
    if (minutes > 0) {
      parts.push(`${minutes}${format === 'short' ? 'm' : ' minutes'}`);
      remainingSeconds %= conversionFactors.m;
    }

    if (remainingSeconds > 0 || parts.length === 0) {
      parts.push(`${remainingSeconds}${format === 'short' ? 's' : ' seconds'}`);
    }

    setTimeInput(parts.join(' '));
  };

  const handleTimeInput = (value) => {
    setTimeInput(value);
    convertToSeconds(value);
  };

  const handleSecondsInput = (value) => {
    setSeconds(value);
    convertFromSeconds(value);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Time to Seconds Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4">
            <div className="grid gap-2">
              <label className="block text-sm font-medium text-gray-700">
                Time Format
              </label>
              <input
                type="text"
                value={timeInput}
                onChange={(e) => handleTimeInput(e.target.value)}
                placeholder={format === 'short' ? 'e.g., 1d 2h 30m 15s' : 'e.g., 1 day 2 hours 30 minutes 15 seconds'}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid gap-2">
              <label className="block text-sm font-medium text-gray-700">
                Total Seconds
              </label>
              <input
                type="number"
                value={seconds}
                onChange={(e) => handleSecondsInput(e.target.value)}
                placeholder="e.g., 9015"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid gap-2 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Input Format
                </label>
                <select
                  value={format}
                  onChange={(e) => {
                    setFormat(e.target.value);
                    convertToSeconds(timeInput);
                    convertFromSeconds(seconds);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="short">Short (e.g., 1h 30m)</option>
                  <option value="long">Long (e.g., 1 hour 30 minutes)</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={includeDays}
                  onChange={(e) => {
                    setIncludeDays(e.target.checked);
                    convertToSeconds(timeInput);
                    convertFromSeconds(seconds);
                  }}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="text-sm font-medium text-gray-700">
                  Include Days
                </label>
              </div>
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
              <li>Convert time (e.g., "1h 30m 15s") to total seconds</li>
              <li>Reverse convert seconds to time format</li>
              <li>Supports short (h/m/s) and long (hours/minutes/seconds) formats</li>
              <li>Optional days support (d or days)</li>
              <li>Handles decimal values (e.g., 1.5h)</li>
              <li>Real-time bidirectional conversion</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default TimeToSecondsConverter;