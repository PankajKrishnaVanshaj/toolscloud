'use client';

import React, { useState } from 'react';

const TimeToDecimalConverter = () => {
  const [timeInput, setTimeInput] = useState('');
  const [decimalOutput, setDecimalOutput] = useState('');
  const [timeZone, setTimeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [error, setError] = useState('');
  const [options, setOptions] = useState({
    format: '24h', // 24h or 12h
    seconds: false,
    rounding: 2, // Decimal places
  });

  // Time zones
  const timeZones = Intl.supportedValuesOf('timeZone');

  const parseTimeToDecimal = (timeStr, is12h = false) => {
    const regex = is12h
      ? /^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?$/i
      : /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/;
    const match = timeStr.match(regex);
    if (!match) {
      setError('Invalid time format. Use HH:MM[:SS] or HH:MM:SS AM/PM');
      return null;
    }

    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const seconds = match[3] ? parseInt(match[3], 10) : 0;
    const period = is12h && match[4] ? match[4].toUpperCase() : null;

    if (is12h) {
      if (hours < 1 || hours > 12) {
        setError('Hours must be between 1 and 12 for 12-hour format');
        return null;
      }
      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
    } else if (hours > 23) {
      setError('Hours must be between 0 and 23 for 24-hour format');
      return null;
    }

    if (minutes > 59 || seconds > 59) {
      setError('Minutes and seconds must be between 0 and 59');
      return null;
    }

    const decimal = hours + (minutes / 60) + (seconds / 3600);
    return Number(decimal.toFixed(options.rounding));
  };

  const convertDecimalToTime = (decimal) => {
    if (isNaN(decimal)) {
      setError('Invalid decimal value');
      return '';
    }

    const totalSeconds = Math.round(decimal * 3600);
    let hours = Math.floor(totalSeconds / 3600);
    const remainingSeconds = totalSeconds % 3600;
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;

    if (options.format === '12h') {
      const period = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}${
        options.seconds ? `:${seconds.toString().padStart(2, '0')}` : ''
      } ${period}`;
    }

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}${
      options.seconds ? `:${seconds.toString().padStart(2, '0')}` : ''
    }`;
  };

  const handleTimeInput = (value) => {
    setTimeInput(value);
    setError('');
    const decimal = parseTimeToDecimal(value, options.format === '12h');
    if (decimal !== null) {
      setDecimalOutput(decimal.toString());
    } else {
      setDecimalOutput('');
    }
  };

  const handleDecimalInput = (value) => {
    setDecimalOutput(value);
    setError('');
    const decimal = parseFloat(value);
    if (!isNaN(decimal)) {
      setTimeInput(convertDecimalToTime(decimal));
    } else {
      setTimeInput('');
    }
  };

  const handleNow = () => {
    const now = new Date().toLocaleTimeString('en-US', { timeZone, hour12: options.format === '12h' });
    const timeStr = options.seconds ? now : now.slice(0, 5) + (options.format === '12h' ? now.slice(8) : '');
    setTimeInput(timeStr);
    const decimal = parseTimeToDecimal(timeStr, options.format === '12h');
    if (decimal !== null) setDecimalOutput(decimal.toString());
  };

  const handleOptionChange = (key, value) => {
    setOptions(prev => {
      const newOptions = { ...prev, [key]: value };
      if (timeInput) {
        const decimal = parseTimeToDecimal(timeInput, newOptions.format === '12h');
        if (decimal !== null) setDecimalOutput(decimal.toString());
      } else if (decimalOutput) {
        setTimeInput(convertDecimalToTime(parseFloat(decimalOutput)));
      }
      return newOptions;
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Time to Decimal Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4">
            <div className="grid gap-2">
              <label className="block text-sm font-medium text-gray-700">
                Time (HH:MM[:SS] or HH:MM:SS AM/PM)
              </label>
              <input
                type="text"
                value={timeInput}
                onChange={(e) => handleTimeInput(e.target.value)}
                placeholder={options.format === '12h' ? '12:00 PM' : '12:00'}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid gap-2">
              <label className="block text-sm font-medium text-gray-700">
                Decimal Hours
              </label>
              <input
                type="number"
                value={decimalOutput}
                onChange={(e) => handleDecimalInput(e.target.value)}
                placeholder="e.g., 12.5"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-between items-center">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time Zone
                </label>
                <select
                  value={timeZone}
                  onChange={(e) => setTimeZone(e.target.value)}
                  className="w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {timeZones.map((tz) => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleNow}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Now
              </button>
            </div>
          </div>

          {/* Options Section */}
          <div className="p-4 bg-gray-50 rounded-md">
            <h2 className="text-lg font-semibold mb-2">Options</h2>
            <div className="grid gap-2 text-sm">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Time Format:</label>
                <select
                  value={options.format}
                  onChange={(e) => handleOptionChange('format', e.target.value)}
                  className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="24h">24-hour</option>
                  <option value="12h">12-hour (AM/PM)</option>
                </select>
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={options.seconds}
                  onChange={(e) => handleOptionChange('seconds', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                Include Seconds
              </label>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Decimal Places:</label>
                <select
                  value={options.rounding}
                  onChange={(e) => handleOptionChange('rounding', parseInt(e.target.value))}
                  className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                </select>
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
              <li>Convert time (HH:MM[:SS]) to decimal hours and back</li>
              <li>Supports 24-hour and 12-hour (AM/PM) formats</li>
              <li>Time zone adjustment for "Now" functionality</li>
              <li>Customizable precision and seconds inclusion</li>
              <li>Examples: "14:30" → 14.5, "2:45 PM" → 14.75</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default TimeToDecimalConverter;