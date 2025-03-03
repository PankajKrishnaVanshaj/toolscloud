'use client';

import React, { useState } from 'react';

const ISO8601Converter = () => {
  const [isoString, setIsoString] = useState('');
  const [humanReadable, setHumanReadable] = useState('');
  const [timeZone, setTimeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [error, setError] = useState('');
  const [formatOptions, setFormatOptions] = useState({
    date: true,
    time: true,
    seconds: true,
    milliseconds: false,
    timeZoneName: 'short',
  });

  // Time zones
  const timeZones = Intl.supportedValuesOf('timeZone');

  const validateAndParseISO = (input) => {
    try {
      const date = new Date(input);
      if (isNaN(date.getTime())) throw new Error('Invalid ISO 8601 string');
      return date;
    } catch (err) {
      setError(`Invalid ISO 8601 format: ${err.message}`);
      return null;
    }
  };

  const convertToISO = (date) => {
    if (!date) return '';
    const options = {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: formatOptions.time ? '2-digit' : undefined,
      minute: formatOptions.time ? '2-digit' : undefined,
      second: formatOptions.seconds ? '2-digit' : undefined,
      fractionalSecondDigits: formatOptions.milliseconds ? 3 : undefined,
    };
    const iso = date.toISOString();
    const offset = date.toLocaleString('en-US', { timeZone, timeZoneName: 'short' }).split(' ').pop();
    return formatOptions.timeZoneName === 'offset' ? `${iso.split('.')[0]}[${offset}]` : iso;
  };

  const convertToHumanReadable = (date) => {
    if (!date) return '';
    const options = {
      timeZone,
      year: formatOptions.date ? 'numeric' : undefined,
      month: formatOptions.date ? 'long' : undefined,
      day: formatOptions.date ? 'numeric' : undefined,
      hour: formatOptions.time ? '2-digit' : undefined,
      minute: formatOptions.time ? '2-digit' : undefined,
      second: formatOptions.seconds ? '2-digit' : undefined,
      fractionalSecondDigits: formatOptions.milliseconds ? 3 : undefined,
      timeZoneName: formatOptions.timeZoneName !== 'none' ? formatOptions.timeZoneName : undefined,
      hour12: true,
    };
    return new Intl.DateTimeFormat('en-US', options).format(date);
  };

  const handleISOInput = (value) => {
    setIsoString(value);
    setError('');
    const date = validateAndParseISO(value);
    if (date) {
      setHumanReadable(convertToHumanReadable(date));
    } else {
      setHumanReadable('');
    }
  };

  const handleHumanInput = (value) => {
    setHumanReadable(value);
    setError('');
    try {
      const date = new Date(value);
      if (isNaN(date.getTime())) throw new Error('Invalid date');
      setIsoString(convertToISO(date));
    } catch {
      setIsoString('');
      setError('Invalid human-readable date format');
    }
  };

  const handleNow = () => {
    const now = new Date();
    setIsoString(convertToISO(now));
    setHumanReadable(convertToHumanReadable(now));
    setError('');
  };

  const handleFormatChange = (key, value) => {
    setFormatOptions(prev => {
      const newOptions = { ...prev, [key]: value };
      const date = validateAndParseISO(isoString) || new Date();
      setIsoString(convertToISO(date));
      setHumanReadable(convertToHumanReadable(date));
      return newOptions;
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          ISO 8601 Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4">
            <div className="grid gap-2">
              <label className="block text-sm font-medium text-gray-700">
                ISO 8601 String
              </label>
              <input
                type="text"
                value={isoString}
                onChange={(e) => handleISOInput(e.target.value)}
                placeholder="e.g., 2025-03-02T12:00:00Z"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid gap-2">
              <label className="block text-sm font-medium text-gray-700">
                Human-Readable Format
              </label>
              <input
                type="text"
                value={humanReadable}
                onChange={(e) => handleHumanInput(e.target.value)}
                placeholder="e.g., March 2, 2025, 12:00 PM"
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
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formatOptions.milliseconds}
                  onChange={(e) => handleFormatChange('milliseconds', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                Include Milliseconds
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
                  <option value="offset">Offset (e.g., -05:00)</option>
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
              <li>Convert between ISO 8601 and human-readable formats</li>
              <li>Supports all standard ISO 8601 variations</li>
              <li>Time zone adjustments</li>
              <li>Customizable output format</li>
              <li>Use "Now" for current timestamp</li>
              <li>Examples: 2025-03-02T12:00:00Z, 2025-03-02T07:00:00-05:00</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default ISO8601Converter;