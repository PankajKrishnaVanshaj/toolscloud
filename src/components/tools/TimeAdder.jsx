'use client';

import React, { useState } from 'react';

const TimeAdder = () => {
  const [baseTime, setBaseTime] = useState(new Date().toISOString().slice(0, 16));
  const [duration, setDuration] = useState('');
  const [unit, setUnit] = useState('minutes');
  const [operation, setOperation] = useState('add');
  const [timeZone, setTimeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [result, setResult] = useState('');
  const [history, setHistory] = useState([]);
  const [formatOptions, setFormatOptions] = useState({
    date: true,
    time: true,
    seconds: true,
    timeZoneName: 'short',
  });

  // Supported units
  const units = {
    seconds: 1000,
    minutes: 1000 * 60,
    hours: 1000 * 60 * 60,
    days: 1000 * 60 * 60 * 24,
    weeks: 1000 * 60 * 60 * 24 * 7,
    months: 1000 * 60 * 60 * 24 * 30, // Approximate
    years: 1000 * 60 * 60 * 24 * 365, // Approximate
  };

  // Time zones
  const timeZones = Intl.supportedValuesOf('timeZone');

  const calculateResult = () => {
    if (!duration || isNaN(duration)) {
      setResult('Please enter a valid duration');
      return;
    }

    const baseDate = new Date(baseTime);
    if (isNaN(baseDate.getTime())) {
      setResult('Invalid base time');
      return;
    }

    const milliseconds = parseFloat(duration) * units[unit];
    const newTime = new Date(baseDate.getTime() + (operation === 'add' ? milliseconds : -milliseconds));

    const options = {
      timeZone,
      year: formatOptions.date ? 'numeric' : undefined,
      month: formatOptions.date ? 'long' : undefined,
      day: formatOptions.date ? 'numeric' : undefined,
      hour: formatOptions.time ? '2-digit' : undefined,
      minute: formatOptions.time ? '2-digit' : undefined,
      second: formatOptions.seconds ? '2-digit' : undefined,
      timeZoneName: formatOptions.timeZoneName !== 'none' ? formatOptions.timeZoneName : undefined,
      hour12: true,
    };

    const formattedResult = new Intl.DateTimeFormat('en-US', options).format(newTime);
    setResult(formattedResult);
    
    setHistory(prev => [
      ...prev,
      {
        baseTime: baseDate.toISOString(),
        duration: `${operation === 'add' ? '+' : '-'}${duration} ${unit}`,
        result: formattedResult,
        timestamp: new Date().toISOString(),
      }
    ].slice(-10)); // Keep last 10 entries
  };

  const handleNow = () => {
    setBaseTime(new Date().toISOString().slice(0, 16));
    calculateResult();
  };

  const handleFormatChange = (key, value) => {
    setFormatOptions(prev => {
      const newOptions = { ...prev, [key]: value };
      if (result) calculateResult(); // Recalculate with new format
      return newOptions;
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Time Adder
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4">
            <div className="grid gap-2">
              <label className="block text-sm font-medium text-gray-700">
                Base Time
              </label>
              <div className="flex gap-2">
                <input
                  type="datetime-local"
                  value={baseTime}
                  onChange={(e) => setBaseTime(e.target.value)}
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

            <div className="grid gap-2 md:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Duration
                </label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g., 5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Unit
                </label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.keys(units).map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Operation
                </label>
                <select
                  value={operation}
                  onChange={(e) => setOperation(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="add">Add</option>
                  <option value="subtract">Subtract</option>
                </select>
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

            <button
              onClick={calculateResult}
              className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              Calculate
            </button>
          </div>

          {/* Format Options */}
          <div className="p-4 bg-gray-50 rounded-md">
            <h2 className="text-lg font-semibold mb-2">Format Options</h2>
            <div className="grid gap-2 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formatOptions.date}
                  onChange={(e) => handleFormatChange('date', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                Include Date
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formatOptions.time}
                  onChange={(e) => handleFormatChange('time', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                Include Time
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formatOptions.seconds}
                  onChange={(e) => handleFormatChange('seconds', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                Include Seconds
              </label>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Time Zone Display:</label>
                <select
                  value={formatOptions.timeZoneName}
                  onChange={(e) => handleFormatChange('timeZoneName', e.target.value)}
                  className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="none">None</option>
                  <option value="short">Short (e.g., EST)</option>
                  <option value="long">Long (e.g., Eastern Standard Time)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Result Section */}
          {result && (
            <div className="p-4 bg-gray-50 rounded-md">
              <h2 className="text-lg font-semibold mb-2">Result:</h2>
              <p className="text-sm">{result}</p>
            </div>
          )}

          {/* History Section */}
          {history.length > 0 && (
            <div className="p-4 bg-gray-50 rounded-md">
              <h2 className="text-lg font-semibold mb-2">Calculation History (Last 10):</h2>
              <div className="space-y-2 text-sm max-h-40 overflow-auto">
                {history.map((entry, index) => (
                  <div key={index} className="p-2 bg-gray-100 rounded">
                    <p>{entry.timestamp}: {entry.baseTime} {entry.duration} = {entry.result}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-6 text-sm text-gray-600">
          <details>
            <summary className="cursor-pointer font-medium">Features & Usage</summary>
            <ul className="list-disc list-inside mt-2">
              <li>Add or subtract time from a base date/time</li>
              <li>Supports multiple units (seconds to years)</li>
              <li>Time zone adjustments</li>
              <li>Customizable output format</li>
              <li>History of last 10 calculations</li>
              <li>Use "Now" for current time</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default TimeAdder;