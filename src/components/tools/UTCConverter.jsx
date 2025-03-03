'use client';

import React, { useState, useEffect } from 'react';

const UTCConverter = () => {
  const [utcTime, setUtcTime] = useState(new Date().toISOString().slice(0, 16));
  const [localTime, setLocalTime] = useState('');
  const [timeZone, setTimeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [timestamp, setTimestamp] = useState(Math.floor(Date.now() / 1000));
  const [formatOptions, setFormatOptions] = useState({
    date: true,
    time: true,
    seconds: true,
    milliseconds: false,
    timeZoneName: 'short',
  });
  const [error, setError] = useState('');
  const [liveUpdate, setLiveUpdate] = useState(true);

  // Time zones
  const timeZones = Intl.supportedValuesOf('timeZone');

  const formatDate = (date, tz, isUTC = false) => {
    const options = {
      timeZone: isUTC ? 'UTC' : tz,
      year: formatOptions.date ? 'numeric' : undefined,
      month: formatOptions.date ? '2-digit' : undefined,
      day: formatOptions.date ? '2-digit' : undefined,
      hour: formatOptions.time ? '2-digit' : undefined,
      minute: formatOptions.time ? '2-digit' : undefined,
      second: formatOptions.seconds ? '2-digit' : undefined,
      fractionalSecondDigits: formatOptions.milliseconds ? 3 : undefined,
      timeZoneName: formatOptions.timeZoneName !== 'none' ? formatOptions.timeZoneName : undefined,
      hour12: true,
    };
    return new Intl.DateTimeFormat('en-US', options).format(date);
  };

  const updateTimes = () => {
    try {
      const utcDate = new Date(utcTime + ':00Z'); // Add seconds to make it ISO compliant
      if (isNaN(utcDate.getTime())) throw new Error('Invalid UTC time');

      setUtcTime(utcDate.toISOString().slice(0, 16));
      setLocalTime(formatDate(utcDate, timeZone));
      setTimestamp(Math.floor(utcDate.getTime() / 1000));
      setError('');
    } catch (err) {
      setError(`Error: ${err.message}`);
      setLocalTime('');
      setTimestamp('');
    }
  };

  useEffect(() => {
    updateTimes();
    if (liveUpdate) {
      const interval = setInterval(() => {
        const now = new Date();
        setUtcTime(now.toISOString().slice(0, 16));
        updateTimes();
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [utcTime, timeZone, formatOptions, liveUpdate]);

  const handleUTCTime = (value) => {
    setUtcTime(value);
    updateTimes();
  };

  const handleLocalTime = (value) => {
    setLocalTime(value);
    try {
      const localDate = new Date(value);
      if (isNaN(localDate.getTime())) throw new Error('Invalid local time');
      const utcDate = new Date(localDate.toLocaleString('en-US', { timeZone: 'UTC' }));
      setUtcTime(utcDate.toISOString().slice(0, 16));
      setTimestamp(Math.floor(utcDate.getTime() / 1000));
      setError('');
    } catch (err) {
      setError(`Error: ${err.message}`);
      setUtcTime('');
      setTimestamp('');
    }
  };

  const handleTimestamp = (value) => {
    setTimestamp(value);
    try {
      const date = new Date(parseInt(value) * 1000);
      if (isNaN(date.getTime())) throw new Error('Invalid timestamp');
      setUtcTime(date.toISOString().slice(0, 16));
      setLocalTime(formatDate(date, timeZone));
      setError('');
    } catch (err) {
      setError(`Error: ${err.message}`);
      setUtcTime('');
      setLocalTime('');
    }
  };

  const handleNow = () => {
    const now = new Date();
    setUtcTime(now.toISOString().slice(0, 16));
    updateTimes();
  };

  const handleFormatChange = (key, value) => {
    setFormatOptions(prev => {
      const newOptions = { ...prev, [key]: value };
      updateTimes();
      return newOptions;
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          UTC Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4">
            <div className="grid gap-2">
              <label className="block text-sm font-medium text-gray-700">
                UTC Time
              </label>
              <input
                type="datetime-local"
                value={utcTime}
                onChange={(e) => handleUTCTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid gap-2">
              <label className="block text-sm font-medium text-gray-700">
                Local Time
              </label>
              <input
                type="text"
                value={localTime}
                onChange={(e) => handleLocalTime(e.target.value)}
                placeholder="e.g., March 2, 2025, 07:00 AM EST"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid gap-2">
              <label className="block text-sm font-medium text-gray-700">
                Unix Timestamp (seconds)
              </label>
              <input
                type="number"
                value={timestamp}
                onChange={(e) => handleTimestamp(e.target.value)}
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

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={liveUpdate}
                onChange={(e) => setLiveUpdate(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="text-sm font-medium text-gray-700">
                Live Update
              </label>
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
              <li>Convert between UTC, local time, and Unix timestamp</li>
              <li>Supports all time zones</li>
              <li>Live updates (toggleable)</li>
              <li>Customizable output format</li>
              <li>Use "Now" for current time</li>
              <li>Input UTC as datetime, local time as text, or timestamp as seconds</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default UTCConverter;