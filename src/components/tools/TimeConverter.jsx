'use client';

import React, { useState } from 'react';

const TimeConverter = () => {
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState('s');
  const [elapsedDays, setElapsedDays] = useState('');
  const [sourceTimezone, setSourceTimezone] = useState('UTC');
  const [targetTimezone, setTargetTimezone] = useState('UTC');

  // Conversion factors to seconds (s)
  const conversionFactors = {
    s: 1,           // Seconds
    ms: 1e-3,       // Milliseconds
    μs: 1e-6,       // Microseconds
    ns: 1e-9,       // Nanoseconds
    min: 60,        // Minutes
    h: 3600,        // Hours
    d: 86400,       // Days
    w: 604800,      // Weeks
    y: 31536000,    // Years (assuming 365 days)
    decade: 315360000, // Decades
    century: 3153600000 // Centuries
  };

  // Display names for units
  const unitDisplayNames = {
    s: 's',
    ms: 'ms',
    μs: 'μs',
    ns: 'ns',
    min: 'min',
    h: 'h',
    d: 'd',
    w: 'w',
    y: 'y',
    decade: 'decade',
    century: 'century'
  };

  // Common time zones with offsets from UTC in hours
  const timezones = {
    'UTC': 0,
    'EST': -5,    // Eastern Standard Time
    'EDT': -4,    // Eastern Daylight Time
    'CST': -6,    // Central Standard Time
    'CDT': -5,    // Central Daylight Time
    'MST': -7,    // Mountain Standard Time
    'MDT': -6,    // Mountain Daylight Time
    'PST': -8,    // Pacific Standard Time
    'PDT': -7,    // Pacific Daylight Time
    'GMT': 0      // Greenwich Mean Time
  };

  const convertValue = (inputValue, fromUnit) => {
    if (!inputValue || isNaN(inputValue)) return {};
    const valueInSeconds = inputValue * conversionFactors[fromUnit];
    
    return Object.keys(conversionFactors).reduce((acc, unit) => {
      acc[unit] = valueInSeconds / conversionFactors[unit];
      return acc;
    }, {});
  };

  const calculateElapsedTime = () => {
    if (!value || !elapsedDays || isNaN(value) || isNaN(elapsedDays)) return null;
    const initialSeconds = value * conversionFactors[unit];
    const elapsedSeconds = elapsedDays * conversionFactors.d;
    return initialSeconds + elapsedSeconds;
  };

  const convertTimezone = () => {
    if (!value || isNaN(value)) return null;
    const seconds = value * conversionFactors[unit];
    const offsetDiff = (timezones[targetTimezone] - timezones[sourceTimezone]) * 3600;
    return seconds + offsetDiff;
  };

  const results = convertValue(value, unit);
  const elapsedTime = calculateElapsedTime();
  const timezoneConverted = convertTimezone();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Time Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time Value
              </label>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Enter value"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.keys(conversionFactors).map((u) => (
                  <option key={u} value={u}>{unitDisplayNames[u]}</option>
                ))}
              </select>
            </div>

            {/* Elapsed Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Elapsed Days
              </label>
              <input
                type="number"
                value={elapsedDays}
                onChange={(e) => setElapsedDays(e.target.value)}
                placeholder="Enter days"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Timezone Conversion */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Timezone Conversion
              </label>
              <div className="flex gap-2">
                <select
                  value={sourceTimezone}
                  onChange={(e) => setSourceTimezone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.keys(timezones).map((tz) => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
                <span className="self-center">to</span>
                <select
                  value={targetTimezone}
                  onChange={(e) => setTargetTimezone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.keys(timezones).map((tz) => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Results Section */}
          {value && (
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 bg-gray-50 rounded-md">
                <h2 className="text-lg font-semibold mb-2">Conversions:</h2>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(results).map(([unit, val]) => (
                    <p key={unit}>{unitDisplayNames[unit]}: {val.toExponential(4)}</p>
                  ))}
                </div>
              </div>

              {elapsedTime && (
                <div className="p-4 bg-blue-50 rounded-md">
                  <h2 className="text-lg font-semibold mb-2">After Elapsed Time:</h2>
                  <p>s: {elapsedTime.toExponential(4)}</p>
                  <p>d: {(elapsedTime / conversionFactors.d).toExponential(4)}</p>
                  <p className="mt-2 text-sm text-gray-600">
                    Initial + {elapsedDays} days
                  </p>
                </div>
              )}

              {timezoneConverted && (
                <div className="p-4 bg-green-50 rounded-md">
                  <h2 className="text-lg font-semibold mb-2">Timezone Result:</h2>
                  <p>s: {timezoneConverted.toExponential(4)}</p>
                  <p>h: {(timezoneConverted / conversionFactors.h).toExponential(4)}</p>
                  <p className="mt-2 text-sm text-gray-600">
                    Offset: {timezones[targetTimezone] - timezones[sourceTimezone]}h
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-6 text-sm text-gray-600">
          <details>
            <summary className="cursor-pointer font-medium">Conversion References</summary>
            <ul className="list-disc list-inside mt-2">
              <li>1 min = 60 s</li>
              <li>1 h = 3600 s</li>
              <li>1 d = 86400 s</li>
              <li>1 y = 31,536,000 s (365 days)</li>
              <li>1 century = 3,153,600,000 s</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default TimeConverter;