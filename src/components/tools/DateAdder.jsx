'use client';

import React, { useState } from 'react';

const DateAdder = () => {
  const [baseDate, setBaseDate] = useState(new Date().toISOString().slice(0, 16));
  const [interval, setInterval] = useState(0);
  const [unit, setUnit] = useState('days');
  const [timeZone, setTimeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [operation, setOperation] = useState('add');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [formatOptions, setFormatOptions] = useState({
    date: true,
    time: true,
    seconds: false,
    timeZoneName: 'short',
  });

  // Supported units
  const units = [
    'years',
    'months',
    'weeks',
    'days',
    'hours',
    'minutes',
    'seconds',
  ];

  // Time zones
  const timeZones = Intl.supportedValuesOf('timeZone');

  const calculateDate = () => {
    setError('');
    try {
      const date = new Date(baseDate);
      if (isNaN(date.getTime())) throw new Error('Invalid base date');

      const multiplier = operation === 'add' ? 1 : -1;
      const value = Number(interval) * multiplier;

      let resultDate = new Date(date);
      switch (unit) {
        case 'years':
          resultDate.setFullYear(date.getFullYear() + value);
          break;
        case 'months':
          resultDate.setMonth(date.getMonth() + value);
          break;
        case 'weeks':
          resultDate.setDate(date.getDate() + value * 7);
          break;
        case 'days':
          resultDate.setDate(date.getDate() + value);
          break;
        case 'hours':
          resultDate.setHours(date.getHours() + value);
          break;
        case 'minutes':
          resultDate.setMinutes(date.getMinutes() + value);
          break;
        case 'seconds':
          resultDate.setSeconds(date.getSeconds() + value);
          break;
        default:
          throw new Error('Invalid unit');
      }

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

      setResult(new Intl.DateTimeFormat('en-US', options).format(resultDate));
    } catch (err) {
      setError(`Error: ${err.message}`);
      setResult('');
    }
  };

  const handleCalculate = () => {
    calculateDate();
  };

  const handleNow = () => {
    setBaseDate(new Date().toISOString().slice(0, 16));
    calculateDate();
  };

  const handleFormatChange = (key, value) => {
    setFormatOptions(prev => {
      const newOptions = { ...prev, [key]: value };
      calculateDate();
      return newOptions;
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Date Adder/Subtractor
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4">
            <div className="grid gap-2">
              <label className="block text-sm font-medium text-gray-700">
                Base Date/Time
              </label>
              <div className="flex gap-2">
                <input
                  type="datetime-local"
                  value={baseDate}
                  onChange={(e) => setBaseDate(e.target.value)}
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

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Interval
                </label>
                <input
                  type="number"
                  value={interval}
                  onChange={(e) => setInterval(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
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
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
              onClick={handleCalculate}
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
            <div className="p-4 bg-blue-50 rounded-md">
              <h2 className="text-lg font-semibold mb-2">Result:</h2>
              <p className="text-sm">{result}</p>
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
              <li>Add or subtract time intervals from a base date</li>
              <li>Supports years, months, weeks, days, hours, minutes, seconds</li>
              <li>Time zone adjustments</li>
              <li>Customizable output format</li>
              <li>Use "Now" for current date/time</li>
              <li>Click "Calculate" to see the result</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default DateAdder;