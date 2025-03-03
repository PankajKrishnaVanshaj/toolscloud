'use client';

import React, { useState, useEffect } from 'react';

const TimeZoneSyncTool = () => {
  const [timeZones, setTimeZones] = useState([
    { id: 1, zone: Intl.DateTimeFormat().resolvedOptions().timeZone },
  ]);
  const [baseTime, setBaseTime] = useState(new Date().toISOString().slice(0, 16));
  const [formatOptions, setFormatOptions] = useState({
    date: true,
    time: true,
    seconds: true,
    hour12: true,
    timeZoneName: 'short',
  });
  const [updateInterval, setUpdateInterval] = useState(true);

  // Available time zones
  const availableTimeZones = Intl.supportedValuesOf('timeZone');

  const formatTime = (date, timeZone) => {
    const options = {
      timeZone,
      year: formatOptions.date ? 'numeric' : undefined,
      month: formatOptions.date ? 'long' : undefined,
      day: formatOptions.date ? 'numeric' : undefined,
      hour: formatOptions.time ? '2-digit' : undefined,
      minute: formatOptions.time ? '2-digit' : undefined,
      second: formatOptions.seconds ? '2-digit' : undefined,
      hour12: formatOptions.hour12,
      timeZoneName: formatOptions.timeZoneName !== 'none' ? formatOptions.timeZoneName : undefined,
    };
    return new Intl.DateTimeFormat('en-US', options).format(new Date(date));
  };

  const addTimeZone = () => {
    const newId = Math.max(...timeZones.map(tz => tz.id), 0) + 1;
    setTimeZones([...timeZones, { id: newId, zone: 'UTC' }]);
  };

  const removeTimeZone = (id) => {
    if (timeZones.length > 1) {
      setTimeZones(timeZones.filter(tz => tz.id !== id));
    }
  };

  const updateTimeZone = (id, newZone) => {
    setTimeZones(timeZones.map(tz => 
      tz.id === id ? { ...tz, zone: newZone } : tz
    ));
  };

  const syncToNow = () => {
    setBaseTime(new Date().toISOString().slice(0, 16));
  };

  useEffect(() => {
    if (updateInterval) {
      const interval = setInterval(() => {
        setBaseTime(new Date().toISOString().slice(0, 16));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [updateInterval]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Time Zone Sync Tool
        </h1>

        <div className="grid gap-6">
          {/* Base Time Input */}
          <div className="grid gap-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Base Time
                </label>
                <input
                  type="datetime-local"
                  value={baseTime}
                  onChange={(e) => setBaseTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={syncToNow}
                className="mt-6 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Sync to Now
              </button>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={updateInterval}
                onChange={(e) => setUpdateInterval(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="text-sm font-medium text-gray-700">
                Update every second
              </label>
            </div>
          </div>

          {/* Time Zone List */}
          <div className="grid gap-4">
            <h2 className="text-lg font-semibold">Time Zones</h2>
            {timeZones.map((tz) => (
              <div key={tz.id} className="flex items-center gap-4 p-2 bg-gray-50 rounded-md">
                <select
                  value={tz.zone}
                  onChange={(e) => updateTimeZone(tz.id, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {availableTimeZones.map((zone) => (
                    <option key={zone} value={zone}>{zone}</option>
                  ))}
                </select>
                <div className="flex-1 text-sm">
                  {formatTime(baseTime, tz.zone)}
                </div>
                <button
                  onClick={() => removeTimeZone(tz.id)}
                  disabled={timeZones.length === 1}
                  className="px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-red-300"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              onClick={addTimeZone}
              className="mt-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              Add Time Zone
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
                  onChange={(e) => setFormatOptions({ ...formatOptions, date: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                Include Date
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formatOptions.time}
                  onChange={(e) => setFormatOptions({ ...formatOptions, time: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                Include Time
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formatOptions.seconds}
                  onChange={(e) => setFormatOptions({ ...formatOptions, seconds: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                Include Seconds
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formatOptions.hour12}
                  onChange={(e) => setFormatOptions({ ...formatOptions, hour12: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                Use 12-Hour Format
              </label>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Time Zone Display:</label>
                <select
                  value={formatOptions.timeZoneName}
                  onChange={(e) => setFormatOptions({ ...formatOptions, timeZoneName: e.target.value })}
                  className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="none">None</option>
                  <option value="short">Short (e.g., EST)</option>
                  <option value="long">Long (e.g., Eastern Standard Time)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-6 text-sm text-gray-600">
          <details>
            <summary className="cursor-pointer font-medium">Features & Usage</summary>
            <ul className="list-disc list-inside mt-2">
              <li>Synchronize time across multiple time zones</li>
              <li>Real-time updates (toggleable)</li>
              <li>Add/remove time zones dynamically</li>
              <li>Customizable time format</li>
              <li>Use "Sync to Now" for current time</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default TimeZoneSyncTool;