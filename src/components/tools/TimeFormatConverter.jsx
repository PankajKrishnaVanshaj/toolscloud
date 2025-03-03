'use client';

import React, { useState, useEffect } from 'react';

const TimeFormatConverter = () => {
  const [inputValue, setInputValue] = useState('');
  const [inputFormat, setInputFormat] = useState('iso');
  const [timeZone, setTimeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [customFormat, setCustomFormat] = useState('HH:mm:ss');
  const [output, setOutput] = useState({});
  const [error, setError] = useState('');

  // Supported input formats
  const formats = {
    iso: 'ISO 8601 (e.g., 2025-03-02T14:30:00Z)',
    '12h': '12-Hour (e.g., 02:30:00 PM)',
    '24h': '24-Hour (e.g., 14:30:00)',
    unix: 'UNIX Timestamp (e.g., 1743592200)',
    custom: 'Custom Format',
  };

  // Time zones
  const timeZones = Intl.supportedValuesOf('timeZone');

  // Parse input based on selected format
  const parseInput = (value, format) => {
    try {
      let date;
      switch (format) {
        case 'iso':
          date = new Date(value);
          break;
        case '12h':
          date = new Date(`1970-01-01 ${value}`);
          break;
        case '24h':
          date = new Date(`1970-01-01 ${value}`);
          break;
        case 'unix':
          date = new Date(parseInt(value) * 1000);
          break;
        case 'custom':
          // Simple custom format parser (assumes HH:mm:ss or similar)
          const [hours, minutes, seconds] = value.split(':').map(Number);
          date = new Date();
          date.setHours(hours || 0, minutes || 0, seconds || 0, 0);
          break;
        default:
          throw new Error('Unsupported format');
      }
      if (isNaN(date.getTime())) throw new Error('Invalid time');
      return date;
    } catch (err) {
      setError(`Invalid input: ${err.message}`);
      return null;
    }
  };

  // Convert to various formats
  const convertTime = (date) => {
    if (!date) return {};

    const iso = date.toISOString();
    const options = { timeZone, hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' };
    const options24 = { timeZone, hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' };

    const customFormatOutput = customFormat
      .replace('HH', String(date.getHours()).padStart(2, '0'))
      .replace('hh', String(date.getHours() % 12 || 12).padStart(2, '0'))
      .replace('mm', String(date.getMinutes()).padStart(2, '0'))
      .replace('ss', String(date.getSeconds()).padStart(2, '0'))
      .replace('A', date.getHours() >= 12 ? 'PM' : 'AM')
      .replace('a', date.getHours() >= 12 ? 'pm' : 'am');

    return {
      iso,
      '12h': new Intl.DateTimeFormat('en-US', options).format(date),
      '24h': new Intl.DateTimeFormat('en-US', options24).format(date),
      unix: Math.floor(date.getTime() / 1000),
      custom: customFormatOutput,
    };
  };

  const handleInputChange = (value) => {
    setInputValue(value);
    setError('');
    const date = parseInput(value, inputFormat);
    setOutput(date ? convertTime(date) : {});
  };

  const handleNow = () => {
    const now = new Date();
    const converted = convertTime(now);
    setInputValue(converted[inputFormat]);
    setOutput(converted);
    setError('');
  };

  useEffect(() => {
    handleInputChange(inputValue);
  }, [timeZone, customFormat, inputFormat]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Time Format Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4">
            <div className="grid gap-2">
              <label className="block text-sm font-medium text-gray-700">
                Input Time
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => handleInputChange(e.target.value)}
                  placeholder={`Enter time in ${formats[inputFormat]} format`}
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
                  Input Format
                </label>
                <select
                  value={inputFormat}
                  onChange={(e) => setInputFormat(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(formats).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
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
            </div>

            {inputFormat === 'custom' && (
              <div className="grid gap-2">
                <label className="block text-sm font-medium text-gray-700">
                  Custom Format
                </label>
                <input
                  type="text"
                  value={customFormat}
                  onChange={(e) => setCustomFormat(e.target.value)}
                  placeholder="e.g., HH:mm:ss or hh:mm A"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500">
                  Use: HH (24h), hh (12h), mm (minutes), ss (seconds), A (AM/PM), a (am/pm)
                </p>
              </div>
            )}
          </div>

          {/* Output Section */}
          {Object.keys(output).length > 0 && (
            <div className="p-4 bg-gray-50 rounded-md">
              <h2 className="text-lg font-semibold mb-2">Converted Times:</h2>
              <div className="grid gap-2 text-sm">
                <p><span className="font-medium">ISO 8601:</span> {output.iso}</p>
                <p><span className="font-medium">12-Hour:</span> {output['12h']}</p>
                <p><span className="font-medium">24-Hour:</span> {output['24h']}</p>
                <p><span className="font-medium">UNIX Timestamp:</span> {output.unix}</p>
                {inputFormat === 'custom' && (
                  <p><span className="font-medium">Custom:</span> {output.custom}</p>
                )}
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
              <li>Convert between ISO 8601, 12/24-hour, UNIX, and custom formats</li>
              <li>Supports time zone adjustments</li>
              <li>Custom format with HH:mm:ss or hh:mm A syntax</li>
              <li>Use "Now" for current time</li>
              <li>Real-time preview on input change</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default TimeFormatConverter;